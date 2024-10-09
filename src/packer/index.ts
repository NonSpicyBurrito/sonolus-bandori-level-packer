import type {
    DatabaseEngineItem,
    EngineConfiguration,
    EngineItem,
    EnginePlayData,
    EnginePreviewData,
    EngineTutorialData,
    EngineWatchData,
    LevelData,
    LevelItem,
    LocalizationText,
    PackageInfo,
    ServerInfo,
    ServerItemDetails,
    ServerItemInfo,
    ServerItemList,
    ServerLevelResultInfo,
} from '@sonolus/core'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { gzip } from 'pako'
import { toBackground } from './background'
import { toEffect } from './effect'
import { packEngine } from './engine'
import { packLevelData } from './level'
import { localize } from './localize'
import type { PackOptions } from './options'
import { toParticle } from './particle'
import { toSkin } from './skin'
import { toTag } from './tag'

export type MaybePromise<T> = T | Promise<T>

export type Resource = { type: 'raw'; data: ArrayBuffer }
export type JsonResource<T> = { type: 'json'; data: T } | Resource

export type PackCtx = PackOptions & {
    assets: typeof import('./assets')
}

export type PackEngine = (ctx: PackCtx) => MaybePromise<{
    item: Omit<
        DatabaseEngineItem,
        | 'skin'
        | 'background'
        | 'effect'
        | 'particle'
        | 'thumbnail'
        | 'playData'
        | 'watchData'
        | 'previewData'
        | 'tutorialData'
        | 'rom'
        | 'configuration'
    >
    resources: {
        thumbnail: Resource
        playData: JsonResource<EnginePlayData>
        watchData: JsonResource<EngineWatchData>
        previewData: JsonResource<EnginePreviewData>
        tutorialData: JsonResource<EngineTutorialData>
        rom?: Resource
        configuration: JsonResource<EngineConfiguration>
    }
}>

export type PackLevelData = (ctx: PackCtx) => MaybePromise<JsonResource<LevelData>>

const preloadAssets = import('./assets')

export const pack = async ({
    title,
    artists,
    author,
    rating,
    cover,
    bgm,
    preview,
    description,
    ...options
}: {
    title: string
    artists: string
    author: string
    rating: number
    cover: File | undefined
    bgm: File | undefined
    preview: File | undefined
    description: string
} & PackOptions) => {
    const zip = new JSZip()

    const addResource = async (resource: JsonResource<unknown>) => {
        const data =
            resource.type === 'raw'
                ? resource.data
                : gzip(JSON.stringify(resource.data), { level: 9 })

        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', data)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')

        zip.file(`sonolus/repository/${hash}`, data)

        return {
            hash,
            url: `/sonolus/repository/${hash}`,
        }
    }

    const addFile = async (file?: File) => {
        if (!file) return {}

        return await addResource({ type: 'raw', data: await file.arrayBuffer() })
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    const addEndpoint = <T>(path: string, json: T) => {
        zip.file(`sonolus${path}`, JSON.stringify(json))
    }

    const addEmptyItems = (type: string) => {
        addEndpoint<ServerItemInfo>(`/${type}/info`, {
            sections: [],
        })

        addEndpoint<ServerItemList<unknown>>(`/${type}/list`, {
            pageCount: 0,
            items: [],
        })
    }

    const addItems = <T extends { name: string; description?: LocalizationText }, U>(
        type: string,
        databaseItems: T[],
        toItem: (databaseItem: T) => U,
        name: string,
    ) => {
        const items: U[] = []
        let foundItem: U | undefined

        for (const databaseItem of databaseItems) {
            const item = toItem(databaseItem)
            items.push(item)

            if (databaseItem.name === name) foundItem = item

            addEndpoint<ServerItemDetails<U>>(`/${type}/${databaseItem.name}`, {
                item,
                description: databaseItem.description && localize(databaseItem.description),
                actions: [],
                hasCommunity: false,
                leaderboards: [],
                sections: [],
            })
        }

        addEndpoint<ServerItemInfo>(`/${type}/info`, {
            sections: [],
        })

        addEndpoint<ServerItemList<U>>(`/${type}/list`, {
            pageCount: 1,
            items,
        })

        if (!foundItem) throw new Error(`Unexpected "${name}" not found in ${type}`)
        return foundItem
    }

    const addItem = <T extends { name: string }>(
        type: string,
        item: T,
        description?: LocalizationText,
    ) => {
        addEndpoint<ServerItemDetails<unknown>>(`/${type}/${item.name}`, {
            item,
            description: description && localize(description),
            actions: [],
            hasCommunity: false,
            leaderboards: [],
            sections: [],
        })

        addEndpoint<ServerItemInfo>(`/${type}/info`, {
            sections: [],
        })

        addEndpoint<ServerItemList<unknown>>(`/${type}/list`, {
            pageCount: 1,
            items: [item],
        })

        return item
    }

    const assets = await preloadAssets

    for (const { filename, buffer } of assets.repository) {
        zip.file(`sonolus/repository/${filename}`, buffer)
    }

    addEndpoint<PackageInfo>('/package', {
        shouldUpdate: false,
    })

    addEndpoint<ServerInfo>('/info', {
        title: 'Sonolus Level Packer',
        buttons: [],
        configuration: {
            options: [],
        },
    })

    addEmptyItems('posts')
    addEmptyItems('playlists')
    addEmptyItems('replays')
    addEmptyItems('rooms')

    const skin = addItems('skins', assets.db.skins, toSkin, 'pixel')
    const background = addItems('backgrounds', assets.db.backgrounds, toBackground, 'darkblue')
    const effect = addItems('effects', assets.db.effects, toEffect, '8bit')
    const particle = addItems('particles', assets.db.particles, toParticle, 'pixel')

    const ctx = { ...options, assets }

    const engine = await packEngine(ctx)
    const engineItem = addItem<EngineItem>(
        'engines',
        {
            name: engine.item.name,
            version: engine.item.version,
            title: localize(engine.item.title),
            subtitle: localize(engine.item.subtitle),
            author: localize(engine.item.author),
            tags: engine.item.tags.map(toTag),
            skin,
            background,
            effect,
            particle,
            thumbnail: await addResource(engine.resources.thumbnail),
            playData: await addResource(engine.resources.playData),
            watchData: await addResource(engine.resources.watchData),
            previewData: await addResource(engine.resources.previewData),
            tutorialData: await addResource(engine.resources.tutorialData),
            rom: engine.resources.rom && (await addResource(engine.resources.rom)),
            configuration: await addResource(engine.resources.configuration),
        },
        engine.item.description,
    )

    const levelData = await packLevelData(ctx)
    addItem<LevelItem>(
        'levels',
        {
            name: `local-${crypto.randomUUID()}`,
            version: 1,
            rating,
            title: title || 'Unknown',
            artists: artists || 'Unknown',
            author: author || 'Unknown',
            tags: [],
            engine: engineItem,
            useSkin: { useDefault: true },
            useBackground: { useDefault: true },
            useEffect: { useDefault: true },
            useParticle: { useDefault: true },
            cover: await addFile(cover),
            bgm: await addFile(bgm),
            preview: await addFile(preview),
            data: await addResource(levelData),
        },
        { en: description },
    )

    addEndpoint<ServerLevelResultInfo>('/levels/result/info', {})

    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 9,
        },
    })

    saveAs(blob, 'level.scp')
}

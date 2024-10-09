import type { DatabaseSkinItem, SkinItem } from '@sonolus/core'
import { localize } from './localize'
import { toTag } from './tag'

export const toSkin = (databaseSkin: DatabaseSkinItem): SkinItem => ({
    name: databaseSkin.name,
    version: databaseSkin.version,
    title: localize(databaseSkin.title),
    subtitle: localize(databaseSkin.subtitle),
    author: localize(databaseSkin.author),
    tags: databaseSkin.tags.map(toTag),
    thumbnail: databaseSkin.thumbnail,
    data: databaseSkin.data,
    texture: databaseSkin.texture,
})

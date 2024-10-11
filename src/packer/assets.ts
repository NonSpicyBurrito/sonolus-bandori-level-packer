import type { Database } from '@sonolus/core'
import _db from '@sonolus/free-pack/pack/db.json'

export const db = _db as Database

export const repository = Object.entries(
    import.meta.glob('@sonolus/free-pack/pack/repository/*', {
        query: '?arraybuffer',
        import: 'default',
        eager: true,
    }),
).map(([path, buffer]) => ({
    filename: path.slice(path.lastIndexOf('/') + 1),
    buffer: buffer as ArrayBuffer,
}))

export { default as engineConfiguration } from 'sonolus-bandori-engine/EngineConfiguration?arraybuffer'
export { default as enginePlayData } from 'sonolus-bandori-engine/EnginePlayData?arraybuffer'
export { default as enginePreviewData } from 'sonolus-bandori-engine/EnginePreviewData?arraybuffer'
export { default as engineThumbnail } from 'sonolus-bandori-engine/EngineThumbnail?arraybuffer'
export { default as engineTutorialData } from 'sonolus-bandori-engine/EngineTutorialData?arraybuffer'
export { default as engineWatchData } from 'sonolus-bandori-engine/EngineWatchData?arraybuffer'

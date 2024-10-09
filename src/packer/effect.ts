import type { DatabaseEffectItem, EffectItem } from '@sonolus/core'
import { localize } from './localize'
import { toTag } from './tag'

export const toEffect = (databaseEffect: DatabaseEffectItem): EffectItem => ({
    name: databaseEffect.name,
    version: databaseEffect.version,
    title: localize(databaseEffect.title),
    subtitle: localize(databaseEffect.subtitle),
    author: localize(databaseEffect.author),
    tags: databaseEffect.tags.map(toTag),
    thumbnail: databaseEffect.thumbnail,
    data: databaseEffect.data,
    audio: databaseEffect.audio,
})

import type { BackgroundItem, DatabaseBackgroundItem } from '@sonolus/core'
import { localize } from './localize'
import { toTag } from './tag'

export const toBackground = (databaseBackground: DatabaseBackgroundItem): BackgroundItem => ({
    name: databaseBackground.name,
    version: databaseBackground.version,
    title: localize(databaseBackground.title),
    subtitle: localize(databaseBackground.subtitle),
    author: localize(databaseBackground.author),
    tags: databaseBackground.tags.map(toTag),
    thumbnail: databaseBackground.thumbnail,
    data: databaseBackground.data,
    image: databaseBackground.image,
    configuration: databaseBackground.configuration,
})

import type { DatabaseParticleItem, ParticleItem } from '@sonolus/core'
import { localize } from './localize'
import { toTag } from './tag'

export const toParticle = (databaseParticle: DatabaseParticleItem): ParticleItem => ({
    name: databaseParticle.name,
    version: databaseParticle.version,
    title: localize(databaseParticle.title),
    subtitle: localize(databaseParticle.subtitle),
    author: localize(databaseParticle.author),
    tags: databaseParticle.tags.map(toTag),
    thumbnail: databaseParticle.thumbnail,
    data: databaseParticle.data,
    texture: databaseParticle.texture,
})

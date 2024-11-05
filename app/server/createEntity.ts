import { createServerFn } from '@tanstack/start'
import { EntityType, VotableConfig, VotableType } from '../models'
import { dbUtils } from './dbUtils'

type CreateEntityInput = {
  entityDetails: {
    type: EntityType
  title: string
  description?: string
  userId: string
  },
  votables: {
    type: VotableType,
    label: string,
    config: VotableConfig
  }[]
}

export const createEntityFn = createServerFn('POST', async (input: CreateEntityInput) => {
  try {
    const entity = dbUtils.createEntity({
      type: input.entityDetails.type,
      title: input.entityDetails.title,
      description: input.entityDetails.description,
      userId: input.entityDetails.userId
    })

    for (const votable of input.votables) {
        dbUtils.createVotable({
            entityId: entity.id,
            type: votable.type,
            config: votable.config,
            label: votable.label
        })
    }

    return entity
  } catch (error) {
    console.error('Error creating entity:', error)
    throw new Error('Failed to create entity')
  }
})

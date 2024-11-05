import { createServerFn } from '@tanstack/start'
import { VotableConfig, VotableType } from '../models'
import { dbUtils } from './dbUtils'

export type CreateVotableInput = {
  entityId: string
  votables: {
    type: VotableType
    config: VotableConfig
    label: string
  }[]
}

export const createVotableFn = createServerFn('POST', async (input: CreateVotableInput) => {
  try {
    const createdVotables = input.votables.map(votable => 
      dbUtils.createVotable({
        entityId: input.entityId,
        type: votable.type,
        config: votable.config,
        label: votable.label
      })
    )

    return createdVotables
  } catch (error) {
    console.error('Error creating votables:', error)
    throw new Error('Failed to create votables')
  }
})

import { createServerFn } from '@tanstack/start'
import { dbUtils } from './dbUtils'

type CreateVoteInput = {
  votableId: string
  userId: string
  value: string
}

export const createVoteFn = createServerFn('POST', async (input: CreateVoteInput) => {
  try {
    const vote = dbUtils.createVote({
      votableId: input.votableId,
      userId: input.userId,
      value: input.value
    })

    return vote
  } catch (error) {
    console.error('Error creating vote:', error)
    throw new Error('Failed to create vote')
  }
})

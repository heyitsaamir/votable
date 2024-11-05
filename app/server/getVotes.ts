import { createServerFn } from '@tanstack/start'
import { dbUtils } from './dbUtils'

type GetVotesParams = {
  entityId: string
  userId: string
}

export const getVotesFn = createServerFn('POST',async ({ entityId, userId }: GetVotesParams) => {
    return dbUtils.getVotesForEntity(entityId, userId)
  }
)

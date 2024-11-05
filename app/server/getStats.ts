import { createServerFn } from '@tanstack/start'
import { EntityStats } from '../models'
import { dbUtils } from './dbUtils'

type GetStatsInput = {
  entityId: string
}

export const getStatsFn = createServerFn('GET', async (input: GetStatsInput): Promise<EntityStats> => {
  try {
    const stats = dbUtils.getEntityStats(input.entityId)
    
    if (!stats) {
      throw new Error('Failed to get entity stats')
    }

    return stats
  } catch (error) {
    console.error('Error getting entity stats:', error)
    throw new Error('Failed to get entity stats')
  }
})

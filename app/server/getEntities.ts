import { createServerFn } from '@tanstack/start'
import { dbUtils } from './dbUtils'

export const getEntitiesFn = createServerFn('POST', async () => {
  try {
    return dbUtils.getEntities()
    } catch (error) {
      console.error('Failed to fetch entities:', error)
      throw new Error('Failed to fetch entities')
    }
  })

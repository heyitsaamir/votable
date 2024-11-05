import { createServerFn } from '@tanstack/start'
import { Entity, Votable } from '../models'
import { dbUtils } from './dbUtils'

type GetEntityParams = {
  entityId: string
  userId?: string
}

export const getEntityFn = createServerFn('POST',async ({ entityId, userId }: GetEntityParams): Promise<Entity & { votables: Votable[] } | null> => {
    return (await dbUtils.getEntityWithDetails(entityId) ?? null)
  }
)

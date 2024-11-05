import { Entity, EntityStats, User, Votable, VotableType, Vote } from '../models';
import { db } from './db';

export const dbUtils = {
  // User operations
  createUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    // First check if user exists
    const existingUser = db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).get(user.email) as any;

    if (existingUser) {
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        createdAt: existingUser.created_at,
        updatedAt: existingUser.updated_at
      } as User;
    }

    // If no existing user, create new one
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    const id = crypto.randomUUID();
    const result = stmt.run(id, user.email, user.name);
    if (!result.changes) {
      throw new Error('Failed to create user')
    }

    const dbRow: any = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(id)

    const addedUser: User = {
      id: dbRow.id,
      email: dbRow.email,
      name: dbRow.name,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    }

    return addedUser
  },

  // Entity operations
  createEntity: (entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO entities (id, type, title, description, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const id = crypto.randomUUID();
    const result = stmt.run(id, entity.type, entity.title, entity.description, entity.userId);
    if (!result.changes) {
      throw new Error('Failed to create entity')
    }

    const dbRow: any = db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `).get(id)

    const addedEntity: Entity = {
      id: dbRow.id,
      type: dbRow.type,
      title: dbRow.title,
      description: dbRow.description,
      userId: dbRow.user_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    }

    return addedEntity
  },

  // Votable operations
  createVotable: (votable: Omit<Votable, 'id' | 'created_at' | 'updated_at'>) => {
    const stmt = db.prepare(`
      INSERT INTO votables (id, entity_id, type, config, label, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const id = crypto.randomUUID();
    const result = stmt.run(
      id, 
      votable.entityId, 
      votable.type, 
      JSON.stringify(votable.config), 
      votable.label
    );
    if (!result.changes) {
      throw new Error('Failed to create votable')
    }

    const dbRow: any = db.prepare(`
      SELECT * FROM votables WHERE id = ?
    `).get(id)

    const addedVotable: Votable = {
      id: dbRow.id,
      entityId: dbRow.entity_id,
      type: dbRow.type,
      config: dbRow.config,
      label: dbRow.label,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    }

    return addedVotable
  },

  // Vote operations
  createVote: (vote: Omit<Vote, 'id' | 'created_at'>) => {
    // First check if vote exists
    const existingVote = db.prepare(`
      SELECT * FROM votes 
      WHERE votable_id = ? AND user_id = ?
    `).get(vote.votableId, vote.userId) as any;

    if (existingVote) {
      // Update existing vote
      const stmt = db.prepare(`
        UPDATE votes 
        SET value = ?, created_at = datetime('now')
        WHERE votable_id = ? AND user_id = ?
      `);
      const result = stmt.run(vote.value, vote.votableId, vote.userId);
      if (!result.changes) {
        throw new Error('Failed to update vote')
      }

      return {
        id: existingVote.id,
        votableId: existingVote.votable_id,
        userId: existingVote.user_id,
        value: vote.value,
        createdAt: new Date()
      } as Vote;
    }

    // If no existing vote, create new one
    const stmt = db.prepare(`
      INSERT INTO votes (id, votable_id, user_id, value, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    const id = crypto.randomUUID();
    const result = stmt.run(id, vote.votableId, vote.userId, vote.value);
    if (!result.changes) {
      throw new Error('Failed to create vote')
    }

    const dbRow: any = db.prepare(`
      SELECT * FROM votes WHERE id = ?
    `).get(id)

    const addedVote: Vote = {
      id: dbRow.id,
      votableId: dbRow.votable_id,
      userId: dbRow.user_id,
      value: dbRow.value,
      createdAt: dbRow.created_at
    }

    return addedVote
  },

  getEntity: (entityId: string): Entity | undefined => {
    const dbRow: any = db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `).get(entityId)

    if (!dbRow) {
      return undefined
    }

    return {
      id: dbRow.id,
      type: dbRow.type,
      title: dbRow.title,
      description: dbRow.description,
      userId: dbRow.user_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    } as Entity
  },

  getEntityWithVotables: (entityId: string) => {
    const entity = dbUtils.getEntity(entityId)
    
    if (!entity) {
      return undefined
    }

    const votables = db.prepare(`
      SELECT * FROM votables WHERE entity_id = ?
    `).all(entityId) as any[]

    return {
      ...entity,
      votables: votables.map(row => ({
        id: row.id,
        entityId: row.entity_id,
        type: row.type,
        value: row.value,
        label: row.label,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    }
  },

  // Entity methods
  getEntities: () => {
    const entities = db.prepare(`
      SELECT * FROM entities 
      ORDER BY created_at DESC
    `).all() as any[];
    return entities.map(row => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    })) as Entity[];
  },

  getEntityWithDetails: (entityId: string) => {
    const entity = dbUtils.getEntity(entityId);
    if (!entity) return undefined;

    const votables = db.prepare(`
      SELECT * FROM votables 
      WHERE entity_id = ?
    `).all(entityId) as any[];

    const user = db.prepare(`
      SELECT * FROM users 
      WHERE id = ?
    `).get(entity.userId) as any;

    return {
      ...entity,
      votables: votables.map(row => ({
        id: row.id,
        entityId: row.entity_id,
        type: row.type,
        config: JSON.parse(row.config),
        label: row.label,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })) as Votable[],
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      } as User : undefined
    }
  },

  getVotablesWithVotes: (entityId: string, userId?: string) => {
    const votables = db.prepare(`
      SELECT 
        v.*,
        votes.value as user_vote_value
      FROM votables v
      LEFT JOIN votes ON v.id = votes.votable_id 
        AND votes.user_id = ?
      WHERE v.entity_id = ?
    `).all(userId || '', entityId) as any[];

    return votables.map(row => ({
      id: row.id,
      entityId: row.entity_id,
      type: row.type,
      value: row.value,
      label: row.label,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userVote: row.user_vote_value || null
    }));
  },

  getVotesForEntity: (entityId: string, userId: string) => {
    const votes = db.prepare(`
      SELECT votes.* 
      FROM votes 
      JOIN votables ON votes.votable_id = votables.id 
      WHERE votables.entity_id = ? AND votes.user_id = ?
    `).all(entityId, userId) as any[];

    return votes.map(row => ({
      id: row.id,
      votableId: row.votable_id,
      userId: row.user_id,
      value: row.value,
      createdAt: row.created_at
    }));
  },

  getEntityStats: (entityId: string): EntityStats => {
    // Get all votables and their votes for the entity
    const votables = db.prepare(`
      SELECT 
        v.id, 
        v.type, 
        v.label,
        vt.value,
        vt.id as vote_id
      FROM votables v
      LEFT JOIN votes vt ON v.id = vt.votable_id
      WHERE v.entity_id = ?
    `).all(entityId)

    // Group votes by votable
    const votableMap = votables.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          type: row.type,
          label: row.label,
          votes: []
        }
      }
      if (row.vote_id) {
        acc[row.id].votes.push(row.value)
      }
      return acc
    }, {} as Record<string, { id: string; type: string; label: string; votes: string[] }>)

    const votableStats = Object.values(votableMap).map((votable: Votable & { votes: Vote['value'][] }) => {
      const totalVotes = votable.votes.length

      if (votable.type === VotableType.ENUM || votable.type === VotableType.BOOL) {
        const distribution = votable.votes.reduce((acc, value) => {
          acc[value] = (acc[value] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        return {
          votableId: votable.id,
          totalVotes,
          distribution
        }
      } else {
        // For NUMBER and SLIDER types
        const numericVotes = votable.votes.map(v => Number(v)).sort((a, b) => a - b)
        const sum = numericVotes.reduce((acc, val) => acc + val, 0)
        
        return {
          votableId: votable.id,
          totalVotes,
          average: totalVotes > 0 ? sum / totalVotes : 0,
          median: totalVotes > 0 ? numericVotes[Math.floor(totalVotes / 2)] : 0,
          min: totalVotes > 0 ? numericVotes[0] : 0,
          max: totalVotes > 0 ? numericVotes[totalVotes - 1] : 0
        }
      }
    })

    return {
      entityId,
      votableStats,
      updatedAt: new Date()
    }
  },
};
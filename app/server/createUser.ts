import { createServerFn } from '@tanstack/start'
import { dbUtils } from './dbUtils'

type CreateUserInput = {
  email: string
  name: string
}

export const createUserFn = createServerFn('POST', async (input: CreateUserInput) => {
  try {
    const result = dbUtils.createUser({
      email: input.email,
      name: input.name
    })

    return result
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
})

import { useServerFn } from '@tanstack/start'
import { useCallback, useEffect, useState } from 'react'
import { User } from '../../models'
import { createUserFn } from '../../server/createUser'
import { localStorageUtils } from '../localStorage'

export function useUser() {
  const [showRegistration, setShowRegistrationInner] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const createUser = useServerFn(createUserFn)

  const checkUser = useCallback(() => {
    const savedDetails = localStorageUtils.getUserDetails()
    if (savedDetails.email && savedDetails.name && savedDetails.id) {
      setUser({
        id: savedDetails.id,
        email: savedDetails.email,
        name: savedDetails.name,
        createdAt: new Date(), // These dates aren't critical for client-side usage
        updatedAt: new Date()
      })
      return true
    }
    return false
  }, [])

  const registerUser = useCallback(async (email: string, name: string) => {
    try {
      const newUser = await createUser({ email, name })
      localStorageUtils.saveUserDetails(newUser.email, newUser.name, newUser.id)
      setUser(newUser)
      setShowRegistrationInner(false)
    } catch (err) {
      console.error('Error creating user:', err)
      throw err
    }
  }, [createUser])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  const setShowRegistration = useCallback((value: boolean) => {
    checkUser()
    setShowRegistrationInner(value)
  }, [])

  return {
    user,
    showRegistration,
    setShowRegistration,
    registerUser
  }
}

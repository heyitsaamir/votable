const STORAGE_KEYS = {
  USER_DETAILS: 'userDetails',
} as const

export const localStorageUtils = {
  saveUserDetails: (email: string, name: string, id: string) => {
    localStorage.setItem(STORAGE_KEYS.USER_DETAILS, JSON.stringify({ email, name, id }))
  },

  getUserDetails: () => {
    const details = localStorage.getItem(STORAGE_KEYS.USER_DETAILS)
    if (details) {
      return JSON.parse(details) as { email: string; name: string; id: string }
    }
    return { email: '', name: '', id: '' }
  },

  clearUserDetails: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DETAILS)
  }
}

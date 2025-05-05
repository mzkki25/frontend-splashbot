// Authentication utilities

import type { TokenExchangeResponse } from "@/lib/api"

// Local storage keys
const USER_ID_KEY = "splashbot_user_id"
const ID_TOKEN_KEY = "splashbot_id_token"
const REFRESH_TOKEN_KEY = "splashbot_refresh_token"
const EXPIRES_AT_KEY = "splashbot_expires_at"

export interface AuthUser {
  userId: string
  idToken: string
  refreshToken: string
  expiresAt: number
}

// Save auth data to local storage
export const saveAuthData = (userId: string, tokenData: TokenExchangeResponse): void => {
  const expiresAt = Date.now() + Number.parseInt(tokenData.expiresIn) * 1000

  localStorage.setItem(USER_ID_KEY, userId)
  localStorage.setItem(ID_TOKEN_KEY, tokenData.idToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken)
  localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString())
}

// Get auth data from local storage
export const getAuthData = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null
  }

  const userId = localStorage.getItem(USER_ID_KEY)
  const idToken = localStorage.getItem(ID_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY)

  if (!userId || !idToken || !refreshToken || !expiresAtStr) {
    return null
  }

  return {
    userId,
    idToken,
    refreshToken,
    expiresAt: Number.parseInt(expiresAtStr),
  }
}

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const authData = getAuthData()
  if (!authData) {
    return true
  }

  // Add a 5-minute buffer to ensure we refresh before actual expiration
  const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
  return Date.now() > authData.expiresAt - bufferTime
}

// Clear auth data from local storage
export const clearAuthData = (): void => {
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(ID_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

// Refresh token if needed
export const refreshTokenIfNeeded = async (): Promise<string | null> => {
  const authData = getAuthData()

  if (!authData) {
    return null
  }

  if (!isTokenExpired()) {
    return authData.idToken
  }

  // TODO: Implement token refresh logic using Firebase Auth
  // For now, just return the current token or null if expired
  if (isTokenExpired()) {
    clearAuthData()
    return null
  }

  return authData.idToken
}

// Get current ID token
export const getIdToken = async (): Promise<string | null> => {
  return await refreshTokenIfNeeded()
}

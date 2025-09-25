"use client"

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { apiService, LoginResponse } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  country?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuth = async () => {
      console.log('=== AUTH CHECK DEBUG ===')
      console.log('Is authenticated:', apiService.isAuthenticated())
      console.log('Token exists:', !!apiService.getToken())
      
      if (apiService.isAuthenticated()) {
        try {
          console.log('Attempting to get current user...')
          const userData = await apiService.getCurrentUser()
          console.log('User data received:', userData)
          setUser(userData)
        } catch (error) {
          // Token is invalid, remove it
          console.warn('Token validation failed:', error)
          console.warn('Removing invalid token')
          apiService.removeToken()
        }
      } else {
        console.log('No authentication token found')
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response: LoginResponse = await apiService.login({ email, password })
    apiService.setToken(response.access_token)
    setUser(response.user)
  }

  const logout = () => {
    try {
      apiService.removeToken()
      setUser(null)
    } catch (error) {
      console.error('Error during logout:', error)
      // Still clear the state even if there's an error
      setUser(null)
    }
  }

  const refreshUser = async () => {
    if (apiService.isAuthenticated()) {
      try {
        const userData = await apiService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        // Token is invalid, logout
        console.warn('Token refresh failed:', error)
        logout()
      }
    }
  }

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  }), [user, isAuthenticated, isLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

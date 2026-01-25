/**
 * Authentication Context
 * Manages auth state and provides login/logout functionality
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, UserRole, LoginCredentials } from '../types'
import { authApi, ApiException } from '../services/api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (credentials: LoginCredentials) => Promise<User | null>
    logout: () => void
    error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Decode JWT token to get user info
 */
function decodeToken(token: string): User | null {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))

        return {
            id: decoded.sub,
            email: decoded.email,
            full_name: decoded.full_name || decoded.email.split('@')[0],
            role: decoded.role as UserRole,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
    } catch {
        return null
    }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload))
        const exp = decoded.exp * 1000 // Convert to milliseconds
        return Date.now() >= exp
    } catch {
        return true
    }
}

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token')

        if (token && !isTokenExpired(token)) {
            const userData = decodeToken(token)
            setUser(userData)
        } else {
            localStorage.removeItem('token')
        }

        setIsLoading(false)
    }, [])

    const login = useCallback(async (credentials: LoginCredentials): Promise<User | null> => {
        setError(null)
        setIsLoading(true)

        try {
            const response = await authApi.login(credentials)
            localStorage.setItem('token', response.access_token)

            const userData = decodeToken(response.access_token)
            setUser(userData)
            return userData
        } catch (err) {
            if (err instanceof ApiException) {
                setError(err.detail)
            } else {
                setError('Login failed. Please try again.')
            }
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('token')
        setUser(null)
        setError(null)
    }, [])

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        error,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}

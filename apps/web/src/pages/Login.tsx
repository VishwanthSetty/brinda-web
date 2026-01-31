/**
 * Login Page Component
 * Authentication form for users
 */

import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [localError, setLocalError] = useState<string | null>(null)

    const { login, error: authError } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Get redirect path from location state
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLocalError(null)

        if (!email || !password) {
            setLocalError('Please fill in all fields')
            return
        }

        setIsSubmitting(true)

        try {
            const user = await login({ email, password })

            // If explicit redirect path exists, use it
            if (from && from !== '/dashboard' && from !== '/') {
                navigate(from, { replace: true })
                return
            }

            // Otherwise redirect based on role
            if (user?.role === 'admin') {
                navigate('/dashboard', { replace: true })
            } else {
                navigate('/dashboard/tasks', { replace: true })
            }
        } catch {
            // Error is handled by AuthContext
        } finally {
            setIsSubmitting(false)
        }
    }

    const error = localError || authError

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card glass animate-fadeIn">
                    {/* Header */}
                    <div className="login-header">
                        <Link to="/" className="login-logo">
                            <img src="/brinda_only_logo.svg" alt="Logo" style={{ height: '60px', width: 'auto' }} />
                        </Link>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="login-error">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isSubmitting}
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p>
                            Don't have an account?{' '}
                            <a href="mailto:sales@brinda.com" className="login-link">
                                Contact Sales
                            </a>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

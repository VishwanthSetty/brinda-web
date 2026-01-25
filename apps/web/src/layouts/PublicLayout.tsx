/**
 * Public Layout Component
 * Layout wrapper for public pages with header and footer
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './PublicLayout.css'

export default function PublicLayout() {
    const { isAuthenticated, user, logout } = useAuth()
    const location = useLocation()

    return (
        <div className="public-layout">
            {/* Header */}
            <header className="header glass">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">Brinda Publications</span>
                    </Link>

                    <nav className="nav">
                        <Link
                            to="/"
                            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                        >
                            Products
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    Dashboard
                                </Link>
                                <div className="user-menu">
                                    <span className="user-name">{user?.email}</span>
                                    <button onClick={logout} className="btn btn-secondary">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-brand">
                        <span className="logo-icon">📚</span>
                        <span>Brinda Publications</span>
                    </div>
                    <p className="footer-text">
                        © {new Date().getFullYear()} Brinda Publications. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

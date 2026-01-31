/**
 * Public Layout Component
 * Layout wrapper for public pages with header and footer
 */

import { useState } from 'react'
import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '../data/constants'
import PublicFooter from './PublicFooter'
import WhatsAppButton from '../components/common/WhatsAppButton'
import './PublicLayout.css'

export default function PublicLayout() {
    const { isAuthenticated, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="public-layout">
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-content">
                        <div className="navbar-logo-wrapper">
                            <NavLink to="/" className="navbar-logo">
                                <div className="logo-inner">
                                    <h1 className="logo-title">
                                        Brinda Series<sup className="logo-tm">TM</sup>
                                    </h1>
                                    <div className="logo-underline"></div>
                                    <span className="logo-subtitle">
                                        Learning Simplified
                                    </span>
                                </div>
                            </NavLink>
                        </div>

                        <div className="desktop-nav">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}

                            {isAuthenticated ? (
                                <div className="user-menu-desktop">
                                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                    <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="navbar-btn"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="mobile-toggle"
                            >
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="mobile-menu">
                        <div className="mobile-nav-list">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `mobile-nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="mobile-nav-link"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="mobile-nav-link"
                                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="mobile-nav-link"
                                    style={{ color: '#0056b3' }}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>

            <PublicFooter />
            <WhatsAppButton />
        </div>
    )
}

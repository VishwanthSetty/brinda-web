/**
 * NotFound Page Component
 * 404 error page
 */

import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
    return (
        <div className="notfound-page">
            <div className="notfound-content">
                <span className="notfound-icon">📖</span>
                <h1 className="notfound-code">404</h1>
                <h2 className="notfound-title">Page Not Found</h2>
                <p className="notfound-message">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="notfound-actions">
                    <Link to="/" className="btn btn-primary btn-lg">
                        Go Home
                    </Link>
                    <Link to="/products" className="btn btn-secondary btn-lg">
                        Browse Products
                    </Link>
                </div>
            </div>
        </div>
    )
}

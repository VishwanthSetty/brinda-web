/**
 * Home Page Component
 * Landing page for public visitors
 */

import { Link } from 'react-router-dom'
import './Home.css'

const features = [
    {
        icon: '📖',
        title: 'Quality Textbooks',
        description: 'Curated educational content designed by experts for effective learning.',
    },
    {
        icon: '🎓',
        title: 'All Grade Levels',
        description: 'Comprehensive materials from primary to secondary education.',
    },
    {
        icon: '🚀',
        title: 'Digital Ready',
        description: 'Modern content with digital supplements and online resources.',
    },
    {
        icon: '🏆',
        title: 'Trusted Quality',
        description: 'Used by thousands of schools and institutions nationwide.',
    },
]

const stats = [
    { value: '500+', label: 'Books Published' },
    { value: '10K+', label: 'Schools Served' },
    { value: '1M+', label: 'Students Reached' },
    { value: '15+', label: 'Years of Excellence' },
]

export default function Home() {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container hero-content">
                    <span className="hero-badge">📚 Quality Educational</span>
                    <h1 className="hero-title">
                        Empowering Education
                        <span className="gradient-text"> Quality Publications</span>
                    </h1>
                    <p className="hero-subtitle">
                        Brinda Publications delivers comprehensive educational materials
                        that inspire learning and foster academic excellence.
                    </p>
                    <div className="hero-actions">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Browse Products
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Partner With Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Us</h2>
                        <p className="section-subtitle">
                            We're committed to providing the best educational resources for schools and students.
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature) => (
                            <div key={feature.title} className="feature-card card">
                                <span className="feature-icon">{feature.icon}</span>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass">
                        <h2 className="cta-title">Ready to Transform Education?</h2>
                        <p className="cta-subtitle">
                            Join thousands of institutions that trust Brinda Publications.
                        </p>
                        <Link to="/products" className="btn btn-primary btn-lg">
                            Explore Our Catalog
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

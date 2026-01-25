/**
 * Products Page Component
 * Public product listing page
 */

import { useState, useEffect } from 'react'
import { productsApi } from '../services/api'
import type { Product, ProductList } from '../types'
import './Products.css'

export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadProducts()
    }, [page])

    async function loadProducts() {
        setLoading(true)
        setError(null)

        try {
            const data: ProductList = await productsApi.list({
                page,
                page_size: 12,
                search: search || undefined,
            })
            setProducts(page === 1 ? data.items : [...products, ...data.items])
            setHasMore(data.has_more)
        } catch {
            setError('Failed to load products. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setPage(1)
        loadProducts()
    }

    function formatPrice(price: number, currency: string) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
        }).format(price)
    }

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Our Products</h1>
                    <p className="page-subtitle">
                        Explore our comprehensive catalog of educational materials.
                    </p>
                </div>

                {/* Search Bar */}
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="form-input search-input"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </form>

                {/* Error State */}
                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => loadProducts()} className="btn btn-secondary">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Products Grid */}
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card card">
                            <div className="product-image">
                                {product.cover_image_url ? (
                                    <img src={product.cover_image_url} alt={product.title} />
                                ) : (
                                    <div className="product-placeholder">📖</div>
                                )}
                            </div>
                            <div className="product-content">
                                <span className="product-category">{product.category}</span>
                                <h3 className="product-title">{product.title}</h3>
                                <p className="product-author">by {product.author}</p>
                                <div className="product-footer">
                                    <span className="product-price">
                                        {formatPrice(product.price, product.currency)}
                                    </span>
                                    <span className={`product-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && products.length === 0 && !error && (
                    <div className="empty-state">
                        <span className="empty-icon">📚</span>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or check back later.</p>
                    </div>
                )}

                {/* Load More */}
                {hasMore && !loading && (
                    <div className="load-more">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="btn btn-secondary btn-lg"
                        >
                            Load More Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

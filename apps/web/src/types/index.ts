/**
 * Type Definitions
 * Shared TypeScript types for the application
 */

// User Types
export type UserRole = 'admin' | 'manager' | 'sales_rep'

export interface User {
    id: string
    email: string
    full_name: string
    role: UserRole
    is_active: boolean
    created_at: string
    updated_at: string
    employee_id?: string
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthToken {
    access_token: string
    token_type: string
}

// Product Types
export interface Product {
    id: string
    title: string
    isbn: string | null
    author: string
    category: string
    price: number
    currency: string
    stock_quantity: number
    description: string | null
    cover_image_url: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ProductList {
    items: Product[]
    total: number
    page: number
    page_size: number
    has_more: boolean
}

// Analytics Types
export interface SalesSummary {
    total_revenue: number
    total_orders: number
    total_quantity: number
    average_order_value: number
    currency: string
}

export interface RegionSales {
    region: string
    total_revenue: number
    total_orders: number
    percentage: number
}

export interface ProductSales {
    product_id: string
    product_title: string
    total_revenue: number
    total_quantity: number
    percentage: number
}

export interface SalesAnalytics {
    summary: SalesSummary
    by_region: RegionSales[]
    by_product: ProductSales[]
    period_start: string
    period_end: string
}

export interface DashboardSummary {
    total_products: number
    total_users: number
    today_revenue: number
    today_orders: number
}

// API Response Types
export interface ApiError {
    detail: string
}

/**
 * API Service
 * Centralized API client for backend communication
 */

import type {
    AuthToken,
    LoginCredentials,
    ProductList,
    Product,
    SalesAnalytics,
    DashboardSummary,
    ApiError
} from '../types'
import type {
    TaskAnalyticsResponse,
    AreaWiseTasksResponse,
    SchoolCategoryResponse
} from '../types/analytics'

const API_BASE = '/api'

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
    constructor(
        public status: number,
        public detail: string
    ) {
        super(detail)
        this.name = 'ApiException'
    }
}

/**
 * Get the stored auth token
 */
function getToken(): string | null {
    return localStorage.getItem('token')
}

/**
 * Make an API request
 */
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken()

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        let detail = 'An error occurred'
        try {
            const error: ApiError = await response.json()
            detail = error.detail
        } catch {
            detail = response.statusText
        }
        throw new ApiException(response.status, detail)
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T
    }

    return response.json()
}

/**
 * Auth API
 */
export const authApi = {
    login: (credentials: LoginCredentials) =>
        request<AuthToken>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    logout: () =>
        request<{ message: string }>('/auth/logout', {
            method: 'POST',
        }),
    changePassword: (credentials: { old_password: string; new_password: string }) =>
        request<{ message: string }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    adminUpdateUser: (data: { user_id?: string; emp_id?: string; email?: string; password?: string; role?: string }) =>
        request<{ message: string }>('/auth/update-user', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
}

/**
 * Products API
 */
export const productsApi = {
    list: (params?: { page?: number; page_size?: number; category?: string; search?: string }) => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.set('page', params.page.toString())
        if (params?.page_size) searchParams.set('page_size', params.page_size.toString())
        if (params?.category) searchParams.set('category', params.category)
        if (params?.search) searchParams.set('search', params.search)

        const query = searchParams.toString()
        return request<ProductList>(`/products${query ? `?${query}` : ''}`)
    },

    get: (id: string) =>
        request<Product>(`/products/${id}`),
}

/**
 * Dashboard API
 */
export const dashboardApi = {
    getAnalytics: (days = 30) =>
        request<SalesAnalytics>(`/dashboard/analytics?days=${days}`),

    getSummary: () =>
        request<DashboardSummary>('/dashboard/summary'),
}

/**
 * Health API
 */
export const healthApi = {
    check: () =>
        request<{ status: string; environment: string; version: string }>('/health'),
}

/**
 * Migration API
 */
/**
 * Clients API
 */
export const clientsApi = {
    migrateClients: (clients: any[]) =>
        request<{
            total_processed: number
            created_count: number
            updated_count: number
            errors: string[]
        }>('/clients/', { // Endpoint is now /api/clients/
            method: 'POST',
            body: JSON.stringify({ clients }),
        }),

    getClients: (filters: Record<string, any> = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.set(key, String(value))
            }
        })
        const query = searchParams.toString()
        return request<{
            data: any[]
            total: number
            limit: number
            skip: number
        }>(`/clients/?${query}`)
    },

    syncClients: () =>
        request<{
            total_processed: number
            created_count: number
            updated_count: number
            errors: string[]
        }>('/clients/sync', {
            method: 'POST',
        })
}

/**
 * Employees API
 */
export const employeesApi = {
    sync: () =>
        request<{
            total_fetched: number
            created: number
            updated: number
            errors: number
        }>('/employees/sync', {
            method: 'POST',
        }),

    list: () =>
        request<any[]>('/employees/'),
}

/**
 * Tasks API
 */
export const tasksApi = {
    sync: (params: { start: string; end: string; customTaskName: string }) => {
        const searchParams = new URLSearchParams({
            start: params.start,
            end: params.end,
            customTaskName: params.customTaskName,
        })
        return request<{
            total_fetched: number
            created: number
            updated: number
            errors: number
        }>(`/tasks/sync?${searchParams}`, { method: 'POST' })
    },

    list: (filters: Record<string, any> = {}) => {
        const searchParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value))
            }
        })
        return request<{
            data: any[]
            total: number
            limit: number
            skip: number
        }>(`/tasks/?${searchParams}`)
    },
}

/**
 * Analytics API
 */
export const analyticsApi = {
    getEmployeeClients: (clientCategory?: 'School' | 'Distributor', employeeId?: string) => {
        const query = new URLSearchParams()
        if (clientCategory) query.set('client_category', clientCategory)
        if (employeeId) query.set('employee_id', employeeId)
        return request<{ data: any[], total: number }>(`/analytics/clients?${query}`)
    },

    getGroupedClients: (groupBy: 'AREA_WISE' | 'MATERIAL', clientCategory?: 'School' | 'Distributor', employeeId?: string) => {
        const query = new URLSearchParams({ group_by: groupBy })
        if (clientCategory) query.set('client_category', clientCategory)
        if (employeeId) query.set('employee_id', employeeId)
        return request<{
            groups: Record<string, any[]>
            unassigned: any[]
            total: number
        }>(`/analytics/clients/grouped?${query}`)
    },

    getTaskAnalytics: (start: string, end: string, clientCategory?: string, employeeId?: string) => {
        const query = new URLSearchParams({ start, end })
        if (clientCategory) query.set('client_category', clientCategory)
        if (employeeId) query.set('employee_id', employeeId)
        return request<TaskAnalyticsResponse>(`/analytics/tasks?${query}`)
    },

    getAreaWiseTasks: (start: string, end: string, clientCategory?: string, employeeId?: string) => {
        const query = new URLSearchParams({ start, end })
        if (clientCategory) query.set('client_category', clientCategory)
        if (employeeId) query.set('employee_id', employeeId)
        return request<AreaWiseTasksResponse>(`/analytics/tasks/area-wise?${query}`)
    },

    getSchoolCategoryTasks: (start: string, end: string, clientCategory?: string, employeeId?: string) => {
        const query = new URLSearchParams({ start, end })
        if (clientCategory) query.set('client_category', clientCategory)
        if (employeeId) query.set('employee_id', employeeId)
        return request<SchoolCategoryResponse>(`/analytics/tasks/school-category?${query}`)
    }
}

/**
 * Contact API
 */
export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
}

export const contactApi = {
    submit: (data: ContactFormData) =>
        request<ApiResponse>('/contact/submit', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
}

/**
 * Compatibility export for Contact.tsx
 */
export const submitContactForm = contactApi.submit;


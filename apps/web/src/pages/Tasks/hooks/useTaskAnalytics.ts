import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../../services/api'
import {
    TaskAnalyticsResponse,
    AreaWiseTasksResponse,
    SchoolCategoryResponse
} from '../../../types/analytics'

export const useTaskAnalyticsQuery = (
    startDate: string,
    endDate: string,
    employeeId?: string
) => {
    return useQuery<TaskAnalyticsResponse>({
        queryKey: ['taskAnalytics', startDate, endDate, employeeId],
        queryFn: () => analyticsApi.getTaskAnalytics(startDate, endDate, undefined, employeeId || undefined),
        enabled: !!startDate && !!endDate
    })
}

export const useAreaWiseQuery = (
    startDate: string,
    endDate: string,
    employeeId?: string
) => {
    return useQuery<AreaWiseTasksResponse>({
        queryKey: ['areaWiseTasks', startDate, endDate, employeeId],
        queryFn: () => analyticsApi.getAreaWiseTasks(startDate, endDate, undefined, employeeId || undefined),
        enabled: !!startDate && !!endDate
    })
}

export const useSchoolCategoryQuery = (
    startDate: string,
    endDate: string,
    employeeId?: string
) => {
    return useQuery<SchoolCategoryResponse>({
        queryKey: ['schoolCategory', startDate, endDate, employeeId],
        queryFn: () => analyticsApi.getSchoolCategoryTasks(startDate, endDate, undefined, employeeId || undefined),
        enabled: !!startDate && !!endDate
    })
}

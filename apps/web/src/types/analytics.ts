export interface Client {
    // ID fields
    ID?: string | number; // unolo_client_id (alias "ID")
    _id?: string; // mongo_id

    // Core fields with aliases matching backend Pydantic models
    "Client Name (*)"?: string;
    "Visible To (*)"?: string;
    "Employee ID"?: string;
    "Contact Name (*)"?: string;
    "Country Code (*)"?: string;
    "Contact Number (*)"?: string;
    "Address (*)"?: string;
    "Can exec change location (*)"?: boolean;
    "Latitude"?: number;
    "Longitude"?: number;
    "Radius(m)"?: number;
    "Otp Verified"?: boolean;
    "Created By"?: string;
    "Created At"?: string;
    "Last Modified At"?: string;
    "Client Catagory (*)"?: string; // Note: typo 'Catagory' matches backend
    "Division Name new (*)"?: string;
    "Correspondent Name"?: string;
    "Corresponded Phone Number"?: string;
    "Head Master"?: string;
    "HM Phone Number"?: string;
    "Distributor Name"?: string;
    "Using Material (*)"?: string;
    "Currently Used Brand"?: string;
    "Time of Order(Class 10)"?: string;
    "Time of Order(Class 6-9)"?: string;
    "School Strength"?: number;
    "Using IIT (*)"?: string;
    "Using AI (*)"?: string;
    "Question Papers"?: string;
    "Branches Places"?: string;
    "Building"?: string;
    "To Delete"?: boolean;

    // Allow index signature for dynamic access if needed, 
    // though explicit fields are preferred.
    [key: string]: any;
}

export interface TaskMetadata {
    adminAssigned?: number;
    exitTime?: number;
    startTime?: number;
    endTime?: number;
    inPool?: number;
    [key: string]: any;
}

export interface Task {
    _id: string; // mongo id
    taskID: string;
    clientID?: string;
    employeeID?: string;
    internalEmpID: string;
    date: string; // YYYY-MM-DD
    checkinTime?: string; // ISO
    checkoutTime?: string; // ISO
    lat?: number;
    lon?: number;
    taskDescription?: string;
    address?: string;
    customFieldsComplex?: any[];
    customEntity?: any;

    // Audit
    createdBy?: string;
    createdByName?: string;
    lastModifiedBy?: string;
    lastModifiedByName?: string;
    created_at_local?: string;
    updated_at_local?: string;

    // Metadata / Extra fields found in response
    metadata?: TaskMetadata;
    clientName?: string; // Found in user example
    schoolCategory?: string[]; // Found in user example
    purposeOfVisit?: string[]; // Found in user example
    revisit?: string[]; // Found in user example
    remarks?: string;
    status?: string;
    type?: string;

    // Populated Client
    client?: Client;
}

export interface TaskAnalyticsResponse {
    data: Task[];
    total: number;
}

export interface ClientWithTasks {
    client: Client;
    tasks: Task[];
    task_count: number;
}

export interface AreaStats {
    unique_clients: number;
    total_clients_in_area: number;
    clients_with_tasks: ClientWithTasks[];
}

export interface AreaWiseTasksResponse {
    areas: Record<string, AreaStats>;
    total_unique_clients: number;
    total_tasks: number;
}

export interface ClientWithLatestTask {
    client: Client;
    latest_task?: Task;
    school_category: 'Hot' | 'Cold' | 'Warm' | 'NoInfo';
}

export interface CategorySummary {
    hot_count: number;
    cold_count: number;
    warm_count: number; // Added
    no_info_count: number;
    total: number;
}

export interface SchoolCategoryResponse {
    hot: ClientWithLatestTask[];
    cold: ClientWithLatestTask[];
    warm: ClientWithLatestTask[]; // Added
    no_info: ClientWithLatestTask[];
    summary: CategorySummary;
}

// DrillDown Types
export type DrillDownType = 'tasks' | 'area' | 'category';

export type DrillDownData = Task[] | ClientWithTasks[] | ClientWithLatestTask[];

export interface EmployeeTaskStat {
    employee_id: string;
    employee_name: string;
    task_count: number;
}

export interface EmployeeSchoolStat {
    employee_id: string;
    employee_name: string;
    hot_school_count: number;
}

export interface AdminOverviewResponse {
    total_tasks: number;
    hot_schools_count: number;
    total_specimens: number;
    tasks_by_employee: EmployeeTaskStat[];
    schools_by_employee: EmployeeSchoolStat[];
}

export interface DailyAnalytics {
    date: string
    is_present: boolean
    tasks_done: number
    distance_km: number
    num_breaks: number
    break_time_minutes: number
    is_working_day: boolean
}

export interface EmployeeAnalyticsResponse {
    employee_id: string
    employee_name: string
    total_working_days: number
    total_present_days: number
    attendance_percentage: number
    total_tasks: number
    avg_tasks_per_day: number
    total_distance_km: number
    avg_distance_per_day: number
    total_breaks: number
    avg_breaks_per_day: number
    total_break_time_minutes: number
    avg_break_time_minutes: number
    daily_breakdown: DailyAnalytics[]
}

from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, Field, field_validator

class UnoloVisibility(BaseModel):
    type: str
    value: int

class UnoloClientResponse(BaseModel):
    client_id: Optional[str] = Field(None, validation_alias="clientID")
    # Support both capitalizations just in case, though the first one is from the first payload
    # The second payload had "clientId", but "clientID" was in the first big blob.
    # Pydantic's validation_alias can take a list or we can just rely on the primary one
    # provided in the real data. I'll stick to the first blob's conventions for now 
    # and add the user's second blob fields.
    
    company_id: Optional[int] = Field(None, alias="companyID")
    client_name: Optional[str] = Field(None, alias="clientName")
    lat: Optional[float] = Field(None)
    lng: Optional[float] = Field(None)
    description: Optional[str] = Field(None)
    timestamp: Optional[int] = Field(None)
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    address: Optional[str] = Field(None)
    proprietor_name: Optional[str] = Field(None, alias="proprietorName")
    photo_path: Optional[str] = Field(None, alias="photoPath")
    radius: Optional[int] = Field(None)
    can_override: Optional[Union[int, bool]] = Field(None, alias="canOverride")
    orig_lat: Optional[float] = Field(None, alias="origLat")
    orig_lon: Optional[float] = Field(None, alias="origLon")
    email: Optional[str] = Field(None)
    internal_client_id: Optional[str] = Field(None, alias="internalClientID")
    city: Optional[str] = Field(None)
    pin_code: Optional[Union[str, int]] = Field(None, alias="pinCode")
    pincode: Optional[Union[str, int]] = Field(None) # From second request
    
    polyline: Optional[Any] = Field(None)
    site_type: Optional[int] = Field(None, alias="siteType")
    job_type_id: Optional[int] = Field(None, alias="jobTypeID")
    client_cat: Optional[Any] = Field(None, alias="clientCat")
    
    # Tracking fields
    created_by_admin_id: Optional[int] = Field(None, alias="createdByAdminID")
    created_by_emp_id: Optional[int] = Field(None, alias="createdByEmpID")
    created_by_source_id: Optional[int] = Field(None, alias="createdBySourceID")
    created_ts: Optional[int] = Field(None, alias="createdTs")
    last_modified_by_emp_id: Optional[int] = Field(None, alias="lastModifiedByEmpID")
    last_modified_by_admin_id: Optional[int] = Field(None, alias="lastModifiedByAdminID")
    last_modified_by_source_id: Optional[int] = Field(None, alias="lastModifiedBySourceID")
    last_modified_ts: Optional[int] = Field(None, alias="lastModifiedTs")
    
    otp_verified: Optional[Union[int, bool]] = Field(None, alias="otpVerified")
    is_duplicate: Optional[bool] = Field(None, alias="isDuplicate")
    
    # Complex fields
    visibility: Optional[List[UnoloVisibility]] = Field(None)
    
    # Custom fields inferred from request
    distributor_name: Optional[str] = Field(None, alias="distributorName")
    contact: Optional[str] = Field(None) # "Name @ Number"
    client_catagory: Optional[str] = Field(None, alias="clientCatagory") # Spelling in API?
    client_category: Optional[str] = Field(None, alias="clientCategory") # Spelling in second request
    division_name_new: Optional[str] = Field(None, alias="divisionNameNew")
    using_material: Optional[str] = Field(None, alias="usingMaterial")
    
    # Additional fields request
    school_strength: Optional[Union[int, str]] = Field(None, alias="schoolStrength")
    using_iit: Optional[str] = Field(None, alias="usingIIT")
    branches_places: Optional[str] = Field(None, alias="branchesPlaces")
    building: Optional[str] = Field(None, alias="building")
    category: Optional[str] = Field(None) # Alias might be same as clientCategory?
    
    # Contact helper fields (often inside 'contact' string but sometimes separate)
    contact_name: Optional[str] = Field(None, alias="contactName")
    contact_number: Optional[str] = Field(None, alias="contactNumber")
    country_code: Optional[str] = Field(None, alias="countryCode")

    class Config:
        populate_by_name = True
        extra = "ignore"


class UnoloEodSummaryResponse(BaseModel):
    """
    Schema for Unolo EOD Summary response.
    """
    employee_id: int = Field(..., alias="employeeID")
    internal_emp_id: Optional[str] = Field(None, alias="internalEmpID")
    date: str
    attendance_result_code: int = Field(..., alias="attendanceResultCode")
    first_sign_in: Optional[str] = Field(None, alias="firstSignIn")
    last_sign_out: Optional[str] = Field(None, alias="lastSignOut")
    total_client_visits: int = Field(..., alias="totalClientVisits")
    total_num_photos: Optional[int] = Field(None, alias="totalNumPhotos")
    total_time_tracked: Optional[str] = Field(None, alias="totalTimeTracked")
    total_time_attendance: Optional[str] = Field(None, alias="totalTimeAttendance")
    setup_rating: Optional[str] = Field(None, alias="setupRating")
    rk_polyline: Optional[str] = Field(None, alias="rkPolyline")
    compliance_rating: Optional[str] = Field(None, alias="complianceRating")
    distance: float
    odo_distance: float = Field(..., alias="odoDistance")
    total_travel_time: Optional[str] = Field(None, alias="totalTravelTime")
    admin_assigned_tasks: int = Field(..., alias="adminAssignedTasks")
    admin_completed_tasks: int = Field(..., alias="adminCompletedTasks")
    self_assigned_tasks: int = Field(..., alias="selfAssignedTasks")
    self_completed_tasks: int = Field(..., alias="selfCompletedTasks")
    total_time_spent_with_client: Optional[str] = Field(None, alias="totalTimeSpentWithClient")
    total_actual_time_spent_with_client: Optional[str] = Field(None, alias="totalActualTimeSpentWithClient")
    num_breaks: int = Field(..., alias="numBreaks")
    total_break_time: Optional[str] = Field(None, alias="totalBreakTime")
    max_break_time: Optional[str] = Field(None, alias="maxBreakTime")
    total_forms: int = Field(..., alias="totalForms")
    total_unproductive_time: Optional[str] = Field(None, alias="totalUnproductiveTime")
    clients_created: int = Field(..., alias="clientsCreated")

    class Config:
        populate_by_name = True
        extra = "ignore"


class AttendanceShift(BaseModel):
    start: str
    startMSE: int
    end: str
    endMSE: int
    duration: str
    durationMS: int


class AttendanceEvent(BaseModel):
    id: str
    employee_id: int = Field(..., alias="employeeID")
    event_type_id: int = Field(..., alias="eventTypeID")
    lat: float
    lon: float
    accuracy: float
    timestamp: str
    insert_time: str = Field(..., alias="insertTime")
    better: int
    speed: float
    bearing: float
    age: int
    src: int
    date: Optional[str] = None
    site_id: Optional[int] = Field(None, alias="siteID")
    site_name: Optional[str] = Field(None, alias="siteName")
    photo_url: Optional[str] = Field(None, alias="photoURL")
    form_url: Optional[str] = Field(None, alias="formURL")
    processing_date: str = Field(..., alias="processingDate")
    address: Optional[str] = None
    tz: str
    elapsed_real_time: int = Field(..., alias="elapsedRealTime")
    elapsed_real_time_age: int = Field(..., alias="elapsedRealTimeAge")
    client_name: Optional[str] = Field(None, alias="clientName")


class UnoloAttendanceResponse(BaseModel):
    first_name: str = Field(..., alias="firstName")
    last_name: str = Field(..., alias="lastName")
    internal_emp_id: Optional[str] = Field(None, alias="internalEmpID")
    manager_name: Optional[str] = Field(None, alias="managerName")
    parent_admin_id: int = Field(..., alias="parentAdminID")
    mobile_number: Optional[str] = Field(None, alias="mobileNumber")
    user_id: str = Field(..., alias="userID")
    profile_id: int = Field(..., alias="profileID")
    team_name: Optional[str] = Field(None, alias="teamName")
    active: int
    tz: str
    total_days: int = Field(..., alias="totalDays")
    total_days_present: int = Field(..., alias="totalDaysPresent")
    total_days_absent: int = Field(..., alias="totalDaysAbsent")
    total_days_penalty: int = Field(..., alias="totalDaysPenalty")
    total_weekly_off: int = Field(..., alias="totalWeeklyOff")
    total_holidays: int = Field(..., alias="totalHolidays")
    total_days_on_leave: int = Field(..., alias="totalDaysOnLeave")
    total_pending_approval: int = Field(..., alias="totalPendingApproval")
    leave_type: Optional[str] = Field(None, alias="leaveType")
    leave_session: Optional[str] = Field(None, alias="leaveSession")
    joining_date: Optional[str] = Field(None, alias="joiningDate")
    date: str
    shifts: List[AttendanceShift] = []
    stretched_shifts: List[AttendanceShift] = Field(default=[], alias="stretchedShifts")
    # Using Dict for dynamic keys like "8", "9"
    attendance_events: Dict[str, List[AttendanceEvent]] = Field(default={}, alias="attendanceEvents")
    
    first_sign_in: Optional[str] = Field(None, alias="firstSignIn")
    last_sign_out: Optional[str] = Field(None, alias="lastSignOut")
    attendance_in_selfies: List[Any] = Field(default=[], alias="attendanceInSelfies")
    attendance_out_selfies: List[Any] = Field(default=[], alias="attendanceOutSelfies")
    
    first_sign_in_mse: Optional[int] = Field(None, alias="firstSignInMSE")
    last_sign_out_mse: Optional[int] = Field(None, alias="lastSignOutMSE")
    attendance_hours: float = Field(..., alias="attendanceHours")
    odo_distance: float = Field(..., alias="odoDistance")
    total_time_tracked_mse: int = Field(..., alias="totalTimeTrackedMSE")
    total_time_tracked: str = Field(..., alias="totalTimeTracked")
    total_time_attendance: str = Field(..., alias="totalTimeAttendance")
    total_time_attendance_mse: int = Field(..., alias="totalTimeAttendanceMSE")
    override: Optional[Any] = None
    attendance_result_code: int = Field(..., alias="attendanceResultCode")
    attendance_result_code_2: Optional[int] = Field(None, alias="attendanceResultCode2")
    attendance_reason: Optional[str] = Field(None, alias="attendanceReason")
    hours_on_duty: float = Field(..., alias="hoursOnDuty")
    attendance_counted: int = Field(..., alias="attendanceCounted")

    class Config:
        populate_by_name = True
        extra = "ignore"


class SyncStatsResponse(BaseModel):
    total_fetched: int
    created: int
    updated: int
    errors: int


class EodSummaryList(BaseModel):
    data: List[UnoloEodSummaryResponse]
    total: int
    limit: int
    skip: int


class AttendanceList(BaseModel):
    data: List[UnoloAttendanceResponse]
    total: int
    limit: int
    skip: int


class UnoloTaskWebhook(BaseModel):
    """Schema for Task Webhook payload from Unolo."""
    task_id: str = Field(..., alias="taskID")
    client_id: Optional[str] = Field(None, alias="clientID")
    employee_id: Optional[str] = Field(None, alias="employeeID")
    internal_emp_id: Optional[str] = Field(None, alias="internalEmpID")
    date: str = Field(..., description="Date string YYYY-MM-DD")
    
    checkin_time: Optional[str] = Field(None, alias="checkinTime")
    checkout_time: Optional[str] = Field(None, alias="checkoutTime")
    
    task_description: Optional[str] = Field(None, alias="taskDescription")
    
    # Location data
    address: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    
    # Custom fields
    custom_entity: Optional[Dict[str, Any]] = Field(None, alias="customEntity")
    custom_fields_complex: List[Dict[str, Any]] = Field(default=[], alias="customFieldsComplex")
    
    # Audit / metadata
    created_by: Optional[str] = Field(None, alias="createdBy")
    created_by_name: Optional[str] = Field(None, alias="createdByName")
    last_modified_by: Optional[str] = Field(None, alias="lastModifiedBy")
    last_modified_by_name: Optional[str] = Field(None, alias="lastModifiedByName")
    
    metadata: Optional[Dict[str, Any]] = None
    
    # Status
    task_status: Optional[str] = Field(None, alias="taskStatus")
    
    class Config:
        populate_by_name = True
        extra = "ignore"


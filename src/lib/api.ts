const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request<{
      success: boolean;
      token: string;
      admin: { email: string; role: string };
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Vendor APIs
  async getVendors(params?: {
    page?: number;
    limit?: number;
    status?: string;
    city?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<PaginatedResponse<any>>(
      `/api/admin/vendors${queryString ? `?${queryString}` : ''}`
    );
  }

  async getVendorsByAgent(agentId: string, params?: {
    status?: string;
    dateFilter?: string;
    followUpFilter?: string;
    includeStats?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams({ agentId });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request<{
      success: boolean;
      data: any[];
      statistics?: any;
      pagination?: any;
    }>(`/api/admin/vendors?${queryParams.toString()}`);
  }

  async getVendorById(id: string) {
    return this.request<ApiResponse<any>>(`/api/admin/vendors/${id}`);
  }

  async updateVendor(id: string, data: any) {
    return this.request<ApiResponse<any>>(`/api/admin/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAnalytics() {
    return this.request<{
      success: boolean;
      data: {
        monthlyRequests: Array<{ year: number; month: number; count: number }>;
        summary: {
          total: number;
          pending: number;
          approved: number;
          rejected: number;
        };
      };
    }>('/api/admin/vendors/analytics');
  }

  // Agent APIs
  async getAgents() {
    return this.request<{
      success: boolean;
      agents: any[];
      count: number;
    }>('/api/agents');
  }

  // User APIs (New unified system for agents & employees)
  async getUsers(role?: 'agent' | 'employee') {
    const queryString = role ? `?role=${role}` : '';
    return this.request<{
      success: boolean;
      users: any[];
      count: number;
    }>(`/api/admin/users${queryString}`);
  }

  async createUser(data: { name: string; username: string; password: string; role: 'agent' | 'employee'; mobileNumber?: string; email?: string; dob?: string }) {
    return this.request<{
      success: boolean;
      user: any;
      message: string;
    }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserById(id: string, data: any) {
    return this.request<{
      success: boolean;
      user: any;
      message: string;
    }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUserById(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserByIdAdmin(id: string) {
    return this.request<{
      success: boolean;
      user: any;
    }>(`/api/admin/users/${id}`);
  }

  async createAgent(data: { name: string; username: string; password: string }) {
    return this.request<{
      success: boolean;
      agent: any;
      message: string;
    }>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: any) {
    return this.request<{
      success: boolean;
      agent: any;
      message: string;
    }>(`/api/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/agents/${id}`, {
      method: 'DELETE',
    });
  }

  async getAgentById(id: string) {
    return this.request<{
      success: boolean;
      agent: any;
    }>(`/api/agents/${id}`);
  }

  // Attendance APIs
  async getAgentAttendance(params?: {
    agentId?: string;
    month?: string;
    year?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      attendance: any[];
      statistics: {
        totalRecords: number;
        uniqueAgents: number;
        presentCount: number;
        halfDayCount: number;
        totalDuration: number;
        averageDuration: number;
      };
    }>(`/api/admin/attendance${queryString ? `?${queryString}` : ''}`);
  }

  async getAgentAttendanceById(agentId: string, params?: {
    month?: string;
    year?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      attendance: any[];
      statistics: {
        totalDays: number;
        presentDays: number;
        halfDays: number;
        totalHours: number;
      };
    }>(`/api/admin/attendance/${agentId}${queryString ? `?${queryString}` : ''}`);
  }

  async getUserAttendanceById(userId: string, params?: {
    month?: string;
    year?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      attendance: any[];
      statistics: {
        totalDays: number;
        presentDays: number;
        halfDays: number;
        totalHours: number;
      };
    }>(`/api/admin/users-attendance/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // User Attendance APIs (for new unified system)
  async getUserAttendance(params?: {
    role?: 'agent' | 'employee';
    month?: string;
    year?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      attendance: any[];
      statistics: {
        totalRecords: number;
        uniqueUsers: number;
        presentCount: number;
        halfDayCount: number;
        totalDuration: number;
        averageDuration: number;
      };
    }>(`/api/admin/users-attendance${queryString ? `?${queryString}` : ''}`);
  }

  // Edit Request APIs
  async getPendingEditRequests() {
    return this.request<{
      success: boolean;
      vendors: any[];
      count: number;
    }>('/api/admin/edit-requests/pending');
  }

  async getUnreadEditRequestsCount() {
    return this.request<{
      success: boolean;
      count: number;
    }>('/api/admin/edit-requests/unread-count');
  }

  async markEditRequestsAsSeen() {
    return this.request<{
      success: boolean;
      message: string;
      modifiedCount: number;
    }>('/api/admin/edit-requests/mark-seen', {
      method: 'PATCH',
    });
  }

  async approveVendorEdit(vendorId: string, remark?: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/admin/edit-requests/${vendorId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ remark }),
    });
  }

  async rejectVendorEdit(vendorId: string, remark?: string) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/admin/edit-requests/${vendorId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ remark }),
    });
  }

  // Form Configuration APIs
  async getFormConfig(visibleTo?: string, vendorType?: string) {
    const queryParams = new URLSearchParams();
    if (visibleTo) queryParams.append('visibleTo', visibleTo);
    if (vendorType) queryParams.append('vendorType', vendorType);
    const queryString = queryParams.toString();
    return this.request<{
      success: boolean;
      data: any[];
    }>(`/api/form/config${queryString ? `?${queryString}` : ''}`);
  }

  async getAllSections() {
    return this.request<{
      success: boolean;
      data: any[];
    }>('/api/form/sections');
  }

  async createSection(sectionData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>('/api/form/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
  }

  async updateSection(sectionId: string, updateData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/form/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteSection(sectionId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/form/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  async getFieldConfig(fieldId: string) {
    return this.request<{
      success: boolean;
      data: any;
    }>(`/api/form/fields/${fieldId}`);
  }

  async createFieldConfig(fieldData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>('/api/form/fields', {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  }

  async updateFieldConfig(fieldId: string, updateData: any) {
    return this.request<{
      success: boolean;
      message: string;
      data: any;
    }>(`/api/form/fields/${fieldId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteFieldConfig(fieldId: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/form/fields/${fieldId}`, {
      method: 'DELETE',
    });
  }

  async updateFieldOrder(fields: Array<{ id: string; order: number }>) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/api/form/fields/reorder', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  }

  // ==========================================
  // Vendor Type APIs
  // ==========================================
  async getVendorTypes(activeOnly?: boolean) {
    const queryString = activeOnly ? '?activeOnly=true' : '';
    return this.request<{
      success: boolean;
      data: VendorType[];
    }>(`/api/vendor-types${queryString}`);
  }

  async getVendorTypeById(id: string) {
    return this.request<{
      success: boolean;
      data: VendorType;
    }>(`/api/vendor-types/${id}`);
  }

  async createVendorType(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order?: number;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      data: VendorType;
    }>('/api/vendor-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendorType(id: string, data: Partial<VendorType>) {
    return this.request<{
      success: boolean;
      message: string;
      data: VendorType;
    }>(`/api/vendor-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendorType(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/api/vendor-types/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderVendorTypes(orders: Array<{ id: string; order: number }>) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/api/vendor-types/reorder', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    });
  }
}

// Vendor Type interface
export interface VendorType {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const api = new ApiClient();

// Data normalization helpers
export function normalizeVendor(vendor: any) {
  // Flatten formData Map into the vendor object
  const formData = vendor.formData || {};
  
  return {
    ...vendor,
    ...formData, // Spread formData fields into the vendor object
    id: vendor._id || vendor.id,
    restaurantImage: typeof vendor.restaurantImage === 'object' 
      ? vendor.restaurantImage.secure_url 
      : vendor.restaurantImage,
    // Ensure arrays are always arrays (not undefined)
    categories: formData.categories || vendor.categories || [],
    services: formData.services || vendor.services || [],
    // Convert latitude and longitude to numbers for Google Maps
    latitude: parseFloat(vendor.latitude) || parseFloat(formData.latitude) || 0,
    longitude: parseFloat(vendor.longitude) || parseFloat(formData.longitude) || 0,
  };
}

export function normalizeVendors(vendors: any[]) {
  return vendors.map(normalizeVendor);
}

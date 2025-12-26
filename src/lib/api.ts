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

  async getVendorsByAgent(agentId: string) {
    return this.request<{
      success: boolean;
      data: any[];
      count: number;
    }>(`/api/admin/vendors?agentId=${agentId}`);
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
}

export const api = new ApiClient();

// Data normalization helpers
export function normalizeVendor(vendor: any) {
  return {
    ...vendor,
    id: vendor._id || vendor.id,
    restaurantImage: typeof vendor.restaurantImage === 'object' 
      ? vendor.restaurantImage.secure_url 
      : vendor.restaurantImage,
  };
}

export function normalizeVendors(vendors: any[]) {
  return vendors.map(normalizeVendor);
}

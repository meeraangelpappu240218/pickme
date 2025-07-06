import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OfficerLoginCredentials {
  identifier: string; // email or mobile
  password: string;
}

export interface CreateOfficerData {
  name: string;
  mobile: string;
  telegram_id?: string;
  email?: string;
  department?: string;
  rank?: string;
  badge_number?: string;
  credits_remaining?: number;
  total_credits?: number;
}

export interface AddCreditsData {
  officer_id: string;
  action: 'Renewal' | 'Top-up' | 'Refund' | 'Adjustment';
  credits: number;
  payment_mode?: string;
  payment_reference?: string;
  remarks?: string;
}

// Auth API
export const authAPI = {
  async login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  async verifyToken(token: string) {
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  }
};

// Officers API
export const officersAPI = {
  async getAll(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/officers?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch officers');
    }

    return response.json();
  },

  async create(data: CreateOfficerData) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/officers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create officer');
    }

    return response.json();
  },

  async update(id: string, data: Partial<CreateOfficerData>) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/officers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update officer');
    }

    return response.json();
  },

  async delete(id: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/officers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete officer');
    }

    return response.json();
  },

  async updateStatus(id: string, status: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/officers/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update officer status');
    }

    return response.json();
  }
};

// Credits API
export const creditsAPI = {
  async addCredits(data: AddCreditsData) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/credits/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add credits');
    }

    return response.json();
  },

  async getTransactions(params?: { page?: number; limit?: number; officer_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.officer_id) searchParams.append('officer_id', params.officer_id);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/credits/transactions?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit transactions');
    }

    return response.json();
  }
};

// Queries API
export const queriesAPI = {
  async getAll(params?: { search?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`/api/queries?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch queries');
    }

    return response.json();
  }
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  },

  async getActivity() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/dashboard/activity', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard activity');
    }

    return response.json();
  }
};

// Officer Auth API
export const officerAuthAPI = {
  async login(credentials: OfficerLoginCredentials) {
    // For now, we'll use a simple check against known officers
    // In production, you'd implement proper officer authentication
    const validCredentials = [
      { identifier: 'ramesh.kumar@police.gov.in', password: 'officer123' },
      { identifier: '+919791103607', password: 'officer123' },
      { identifier: '9791103607', password: 'officer123' }
    ];
    
    const isValid = validCredentials.some(cred => 
      cred.identifier === credentials.identifier && cred.password === credentials.password
    );
    
    if (isValid) {
      // Return mock officer data
      return {
        officer: {
          id: '1',
          name: 'Inspector Ramesh Kumar',
          mobile: '+91 9791103607',
          email: 'ramesh.kumar@police.gov.in',
          telegram_id: '@rameshcop',
          credits_remaining: 45,
          total_credits: 50,
          status: 'Active'
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }
};

// Export Supabase client for direct use
export { supabase };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    country?: string
    created_at: string
  }
  access_token: string
  token_type: string
}

export interface ApiError {
  detail: string
}

export interface OAuthTokenResponse {
  id: string
  access_token: string
  user_id: string
  provider: string
  token_type: string
  created_at: string
}

export interface OAuthTokenListResponse {
  tokens: OAuthTokenResponse[]
  total: number
  providers?: string[]
}

export interface CourseListItem {
  id: string
  title: string
  description?: string
  estimated_duration?: number
  difficulty?: string
  learning_objectives?: string[]
  source_from?: string[]
  progress: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface CourseListResponse {
  courses: CourseListItem[]
  total: number
}

export interface LessonDetail {
  id: string
  title: string
  content: string
  index: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface ModuleDetail {
  id: string
  title: string
  order_index: number
  is_completed: boolean
  created_at: string
  updated_at: string
  lessons: LessonDetail[]
}

export interface CourseDetail {
  id: string
  title: string
  description?: string
  estimated_duration?: number
  difficulty?: string
  learning_objectives?: string[]
  source_from?: string[]
  progress: number
  is_completed: boolean
  created_at: string
  updated_at: string
  modules: ModuleDetail[]
}

class ApiService {
  private readonly baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if token exists
    const token = this.getToken()
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Include cookies and authorization headers in CORS requests
    }

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - server may be down')
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error - cannot connect to server')
        }
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    return this.request<LoginResponse['user']>('/users/me')
  }

  // Token management
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // OAuth methods
  async getOAuthTokens(providers?: string[]): Promise<OAuthTokenListResponse> {
    const queryParams = providers ? `?providers=${providers.join('&providers=')}` : ''
    return this.request<OAuthTokenListResponse>(`/oauth/tokens${queryParams}`)
  }

  async getGitHubAuthUrl(state?: string): Promise<{ auth_url: string }> {
    const queryParams = state ? `?state=${encodeURIComponent(state)}` : ''
    return this.request<{ auth_url: string }>(`/oauth/github/auth-url${queryParams}`)
  }

  async saveGitHubToken(accessToken: string): Promise<OAuthTokenResponse> {
    return this.request<OAuthTokenResponse>('/oauth/github/save-token', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    })
  }

  async getGoogleDriveAuthUrl(state?: string): Promise<{ auth_url: string }> {
    const queryParams = state ? `?state=${encodeURIComponent(state)}` : ''
    return this.request<{ auth_url: string }>(`/oauth/drive/auth-url${queryParams}`)
  }

  async saveGoogleDriveToken(accessToken: string, refreshToken?: string): Promise<OAuthTokenResponse> {
    return this.request<OAuthTokenResponse>('/oauth/drive/save-token', {
      method: 'POST',
      body: JSON.stringify({ 
        access_token: accessToken,
        refresh_token: refreshToken 
      }),
    })
  }

  async refreshGoogleDriveToken(): Promise<{ message: string; access_token: string; expires_at: string }> {
    return this.request<{ message: string; access_token: string; expires_at: string }>('/oauth/drive/refresh-token', {
      method: 'POST',
    })
  }

  // Course methods
  async getCourses(): Promise<CourseListResponse> {
    return this.request<CourseListResponse>('/course')
  }

  async getCourseById(courseId: string): Promise<CourseDetail> {
    return this.request<CourseDetail>(`/course/${courseId}`)
  }

  // AI Course Generation
  async generateCourse(request: {
    token_github: string
    token_drive: string
    prompt: string
    files_url?: string
  }): Promise<{ course_id: string }> {
    return this.request<{ course_id: string }>('/ai/course/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Test method to verify API connection
  async testConnection(): Promise<any> {
    // Use the root health endpoint directly
    const healthUrl = this.baseURL.replace('/api/v1', '') + '/health'
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Simple connectivity test without authentication
  async testBasicConnection(): Promise<boolean> {
    try {
      // Use the root health endpoint, not the API versioned one
      const healthUrl = this.baseURL.replace('/api/v1', '') + '/health'
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies and authorization headers in CORS requests
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const apiService = new ApiService()

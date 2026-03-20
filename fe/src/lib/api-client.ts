/**
 * Loaded from environment variables (.env.local)
 */
const BASE_URL = '/api/';

/**
 * Generic API client using fetch
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 허용 설정
      ...options,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      throw new Error('인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: unknown, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: 'include', // 쿠키 허용 설정
      ...options,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
        window.location.href = '/login';
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '인증이 만료되었습니다. 다시 로그인해 주세요.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

const BASE_URL = '/api/';

let refreshPromise: Promise<boolean> | null = null;

type RequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

function buildUrl(endpoint: string) {
  return `${BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          return false;
        }

        const data = await response.json().catch(() => ({}));
        return data?.status === 'SUCCESS';
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function redirectToLogin() {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryAttempted = false,
): Promise<T> {
  const { skipRefresh = false, headers, ...restOptions } = options;

  const response = await fetch(buildUrl(endpoint), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });

  if (response.status === 401 && !skipRefresh && !retryAttempted) {
    const refreshSucceeded = await refreshAccessToken();

    if (refreshSucceeded) {
      return request<T>(endpoint, options, true);
    }
  }

  if (response.status === 401) {
    if (!skipRefresh) {
      redirectToLogin();
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '인증이 만료되었습니다. 다시 로그인해 주세요.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string, options: RequestOptions = {}) {
    return request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  },

  async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}) {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },
};

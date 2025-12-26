type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  headers?: HeadersInit;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Client API générique avec gestion d'erreur
 */
async function apiRequest<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Pour les DELETE qui retournent juste { success: true }
    if (response.status === 204 || method === 'DELETE') {
      return { success: true } as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * API Client avec méthodes CRUD
 */
export const apiClient = {
  get: <T = any>(url: string) => 
    apiRequest<T>(url, { method: 'GET' }),

  post: <T = any>(url: string, data: any) => 
    apiRequest<T>(url, { method: 'POST', body: data }),

  put: <T = any>(url: string, data: any) => 
    apiRequest<T>(url, { method: 'PUT', body: data }),

  delete: <T = any>(url: string) => 
    apiRequest<T>(url, { method: 'DELETE' }),
};

/**
 * Factory pour créer des clients API pour une ressource
 */
export function createResourceClient<T = any>(baseUrl: string) {
  return {
    getAll: (params?: Record<string, string | number>) => {
      const queryString = params 
        ? '?' + new URLSearchParams(
            Object.entries(params).map(([k, v]) => [k, String(v)])
          ).toString()
        : '';
      return apiClient.get<T[]>(`${baseUrl}${queryString}`);
    },

    getById: (id: number) => 
      apiClient.get<T>(`${baseUrl}/${id}`),

    create: (data: Partial<T>) => 
      apiClient.post<T>(baseUrl, data),

    update: (id: number, data: Partial<T>) => 
      apiClient.put<T>(`${baseUrl}/${id}`, data),

    delete: (id: number) => 
      apiClient.delete(`${baseUrl}/${id}`),
  };
}

export { ApiError };
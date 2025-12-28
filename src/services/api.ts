/**
 * API service configuration
 * Configure your API client, base URLs, and common request handlers here
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: unknown;
}

/**
 * Generic API request function
 */
export const apiRequest = async <T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> => {
    const { method = 'GET', headers = {}, body } = config;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

export const api = {
    get: <T>(endpoint: string, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'GET', headers }),

    post: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'POST', body, headers }),

    put: <T>(endpoint: string, body: unknown, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'PUT', body, headers }),

    delete: <T>(endpoint: string, headers?: Record<string, string>) =>
        apiRequest<T>(endpoint, { method: 'DELETE', headers }),
};

import { QueryClient } from "@tanstack/react-query";

// API Base URL configuration
// In development: use empty string for relative URLs (same server)
// In production: use VITE_API_URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = Array.isArray(queryKey) ? queryKey.join('') : String(queryKey);
        const fullUrl = `${API_BASE_URL}${url}`;
        const response = await fetch(fullUrl, {
          credentials: 'include', // Include credentials for CORS
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
    },
  },
});

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const response = await fetch(fullUrl, {
    credentials: 'include', // Include credentials for CORS
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
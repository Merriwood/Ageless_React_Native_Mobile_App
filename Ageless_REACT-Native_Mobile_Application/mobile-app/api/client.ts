/**
 * HTTP Client Configuration
 * Central HTTP client for all API requests
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { tokenManager } from './tokenManager';

const getApiBaseUrl = (): string => {
  // On web, use relative URLs (same origin)
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // Environment variable overrides
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development defaults
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Production default (Render)
  return 'https://locali-corp.onrender.com';
};

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 30000;

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  originalError?: Error;
}

const handleError = (error: AxiosError): ApiError => {
  // Extract the actual error message from the backend response
  const responseData = error.response?.data as any;
  const backendMessage = responseData?.error || responseData?.message;

  // Log for debugging - show complete response info
  console.error('[API Error] Complete response:', {
    status: error.response?.status,
    statusText: error.response?.statusText,
    headers: error.response?.headers,
    data: error.response?.data,
    dataType: typeof error.response?.data,
    backendMessage,
    axiosMessage: error.message,
    code: error.code,
  });

  const apiError: ApiError = {
    message: backendMessage || error.message,
    status: error.response?.status,
    code: error.code,
    originalError: error,
  };

  // Provide appropriate messages based on HTTP status if no backend message was provided
  if (!backendMessage) {
    switch (error.response?.status) {
      case 400:
        apiError.message = 'Invalid request - please check your input';
        break;
      case 401:
        apiError.message = 'Invalid credentials - please try again';
        break;
      case 403:
        apiError.message = 'Access forbidden';
        break;
      case 404:
        apiError.message = 'Resource not found';
        break;
      case 500:
        apiError.message = 'Server error - please try again later';
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          apiError.message = 'Request timeout - server took too long to respond';
        } else if (error.message === 'Network Error') {
          apiError.message = 'Network error - check your internet connection';
        }
    }
  }

  return apiError;
};

class ApiClient {
  private instance: AxiosInstance;
  private requestInterceptor?: number;
  private responseInterceptor?: number;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add Authorization header
    this.requestInterceptor = this.instance.interceptors.request.use(
      async (config) => {
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 unauthorized
    this.responseInterceptor = this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear token on 401 - session expired or invalid
          tokenManager.clearToken();
        }
        return Promise.reject(handleError(error));
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.get<T>(url, {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete<T>(url);
      return response.data;
    } catch (error) {
      throw handleError(error as AxiosError);
    }
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }

  setBaseUrl(url: string): void {
    this.instance.defaults.baseURL = url;
  }

  getBaseUrl(): string {
    return this.instance.defaults.baseURL || API_BASE_URL;
  }

  clearInterceptors(): void {
    if (this.requestInterceptor !== undefined) {
      this.instance.interceptors.request.eject(this.requestInterceptor);
    }
    if (this.responseInterceptor !== undefined) {
      this.instance.interceptors.response.eject(this.responseInterceptor);
    }
  }
}

export const apiClient = new ApiClient();
export const client = apiClient;
export { ApiClient };

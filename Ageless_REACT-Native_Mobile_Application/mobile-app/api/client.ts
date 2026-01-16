/**
 * HTTP Client Configuration
 * Central HTTP client for all API requests
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://ageless-api.render.com';
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
  const apiError: ApiError = {
    message: error.message,
    status: error.response?.status,
    code: error.code,
    originalError: error,
  };

  if (error.response?.status === 404) {
    apiError.message = 'Resource not found';
  } else if (error.response?.status === 401) {
    apiError.message = 'Unauthorized - please log in again';
  } else if (error.response?.status === 403) {
    apiError.message = 'Access forbidden';
  } else if (error.response?.status === 500) {
    apiError.message = 'Server error - please try again later';
  } else if (error.code === 'ECONNABORTED') {
    apiError.message = 'Request timeout - server took too long to respond';
  } else if (error.message === 'Network Error') {
    apiError.message = 'Network error - check your internet connection';
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
    this.requestInterceptor = this.instance.interceptors.request.use(
      async (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.responseInterceptor = this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
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
      throw error instanceof ApiError ? error : handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error instanceof ApiError ? error : handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error instanceof ApiError ? error : handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.instance.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error instanceof ApiError ? error : handleError(error as AxiosError);
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

if (process.env.NODE_ENV === 'development') {
  console.log('API Client initialized with base URL:', API_BASE_URL);
}

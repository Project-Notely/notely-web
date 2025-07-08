import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/utils/config";

class AxiosInstanceSingleton {
  private static instance: AxiosInstanceSingleton;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.REACT_APP_API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  public static getInstance(): AxiosInstanceSingleton {
    if (!AxiosInstanceSingleton.instance) {
      AxiosInstanceSingleton.instance = new AxiosInstanceSingleton();
    }
    return AxiosInstanceSingleton.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        const token = localStorage.getItem("authToken");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp
        config.metadata = { startTime: new Date().getTime() };

        console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        });

        return config;
      },
      error => {
        console.error("❌ [API] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const duration =
          new Date().getTime() - (response.config.metadata?.startTime || 0);
        console.log(
          `✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`,
          {
            status: response.status,
            data: response.data,
          }
        );

        return response;
      },
      error => {
        const duration = error.config?.metadata?.startTime
          ? new Date().getTime() - error.config.metadata.startTime
          : 0;

        console.error(
          `❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${duration}ms`,
          {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          }
        );

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }

        return Promise.reject(error);
      }
    );
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  public updateBaseURL(newBaseURL: string): void {
    this.axiosInstance.defaults.baseURL = newBaseURL;
  }

  public updateTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  public setAuthToken(token: string): void {
    this.axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
    localStorage.setItem("authToken", token);
  }

  public clearAuthToken(): void {
    delete this.axiosInstance.defaults.headers.common["Authorization"];
    localStorage.removeItem("authToken");
  }
}

// Export the singleton instance
export const axiosInstance =
  AxiosInstanceSingleton.getInstance().getAxiosInstance();
export const axiosManager = AxiosInstanceSingleton.getInstance();

// Extend InternalAxiosRequestConfig to include metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

// src/lib/api.ts

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { saveTokens, clearTokens, getTokens } from './auth';

// Export the API URL so it can be used consistently across the app
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7093/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// İstek interceptor'ı - Her istekte Authorization header'ını ekle
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token yenilemesi için kullanılan flag
let isRefreshing = false;
// Bekleyen isteklerin kuyruğu
let failedQueue: any[] = [];

// Bekleyen istekleri işle
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Yanıt interceptor'ı - 401 hatalarını yakala ve token yenileme işlemini başlat
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Format error for consistent handling
    if (error.response) {
      // Server responded with an error
      const { status, data } = error.response;

      // Enhance error object with formatted message for UI
      if (data) {
        // Use the error structure from the API if available
        error.formattedMessage = data.message || 'Bir hata oluştu';
        error.errorDetails = data.errors || [];
      } else {
        // Create default error messages based on status codes
        switch (status) {
          case 400:
            error.formattedMessage = 'Geçersiz istek formatı';
            break;
          case 401:
            error.formattedMessage = 'Oturum süresi doldu veya yetkilendirme hatası';
            break;
          case 403:
            error.formattedMessage = 'Bu işlem için yetkiniz bulunmuyor';
            break;
          case 404:
            error.formattedMessage = 'İstenilen kayıt bulunamadı';
            break;
          case 500:
          case 502:
          case 503:
            error.formattedMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin';
            break;
          default:
            error.formattedMessage = `Hata kodu: ${status}`;
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      error.formattedMessage = 'Sunucu yanıt vermiyor. Lütfen internet bağlantınızı kontrol edin.';
    } else {
      // Something happened in setting up the request
      error.formattedMessage = 'İstek oluşturulurken bir hata oluştu';
    }
    
    // Eğer hata 401 Unauthorized ise ve bu ilk deneme ise
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Token yenileme isteği yapılıyor mu kontrol et
      if (isRefreshing) {
        // Eğer token yenileme işlemi devam ediyorsa, isteği kuyruğa ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { accessToken, refreshToken } = getTokens();
      
      // Refresh token yoksa, direkt login sayfasına yönlendir
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Token yenileme isteği gönder
        const response = await axios.post(`${API_BASE_URL}/Auth/refresh-token`, {
          accessToken,
          refreshToken
        });

        if (response.data.success) {
          const newAccessToken = response.data.data.accessToken;
          const newRefreshToken = response.data.data.refreshToken;
          
          // Yeni tokenleri kaydet
          saveTokens(newAccessToken, newRefreshToken);
          
          // Tüm bekleyen istekleri işle
          processQueue(null, newAccessToken);
          
          // Orijinal isteği yeni token ile tekrar dene
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          // Token yenileme başarısız oldu, kullanıcıyı login sayfasına yönlendir
          processQueue(error, null);
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token yenileme sırasında hata oluştu, kullanıcıyı login sayfasına yönlendir
        processQueue(refreshError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
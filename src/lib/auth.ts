// src/lib/auth.ts
import api from './api';
import { AxiosError } from 'axios';

// Token yönetimi
export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  
  // Özel auth değişim olayını tetikle
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Özel auth değişim olayını tetikle
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
}

export function getTokens() {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
}

export function isAuthenticated() {
  return !!localStorage.getItem('access_token');
}

// Auth servisi
export const AuthService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post("/Auth/login", { email, password });
      const data = response.data;
      
      if (data.success) {
        saveTokens(data.data.accessToken, data.data.refreshToken);
        return { success: true };
      } else {
        return { 
          success: false, 
          errors: data.errors || (data.message ? [data.message] : ["Giriş işlemi başarısız oldu."])
        };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data;
        return { 
          success: false, 
          errors: errorResponse?.errors || 
                  (errorResponse?.message ? [errorResponse.message] : 
                  ["Kullanıcı bilgileri hatalı veya sunucuya erişilemiyor."])
        };
      }
      return { 
        success: false, 
        errors: ["Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."] 
      };
    }
  },

  async logout() {
    try {
      const { accessToken, refreshToken } = getTokens();
      
      if (accessToken && refreshToken) {
        await api.post("/Auth/logout", { accessToken, refreshToken });
        clearTokens();
        return { success: true };
      }
      
      clearTokens();
      return { success: true };
    } catch (error) {
      // Hata oluşsa bile tokenları temizle
      clearTokens();
      
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data;
        return { 
          success: false, 
          errors: errorResponse?.errors || 
                  (errorResponse?.message ? [errorResponse.message] : ["Çıkış işlemi sırasında bir hata oluştu."])
        };
      }
      
      return { 
        success: false, 
        errors: ["Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."] 
      };
    }
  },

  async register(userData: { email: string, password: string, firstName: string, lastName: string }) {
    try {
      const response = await api.post("/Auth/register", userData);
      const data = response.data;
      
      if (data.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          errors: data.errors || (data.message ? [data.message] : ["Kayıt işlemi başarısız oldu."])
        };
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse = error.response?.data;
        return { 
          success: false, 
          errors: errorResponse?.errors || 
                 (errorResponse?.message ? [errorResponse.message] : ["Kayıt işlemi sırasında bir hata oluştu."])
        };
      }
      
      return { 
        success: false, 
        errors: ["Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."] 
      };
    }
  }
};
  
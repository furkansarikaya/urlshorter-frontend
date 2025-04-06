"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { isAuthenticated, AuthService } from "@/lib/auth";

// Auth kontekst tipleri
type AuthContextType = {
  isLoggedIn: boolean | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => Promise<{ success: boolean; errors?: string[] }>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; errors?: string[] }>;
};

// Varsayılan değerler
const defaultContext: AuthContextType = {
  isLoggedIn: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
};

// AuthContext oluşturuluyor
const AuthContext = createContext<AuthContextType>(defaultContext);

// AuthContext Provider bileşeni
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Uygulama yüklendiğinde yerel depoyu kontrol et
  useEffect(() => {
    // İstemci tarafında çalıştırıldığında localStorage'a erişim
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setLoading(false);
    };
    
    checkAuth();
    
    // localStorage değişikliklerini dinle (farklı sekmelerde senkronizasyon için)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Özel bir event listener ekleyerek uygulama içi senkronizasyon sağla
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener("auth-change", handleAuthChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  // Login fonksiyonu
  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    if (result.success) {
      setIsLoggedIn(true);
      // Özel event fırlat
      window.dispatchEvent(new Event("auth-change"));
    }
    return result;
  };

  // Logout fonksiyonu
  const logout = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setIsLoggedIn(false);
      // Özel event fırlat
      window.dispatchEvent(new Event("auth-change"));
    }
    return result;
  };

  // Register fonksiyonu
  const register = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    return await AuthService.register(userData);
  };

  const value = {
    isLoggedIn,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth Hook
export const useAuth = () => useContext(AuthContext); 
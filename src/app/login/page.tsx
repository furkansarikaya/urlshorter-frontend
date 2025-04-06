// app/login/page.tsx
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // Kullanıcı giriş yapmışsa anasayfaya yönlendir
    if (isLoggedIn && !loading) {
      router.push('/');
    }
  }, [isLoggedIn, loading, router]);

  // Loading durumunda bir şey gösterme veya loading animasyonu göster
  if (loading) return null;

  return (
    <div className="max-w-md mx-auto mt-10">
      <LoginForm />
    </div>
  );
}

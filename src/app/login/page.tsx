// app/login/page.tsx
'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // Kullanıcı giriş yapmışsa returnUrl'e yönlendir
    if (isLoggedIn && !loading) {
      router.push(returnUrl);
    }
  }, [isLoggedIn, loading, router, returnUrl]);

  // Loading durumunda bir şey gösterme veya loading animasyonu göster
  if (loading) return null;

  return (
    <div className="max-w-md mx-auto mt-10">
      <LoginForm returnUrl={returnUrl} />
    </div>
  );
}

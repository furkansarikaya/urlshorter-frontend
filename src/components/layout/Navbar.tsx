// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      
      if (result.success) {
        router.push("/");
        // Eğer aynı sayfada kalıyorsa, sayfayı yenile
        if (window.location.pathname === "/") {
          window.location.reload();
        }
      } else {
        // Hata çıksa bile ana sayfaya yönlendir
        router.push("/");
      }
    } catch (error) {
      console.error("Beklenmeyen bir hata oluştu:", error);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">URLShort</Link>
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              <Link href="/create" className="text-sm font-medium hover:underline flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                URL Oluştur
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Yüklenme durumunda hiçbir buton gösterme */}
          {!loading && (
            <>
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/login")}
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push("/register")}
                  >
                    Kayıt Ol
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

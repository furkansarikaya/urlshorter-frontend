'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { ArrowRight, ExternalLink, Link as LinkIcon, Clock, Shield } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  // Hem client-side render hem de auth durumu yüklenene kadar bekle
  if (!mounted || loading) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Kısalt, Paylaş, Analiz Et
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            URL'lerinizi kısaltın, kolay paylaşın ve tıklama istatistiklerini takip edin. 
            Hızlı, güvenli, kullanımı kolay URL kısaltma servisi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="group"
            >
              {isLoggedIn ? "Dashboard'a Git" : "Hemen Başla"} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/about')}
            >
              Daha Fazla Bilgi
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Neden URL Kısaltma Servisi Kullanmalıyım?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <LinkIcon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Kolay Paylaşım</CardTitle>
                  <CardDescription>
                    Uzun ve karmaşık URL'leri kısa ve akılda kalıcı bağlantılara dönüştürün.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Sosyal medyada, e-postalarda veya mesajlarda paylaşım yapmak artık daha kolay.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <ExternalLink className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Detaylı Analitikler</CardTitle>
                  <CardDescription>
                    Bağlantılarınızın performansını ölçün ve analiz edin.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Kaç kişinin bağlantınıza tıkladığını, hangi platformlardan geldiğini görün.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Güvenlik ve Gizlilik</CardTitle>
                  <CardDescription>
                    Bağlantılarınız güvende ve kayıt altında.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Şifreleme ve güvenlik önlemleriyle URL'leriniz koruma altındadır.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isLoggedIn && (
          <section className="py-20 px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Hemen Ücretsiz Hesap Oluşturun</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              URL kısaltmaya başlamak için kayıt olun ve tüm özelliklere erişin.
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push('/register')}
              className="group"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </section>
        )}

        {/* Dashboard Link Section (For logged in users) */}
        {isLoggedIn && (
          <section className="py-20 px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">URL'lerinizi Yönetin</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Dashboard'a giderek kısaltılmış URL'lerinizi görüntüleyebilir ve yönetebilirsiniz.
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push('/dashboard')}
              className="group"
            >
              Dashboard'a Git <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}

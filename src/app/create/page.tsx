'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UrlCreateForm from "@/components/url/UrlCreateForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')} 
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard'a Dön
        </Button>
        <h1 className="text-3xl font-bold">URL Oluştur</h1>
        <p className="text-muted-foreground">
          Uzun URL'nizi kısaltmak için aşağıdaki formu doldurun.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni URL Oluştur</CardTitle>
          <CardDescription>
            Orijinal URL bilgilerini girin. Başlık opsiyoneldir ve URL'nizi hatırlamanıza yardımcı olur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UrlCreateForm />
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">URL Kısaltma İpuçları</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Başlık Kullanımı</h3>
            <p className="text-sm text-muted-foreground">
              Başlık opsiyonel olmakla birlikte, URL'lerinizi daha sonra kolayca tanımlamanıza yardımcı olur.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">URL Süresi</h3>
            <p className="text-sm text-muted-foreground">
              Son kullanma tarihi belirlemek isteğe bağlıdır. Belirtmezseniz, URL'niz süresiz geçerli olacaktır.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Güvenlik</h3>
            <p className="text-sm text-muted-foreground">
              Oluşturduğunuz kısa URL'lerin tıklanma sayılarını dashboard üzerinden takip edebilirsiniz.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium">Sosyal Medya Kullanımı</h3>
            <p className="text-sm text-muted-foreground">
              Kısa URL'ler, sosyal medya platformlarında paylaşım için karakter sınırlamasını aşmanızı engeller.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
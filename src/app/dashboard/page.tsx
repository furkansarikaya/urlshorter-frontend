// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, ListFilter, Loader2, Plus, ArrowRight } from "lucide-react";
import { format, subMonths, isAfter } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UrlList from "@/components/url/UrlList";
import TopUrlsChart from "@/components/url/TopUrlsChart";
import api from "@/lib/api";

interface UrlData {
  id: string;
  title?: string;
  originalUrl: string;
  shortCode: string;
  expiresAt?: string;
  clickCount: number;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    items: UrlData[];
    index: number;
    size: number;
    count: number;
    pages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  message: string;
  errors: string[];
  statusCode: number;
}

export default function DashboardPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "analytics");

  const { data: urlsResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ['urls-dashboard'],
    queryFn: async () => {
      try {
        // Dashboard sayfası için sadece ilk sayfadaki 10 URL'yi getir
        const res = await api.get('/Url?page=1&pageSize=10');
        return res.data;
      } catch (err) {
        throw new Error('URL\'leri yüklerken bir hata oluştu');
      }
    },
    enabled: !!(isLoggedIn && !loading),
  });

  // Statistik hesaplama fonksiyonu
  const calculateStats = () => {
    // API yanıtında urls direkt olarak değil, success kontrolü sonrasında items dizisinde
    const urls = urlsResponse?.success ? urlsResponse.data.items || [] : [];
    const totalCount = urlsResponse?.success ? urlsResponse.data.count || 0 : 0;
    
    // 1. Toplam URL sayısı - API'den gelen toplam sayı kullanılıyor
    const totalUrls = totalCount;
    
    // 2. Toplam tıklanma sayısı - sadece mevcut sayfadaki URL'ler için hesaplanıyor
    const totalClicks = urls.reduce((sum: number, url: UrlData) => sum + url.clickCount, 0);
    
    // 3. Aktif URL'ler (süresi dolmamış) - sadece mevcut sayfadaki URL'ler için hesaplanıyor
    const now = new Date();
    const activeUrls = urls.filter((url: UrlData) => 
      !url.expiresAt || new Date(url.expiresAt) > now
    ).length;
    
    // 4. Son 1 ayda oluşturulan URL'ler - sadece mevcut sayfadaki URL'ler için hesaplanıyor
    const oneMonthAgo = subMonths(new Date(), 1);
    const recentUrls = urls.filter((url: UrlData) => 
      isAfter(new Date(url.createdAt), oneMonthAgo)
    ).length;
    
    return {
      totalUrls,
      totalClicks,
      activeUrls,
      recentUrls
    };
  };

  // Auth kontrolü - loginde değilse login sayfasına yönlendir
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  // Tab değiştiğinde URL parametresini güncelle
  useEffect(() => {
    const newParams = new URLSearchParams(window.location.search);
    if (activeTab !== "analytics") {
      newParams.set("tab", activeTab);
    } else {
      newParams.delete("tab");
    }
    
    const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
    window.history.replaceState(null, '', newUrl);
  }, [activeTab]);

  // URL parametresi değiştiğinde tabı güncelle
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">URL Kısaltma Paneli</h1>
        <p className="text-muted-foreground">
          URL'lerinizi yönetin ve performanslarını takip edin
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button 
          variant={activeTab === "analytics" ? "default" : "outline"} 
          className="gap-2"
          onClick={() => setActiveTab("analytics")}
        >
          <LayoutGrid className="h-4 w-4" />
          Dashboard
        </Button>
        <Button 
          variant={activeTab === "urls" ? "default" : "outline"} 
          className="gap-2"
          onClick={() => setActiveTab("urls")}
        >
          <ListFilter className="h-4 w-4" />
          URL'lerim
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 ml-auto"
          onClick={() => router.push('/create')}
        >
          <Plus className="h-4 w-4" />
          Yeni URL Oluştur
        </Button>
      </div>

      {activeTab === "analytics" && (
        <div className="mb-8">
          {/* Temel istatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam URL Sayısı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '-' : stats.totalUrls}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Toplam Tıklanma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '-' : stats.totalClicks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aktif URL'ler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '-' : stats.activeUrls}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Son 1 Ayda Oluşturulan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? '-' : stats.recentUrls}</div>
              </CardContent>
            </Card>
          </div>

          {/* En Çok Tıklanan URL'ler grafiği */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">URL Analitik Bilgileri</h2>
            </div>
            <TopUrlsChart />
          </div>
          
          {/* Son URL'ler listesi */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Son URL'ler</CardTitle>
              <CardDescription>
                En son oluşturduğunuz kısa URL'ler ve istatistikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UrlList limit={5} showPagination={false} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push('/dashboard?tab=urls')} className="w-full">
                Tüm URL'leri Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {activeTab === "urls" && (
        <Card>
          <CardHeader>
            <CardTitle>URL'lerim</CardTitle>
            <CardDescription>
              Tüm URL'lerinizi görüntüleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UrlList showPagination={true} initialPageSize={10} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

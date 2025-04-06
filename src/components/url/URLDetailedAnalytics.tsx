"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subMonths, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  CalendarRange, 
  Clock, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  RefreshCw, 
  ArrowLeft
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { ChartContainer } from "@/components/ui/chart";

// Types for API responses
interface UrlAnalyticsTimeSeriesItem {
  date: string;
  count: number;
}

interface UrlAnalyticsHourlyItem {
  hour: number;
  count: number;
}

interface UrlAnalyticsReferrer {
  referrer: string;
  count: number;
}

interface UrlAnalyticsDevice {
  deviceType: string;
  count: number;
}

interface UrlAnalyticsBrowser {
  browser: string;
  count: number;
}

interface UrlAnalyticsOS {
  operatingSystem: string;
  count: number;
}

interface UrlAnalyticsCountry {
  country: string;
  count: number;
}

interface UrlAnalyticsData {
  shortCode: string;
  totalClicks: number;
  uniqueVisitors?: number;
  avgClicksPerDay?: number;
  firstClick: string;
  lastClick: string;
  countryStats: UrlAnalyticsCountry[];
  browserStats: UrlAnalyticsBrowser[];
  osStats: UrlAnalyticsOS[];
  deviceStats: UrlAnalyticsDevice[];
  referrerStats: UrlAnalyticsReferrer[];
  hourlyStats: UrlAnalyticsHourlyItem[];
  dailyStats: UrlAnalyticsTimeSeriesItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
  statusCode: number;
}

// Türkçe tarih formatlamak için
const formatTrDate = (dateString: string, formatStr: string = "dd MMM yyyy") => {
  const date = parseISO(dateString);
  return format(date, formatStr, { locale: tr });
};

// Türkiye saatine göre tarih oluşturma (UTC+3)
const createTrDate = (date: Date = new Date()): Date => {
  // Türkiye saati için UTC+3
  const trTimeOffset = 3 * 60; // 3 saat = 180 dakika
  
  // Geçerli zamanı yerel zaman olarak al
  const localDate = new Date(date);
  
  // UTC zamanını al
  const utcTime = localDate.getTime() + (localDate.getTimezoneOffset() * 60000);
  
  // Türkiye saati zamanını oluştur (UTC+3)
  return new Date(utcTime + (trTimeOffset * 60000));
};

export default function URLDetailedAnalytics() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shortCode = searchParams.get('code');

  // Tarih aralığı hesaplama (Türkiye saatine göre)
  const getDateRange = () => {
    const endDate = createTrDate();
    let startDate = createTrDate();
    
    switch (dateRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'year':
        startDate = subMonths(endDate, 12);
        break;
    }
    
    // Başlangıç tarihini günün başına ayarla (00:00:00)
    startDate.setHours(0, 0, 0, 0);
    
    // Bitiş tarihini günün sonuna ayarla (23:59:59)
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  };

  // URL'nin temel bilgilerini getir
  const { data: urlData, isLoading: isUrlLoading } = useQuery({
    queryKey: ['url-details', shortCode],
    queryFn: async () => {
      if (!shortCode) return null;
      
      try {
        // Tıklama sayısını arttıran endpoint yerine sadece URL bilgilerini getiren endpoint kullanılıyor
        // NOT: urlId parametresi yoksa backend'de id üzerinden sorgulama yapabilen bir endpoint kullanın
        const res = await api.get(`/Url/detail/${shortCode}`);
        return res.data;
      } catch (error) {
        console.error("URL bilgileri alınamadı:", error);
        throw error;
      }
    },
    enabled: !!shortCode,
  });

  // Seçilen URL için analitikler
  const { data: urlAnalyticsData, isLoading: isUrlAnalyticsLoading, error: urlAnalyticsError, refetch: refetchUrlAnalytics } = useQuery<ApiResponse<UrlAnalyticsData>>({
    queryKey: ['url-analytics', shortCode, dateRange],
    queryFn: async () => {
      if (!shortCode) return null;
      
      const { startDate, endDate } = getDateRange();
      try {
        const res = await api.get('/Analytic/url-analytics', {
          params: {
            shortCode: shortCode,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });
        return res.data;
      } catch (error) {
        console.error("API error:", error);
        throw error;
      }
    },
    enabled: !!shortCode,
  });

  // Verileri yenile
  const handleRefresh = () => {
    refetchUrlAnalytics();
    toast({
      description: "Analitik verileri yenilendi",
      variant: "default",
    });
  };

  // URL bilgisi yoksa göster
  if (!shortCode) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">URL bulunamadı</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            Analiz edilecek bir URL belirtilmedi. Lütfen geçerli bir URL seçin.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    );
  }

  // İlk ve son tıklama bilgisi
  const renderClickInfoSection = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="border-none bg-muted/20">
              <CardHeader className="p-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <Skeleton className="h-8 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!urlAnalyticsData?.data || (!urlAnalyticsData.data.firstClick && !urlAnalyticsData.data.lastClick)) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-950 to-blue-900 text-white">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium text-blue-200">İlk Tıklama</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-medium text-white">
              {urlAnalyticsData.data.firstClick ? formatTrDate(urlAnalyticsData.data.firstClick, "dd MMM yyyy HH:mm") : "-"}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-950 to-purple-900 text-white">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium text-purple-200">Son Tıklama</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-medium text-white">
              {urlAnalyticsData.data.lastClick ? formatTrDate(urlAnalyticsData.data.lastClick, "dd MMM yyyy HH:mm") : "-"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Seçilen URL için zaman serisi grafiği
  const renderUrlTimeSeriesChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <Clock className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.dailyStats || urlAnalyticsData.data.dailyStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Zaman verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz tıklanma zaman serisi verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.dailyStats.map((item) => ({
      date: formatTrDate(item.date, "dd MMM"),
      value: item.count
    }));

    return (
      <ChartContainer
        config={{
          clicks: {
            label: "Tıklanma",
            color: "hsl(var(--primary))"
          },
        }}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(222, 85%, 60%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(222, 85%, 60%)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(222, 85%, 60%)" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(262, 85%, 60%)" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="date" tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <YAxis tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.date}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-[hsl(222,85%,60%)]"></div>
                        <span>{payload[0].value} tıklanma</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Tıklanma" 
              stroke="url(#colorLine)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(222, 85%, 60%)" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(262, 85%, 60%)" }}
              fillOpacity={0.8}
              fill="url(#colorVisits)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Saatlik istatistik grafiği
  const renderHourlyStatsChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <Clock className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.hourlyStats || urlAnalyticsData.data.hourlyStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Saatlik veri yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz saatlik tıklanma verisi bulunmuyor.
          </p>
        </div>
      );
    }

    // 24 saatlik verileri hazırla, eksik olanları 0 ile doldur
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hourData = urlAnalyticsData.data.hourlyStats.find(item => item.hour === i);
      return {
        hour: i,
        value: hourData ? hourData.count : 0,
        label: `${i}:00`
      };
    });

    return (
      <ChartContainer
        config={{
          clicks: {
            label: "Tıklanma",
            color: "hsl(var(--primary))"
          },
        }}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(329, 85%, 60%)" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="hsl(329, 85%, 60%)" stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="label" 
              tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}}
              interval="preserveStartEnd"
            />
            <YAxis tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.label}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full bg-[hsl(329,85%,60%)]"></div>
                        <span>{payload[0].value} tıklanma</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              name="Tıklanma"
              fill="url(#colorHourly)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Cihaz tipi dağılımı grafiği
  const renderDeviceChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full rounded-lg mx-auto max-w-[300px]" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.deviceStats || urlAnalyticsData.data.deviceStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Cihaz verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz cihaz dağılımı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.deviceStats.map((item) => ({
      name: item.deviceType || "Bilinmeyen",
      value: item.count
    }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = data.reduce((sum, item) => sum + item.value, 0);

    // Renk paleti için tonlar
    const colors = [
      "hsl(222, 85%, 60%)",     // Mavi (Desktop)
      "hsl(150, 85%, 60%)",     // Yeşil (Mobile)
      "hsl(329, 85%, 60%)",     // Pembe (Tablet)
      "hsl(270, 85%, 60%)",     // Mor (TV)
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const index = data.findIndex(item => item.name === payload[0].payload.name);
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span>{value} tıklanma ({((value / totalClicks) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Referrer dağılımı grafiği
  const renderReferrerChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <BarChart3 className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.referrerStats || urlAnalyticsData.data.referrerStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Referrer verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz yönlendiren site verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.referrerStats
      .slice(0, 10) // En fazla 10 referrer göster
      .map((item) => ({
        name: item.referrer ? 
          (item.referrer.length > 30 ? item.referrer.substring(0, 30) + '...' : item.referrer) : 
          "Doğrudan",
        fullName: item.referrer || "Doğrudan",
        value: item.count
      }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = urlAnalyticsData.data.referrerStats.reduce((sum, item) => sum + item.count, 0);

    // Renk gradyeni oluştur
    const colors = [
      "hsl(222, 85%, 60%)",    // Mavi
      "hsl(200, 85%, 65%)",    // Açık Mavi
      "hsl(180, 85%, 60%)",    // Turkuaz
      "hsl(160, 85%, 60%)",    // Yeşil-Turkuaz
      "hsl(140, 85%, 60%)",    // Açık Yeşil
      "hsl(120, 85%, 60%)",    // Yeşil
      "hsl(100, 85%, 60%)",    // Sarı-Yeşil
      "hsl(80, 85%, 60%)",     // Sarımsı
      "hsl(60, 85%, 60%)",     // Sarı
      "hsl(40, 85%, 60%)",     // Turuncu
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
            <XAxis type="number" tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const index = data.findIndex(item => item.name === payload[0].payload.name);
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.fullName}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span>{value} tıklanma ({((value / totalClicks) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              name="Tıklanma"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Tarayıcı dağılımı pasta grafiği
  const renderBrowserChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full rounded-full mx-auto max-w-[200px]" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.browserStats || urlAnalyticsData.data.browserStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Tarayıcı verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz tarayıcı dağılımı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.browserStats.map((item) => ({
      name: item.browser || "Bilinmeyen",
      value: item.count
    }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = data.reduce((sum, item) => sum + item.value, 0);

    // Farklı renkler
    const COLORS = [
      'hsl(217, 91%, 60%)',  // Mavi (Chrome)
      'hsl(29, 91%, 60%)',   // Turuncu (Firefox)
      'hsl(217, 91%, 75%)',  // Açık Mavi (Edge)
      'hsl(120, 91%, 40%)',  // Yeşil (Safari)
      'hsl(271, 91%, 65%)',  // Mor (Opera)
    ];

    return (
      <ChartContainer config={{}} className="aspect-auto h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: payload[0].color }}></div>
                        <span>{value} tıklanma ({((value / totalClicks) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // İşletim sistemi Dağılımı
  const renderOsChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.osStats || urlAnalyticsData.data.osStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">İşletim sistemi verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz işletim sistemi dağılımı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.osStats.map((item) => ({
      name: item.operatingSystem || "Bilinmeyen",
      value: item.count
    }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = data.reduce((sum, item) => sum + item.value, 0);

    // Renk paleti için tonlar
    const colors = [
      "hsl(222, 85%, 60%)",    // Mavi (Windows)
      "hsl(0, 0%, 40%)",       // Gri (macOS)
      "hsl(32, 85%, 60%)",     // Turuncu (Linux)
      "hsl(150, 85%, 60%)",    // Yeşil (Android)
      "hsl(210, 85%, 60%)",    // Mavi (iOS)
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="name" tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <YAxis tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const index = data.findIndex(item => item.name === payload[0].payload.name);
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span>{value} tıklanma ({((value / totalClicks) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              name="Tıklanma"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Ülke dağılımı grafiği
  const renderCountryChart = () => {
    if (isUrlAnalyticsLoading) {
      return (
        <div className="flex items-center justify-center h-60 w-full">
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
          </div>
        </div>
      );
    }

    if (urlAnalyticsError) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <BarChart3 className="h-12 w-12 text-destructive mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Veri yüklenirken hata oluştu</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Veri alınırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      );
    }

    if (!urlAnalyticsData?.data?.countryStats || urlAnalyticsData.data.countryStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Ülke verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz ülke dağılımı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.countryStats
      .slice(0, 10) // En fazla 10 ülke göster
      .map((item) => ({
        name: item.country || "Bilinmeyen",
        value: item.count
      }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = urlAnalyticsData.data.countryStats.reduce((sum, item) => sum + item.count, 0);

    // Renk paleti için farklı tonlar
    const colors = [
      "hsl(222, 85%, 60%)",    // Mavi
      "hsl(262, 85%, 60%)",    // Mor
      "hsl(329, 85%, 60%)",    // Pembe
      "hsl(0, 85%, 60%)",      // Kırmızı
      "hsl(32, 85%, 60%)",     // Turuncu
      "hsl(60, 85%, 60%)",     // Sarı
      "hsl(150, 85%, 60%)",    // Yeşil
      "hsl(186, 85%, 60%)",    // Turkuaz
      "hsl(200, 85%, 60%)",    // Açık Mavi
      "hsl(280, 85%, 60%)",    // Mor
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
            <XAxis type="number" tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const index = data.findIndex(item => item.name === payload[0].payload.name);
                  const value = payload[0].value as number;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span>{value} tıklanma ({((value / totalClicks) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              name="Tıklanma"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        {/* Başlık ve Üst Kontroller */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div className="bg-primary/10 p-2 rounded-md">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">URL Detaylı Analiz</h1>
              {isUrlLoading ? (
                <div className="text-sm text-muted-foreground">
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {urlData?.data?.title ? (
                    <>
                      <span className="font-medium">{urlData.data.title}</span> — <code className="bg-muted px-1 py-0.5 rounded text-xs">{shortCode}</code>
                    </>
                  ) : (
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">{shortCode}</code>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dateRange} onValueChange={(value: string) => setDateRange(value as 'week' | 'month' | 'year')}>
              <SelectTrigger className="w-[180px] bg-muted/40 border-none">
                <SelectValue placeholder="Tarih aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Son 7 gün</SelectItem>
                <SelectItem value="month">Son 30 gün</SelectItem>
                <SelectItem value="year">Son 12 ay</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-muted/40 border-none">
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Ana İstatistik Kartları */}
        {isUrlAnalyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-none bg-muted/20">
                <CardHeader className="p-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : urlAnalyticsData?.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600/90 to-blue-500/90 text-white">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium text-blue-100">Toplam Tıklanma</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold text-white">
                  {urlAnalyticsData.data.totalClicks || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600/90 to-indigo-500/90 text-white">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium text-indigo-100">Tekil Ziyaretçiler</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold text-white">
                  {urlAnalyticsData.data.uniqueVisitors || 0}
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-600/90 to-purple-500/90 text-white">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-medium text-purple-100">Ortalama Günlük Tıklanma</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-2xl font-bold text-white">
                  {urlAnalyticsData.data.avgClicksPerDay || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* İlk ve Son Tıklama Bilgisi */}
        {renderClickInfoSection()}

        {/* Grafikler ve Analizler */}
        <div className="grid gap-4">
          <div className="rounded-lg border bg-card shadow-sm">
            <Tabs defaultValue="timeseries" className="w-full p-1">
              <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                <h3 className="text-lg font-medium">Zaman İstatistikleri</h3>
                <TabsList className="bg-muted/30">
                  <TabsTrigger value="timeseries" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <Clock className="h-4 w-4 mr-2" />
                    Günlük İstatistik
                  </TabsTrigger>
                  <TabsTrigger value="hourly" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <Clock className="h-4 w-4 mr-2" />
                    Saatlik İstatistik
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="timeseries" className="p-4 pt-0">
                {renderUrlTimeSeriesChart()}
              </TabsContent>
              
              <TabsContent value="hourly" className="p-4 pt-0">
                {renderHourlyStatsChart()}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="rounded-lg border bg-card shadow-sm">
            <Tabs defaultValue="browser" className="w-full p-1">
              <div className="px-4 pt-4 pb-2 flex justify-between items-center">
                <h3 className="text-lg font-medium">Detaylı Analiz Bilgileri</h3>
                <TabsList className="bg-muted/30">
                  <TabsTrigger value="browser" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tarayıcılar
                  </TabsTrigger>
                  <TabsTrigger value="os" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    İşletim Sistemleri
                  </TabsTrigger>
                  <TabsTrigger value="device" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Cihaz Tipleri
                  </TabsTrigger>
                  <TabsTrigger value="referrer" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Referrerlar
                  </TabsTrigger>
                  <TabsTrigger value="country" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ülkeler
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="browser" className="p-4 pt-0">
                {renderBrowserChart()}
              </TabsContent>
              
              <TabsContent value="os" className="p-4 pt-0">
                {renderOsChart()}
              </TabsContent>
              
              <TabsContent value="device" className="p-4 pt-0">
                {renderDeviceChart()}
              </TabsContent>

              <TabsContent value="referrer" className="p-4 pt-0">
                {renderReferrerChart()}
              </TabsContent>
              
              <TabsContent value="country" className="p-4 pt-0">
                {renderCountryChart()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 
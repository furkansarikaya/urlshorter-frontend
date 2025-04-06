"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subMonths, subWeeks, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CalendarRange, Clock, BarChart3, PieChart as PieChartIcon, TrendingUp, RefreshCw, BarChart as BarChartIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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

interface TopUrlItem {
  id: string;
  shortCode: string;
  title?: string;
  clickCount: number;
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

// Define payload type for tooltip
interface PieTooltipPayload {
  name: string;
  value: number;
  payload: {
    name: string;
    value: number;
  };
}

// Analitik verilerini gösterecek ana bileşen
export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedUrlCode, setSelectedUrlCode] = useState<string | null>(null);
  const { toast } = useToast();

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

  // En popüler URL'leri getir
  const { data: topUrlsData, isLoading: isTopUrlsLoading, refetch: refetchTopUrls } = useQuery<{data: TopUrlItem[]}>({
    queryKey: ['top-urls', dateRange],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const res = await api.get('/Analytic/top-urls', {
        params: {
          count: 10,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return res.data;
    },
  });

  // Seçilen URL için analitikler
  const { data: urlAnalyticsData, isLoading: isUrlAnalyticsLoading, error: urlAnalyticsError, refetch: refetchUrlAnalytics } = useQuery<ApiResponse<UrlAnalyticsData>>({
    queryKey: ['url-analytics', selectedUrlCode, dateRange],
    queryFn: async () => {
      if (!selectedUrlCode) return null;
      
      const { startDate, endDate } = getDateRange();
      try {
        const res = await api.get('/Analytic/url-analytics', {
          params: {
            shortCode: selectedUrlCode,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });
        console.log("API response:", res.data);
        return res.data;
      } catch (error) {
        console.error("API error:", error);
        throw error;
      }
    },
    enabled: !!selectedUrlCode,
  });

  // URL seçildiğinde
  useEffect(() => {
    if (topUrlsData?.data && topUrlsData.data.length > 0 && !selectedUrlCode) {
      setSelectedUrlCode(topUrlsData.data[0].shortCode);
    }
  }, [topUrlsData, selectedUrlCode]);

  // Verileri yenile
  const handleRefresh = () => {
    refetchTopUrls();
    if (selectedUrlCode) {
      refetchUrlAnalytics();
    }
    toast({
      description: "Analitik verileri yenilendi",
      variant: "default",
    });
  };

  // Popüler URL'leri çubuk grafiği olarak göster
  const renderTopUrlsChart = () => {
    if (isTopUrlsLoading || !topUrlsData?.data) {
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

    if (topUrlsData.data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Henüz veri yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Seçilen tarih aralığında henüz tıklanma verisi bulunmuyor. 
            Daha sonra tekrar kontrol edin.
          </p>
        </div>
      );
    }

    const data = topUrlsData.data.slice(0, 10).map((url) => ({
      name: url.shortCode,
      value: url.clickCount,
      title: url.title || url.shortCode
    }));

    // Renk paleti için tonlar
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
        config={{
          clicks: {
            label: "Tıklanma",
            color: "hsl(var(--primary))"
          },
        }}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            {data.map((_, index) => (
              <defs key={`gradient-${index}`}>
                <linearGradient id={`colorBar${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.5}/>
                </linearGradient>
              </defs>
            ))}
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={12} tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <YAxis tick={{fill: 'hsl(var(--foreground))', opacity: 0.8}} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const index = data.findIndex(item => item.name === payload[0].payload.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{payload[0].payload.title}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
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
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Seçilen URL için zaman serisi grafiği
  const renderUrlTimeSeriesChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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
            <Legend 
              iconType="circle"
              formatter={() => <span className="text-xs ml-1">Tıklanma</span>}
              wrapperStyle={{opacity: 0.8}}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // Saatlik istatistik grafiği
  const renderHourlyStatsChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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

    // Renk paleti için tonlar
    const colors = [
      "hsl(329, 85%, 60%)",    // Pembe
      "hsl(262, 85%, 60%)",    // Mor
    ];

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
                <stop offset="0%" stopColor={colors[0]} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.5}/>
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
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[0] }}></div>
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

  // Referrer dağılımı için pasta grafiği
  const renderReferrerPieChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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

    if (!urlAnalyticsData?.data?.referrerStats || urlAnalyticsData.data.referrerStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Referans verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz referans kaynağı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    const data = urlAnalyticsData.data.referrerStats.map((item) => ({
      name: item.referrer || "Doğrudan",
      value: item.count
    }));

    // Toplam tıklanma sayısını hesapla
    const totalClicks = data.reduce((sum, item) => sum + item.value, 0);

    // Farklı renkler
    const COLORS = [
      'hsl(222, 85%, 60%)',  // Mavi
      'hsl(262, 85%, 60%)',  // Mor
      'hsl(329, 85%, 60%)',  // Pembe
      'hsl(32, 85%, 60%)',   // Turuncu
      'hsl(150, 85%, 60%)',  // Yeşil
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorPie${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorPie${index % COLORS.length})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0] as PieTooltipPayload;
                  const index = data.findIndex(d => d.name === item.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>
                          {item.value} tıklanma ({totalClicks > 0 ? ((item.value / totalClicks) * 100).toFixed(1) : '0'}%)
                        </span>
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

  // Cihaz dağılımı için pasta grafiği
  const renderDevicePieChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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

    // Farklı renkler (cihazlar için farklı bir set kullanalım)
    const COLORS = [
      'hsl(186, 85%, 60%)',  // Turkuaz
      'hsl(329, 85%, 60%)',  // Pembe
      'hsl(150, 85%, 60%)',  // Yeşil
      'hsl(32, 85%, 60%)',   // Turuncu
      'hsl(280, 85%, 60%)',  // Mor
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorDevice${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorDevice${index % COLORS.length})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0] as PieTooltipPayload;
                  const index = data.findIndex(d => d.name === item.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>
                          {item.value} tıklanma ({totalClicks > 0 ? ((item.value / totalClicks) * 100).toFixed(1) : '0'}%)
                        </span>
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

  // İşletim Sistemi Dağılımı
  const renderOsChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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

    // Farklı renkler
    const COLORS = [
      'hsl(217, 91%, 60%)',  // Mavi (Windows)
      'hsl(0, 0%, 25%)',     // Siyah (iOS)
      'hsl(120, 91%, 40%)',  // Yeşil (Android)
      'hsl(271, 91%, 65%)',  // Mor (Linux)
      'hsl(29, 91%, 60%)',   // Turuncu (macOS)
    ];

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorOs${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorOs${index % COLORS.length})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0] as PieTooltipPayload;
                  const index = data.findIndex(d => d.name === item.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>
                          {item.value} tıklanma ({totalClicks > 0 ? ((item.value / totalClicks) * 100).toFixed(1) : '0'}%)
                        </span>
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

  // Ülke Dağılımı
  const renderCountryChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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

    if (!urlAnalyticsData?.data?.countryStats || urlAnalyticsData.data.countryStats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-60 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <h3 className="text-lg font-medium">Ülke verisi yok</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Bu URL için henüz ülke dağılımı verisi bulunmuyor.
          </p>
        </div>
      );
    }

    // En fazla 10 ülkeyi göster
    const data = urlAnalyticsData.data.countryStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        name: item.country || "Bilinmeyen",
        value: item.count
      }));

    // HSL renkleri ile bir renk paleti oluşturma
    const getColorByIndex = (index: number, total: number) => {
      const hue = (index * 360) / (total || 1);
      return `hsl(${hue}, 85%, 60%)`;
    };

    return (
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 70, bottom: 10 }}
          >
            <defs>
              {data.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorCountry${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={getColorByIndex(index, data.length)} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={getColorByIndex(index, data.length)} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  const dataIndex = data.findIndex(d => d.name === item.payload.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{item.payload.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getColorByIndex(dataIndex, data.length) }}></div>
                        <span>{item.value} tıklanma</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorCountry${index})`}
                  stroke="transparent"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  };

  // İlk ve Son Tıklama Bilgisi
  const renderClickInfoSection = () => {
    if (!urlAnalyticsData?.data) return null;
    
    const { firstClick, lastClick } = urlAnalyticsData.data;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              İlk Tıklama
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-medium text-blue-600 dark:text-blue-400">
              {firstClick ? format(new Date(firstClick), "dd MMM yyyy HH:mm:ss", { locale: tr }) : "-"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Son Tıklama
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
              {lastClick ? format(new Date(lastClick), "dd MMM yyyy HH:mm:ss", { locale: tr }) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Tarayıcı Dağılımı
  const renderBrowserChart = () => {
    if (!selectedUrlCode || isUrlAnalyticsLoading) {
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
      <ChartContainer
        config={{}}
        className="aspect-auto h-60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {COLORS.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorBrowser${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorBrowser${index % COLORS.length})`}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0] as PieTooltipPayload;
                  const index = data.findIndex(d => d.name === item.name);
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>
                          {item.value} tıklanma ({totalClicks > 0 ? ((item.value / totalClicks) * 100).toFixed(1) : '0'}%)
                        </span>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-md">
            <CalendarRange className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">URL Analitiği</h2>
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

      {/* En popüler URL'ler grafiği */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            En Çok Tıklanan URL'ler
          </CardTitle>
          <CardDescription>
            Seçilen tarih aralığında en popüler URL'lerin tıklanma sayıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderTopUrlsChart()}
        </CardContent>
      </Card>

      {/* URL ayrıntılı analiz */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                URL Detaylı Analiz
              </CardTitle>
              <CardDescription>
                URL bazında detaylı tıklanma ve davranış analizi
              </CardDescription>
            </div>
            {topUrlsData?.data && topUrlsData.data.length > 0 ? (
              <Select 
                value={selectedUrlCode || ''} 
                onValueChange={setSelectedUrlCode}
              >
                <SelectTrigger className="w-[200px] bg-muted/40 border-none">
                  <SelectValue placeholder="URL seçin" />
                </SelectTrigger>
                <SelectContent>
                  {topUrlsData.data.map((url) => (
                    <SelectItem key={url.shortCode} value={url.shortCode}>
                      {url.title || url.shortCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : isTopUrlsLoading ? (
              <Skeleton className="h-9 w-[200px]" />
            ) : (
              <Badge variant="outline" className="bg-muted/40">Veri yok</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!selectedUrlCode && !isTopUrlsLoading && (!topUrlsData?.data || topUrlsData.data.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-60 text-center p-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
              <h3 className="text-lg font-medium">Henüz URL verisi yok</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Seçilen tarih aralığında analiz edilecek URL bulunamadı. 
                Daha fazla trafik almaya başladığınızda burada detaylı analizler görüntülenecek.
              </p>
            </div>
          ) : selectedUrlCode ? (
            <div className="space-y-6">
              {/* URL Bilgileri */}
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-none bg-muted/20">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Tıklanma</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-2xl font-bold text-primary">
                          {urlAnalyticsData.data.totalClicks || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none bg-muted/20">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tekil Ziyaretçiler</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-2xl font-bold text-primary">
                          {urlAnalyticsData.data.uniqueVisitors || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none bg-muted/20">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ortalama Günlük Tıklanma</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-2xl font-bold text-primary">
                          {urlAnalyticsData.data.avgClicksPerDay || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* İlk ve Son Tıklama Bilgisi */}
                  {renderClickInfoSection()}
                </>
              ) : null}
              
              <Tabs defaultValue="timeseries" className="w-full">
                <TabsList className="mb-4 w-full max-w-md mx-auto grid grid-cols-3 bg-muted/30">
                  <TabsTrigger value="timeseries" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <Clock className="h-4 w-4 mr-2" />
                    Günlük İstatistik
                  </TabsTrigger>
                  <TabsTrigger value="hourly" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <Clock className="h-4 w-4 mr-2" />
                    Saatlik İstatistik
                  </TabsTrigger>
                  <TabsTrigger value="details" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Detaylı Analiz
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeseries">
                  {renderUrlTimeSeriesChart()}
                </TabsContent>
                
                <TabsContent value="hourly">
                  {renderHourlyStatsChart()}
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Referans Kaynakları</h4>
                      {renderReferrerPieChart()}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Cihaz Dağılımı</h4>
                      {renderDevicePieChart()}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Ek Analitik Bilgileri */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Detaylı Analiz Bilgileri</h3>
                <Tabs defaultValue="browser" className="w-full">
                  <TabsList className="mb-4 w-full max-w-md mx-auto grid grid-cols-3 bg-muted/30">
                    <TabsTrigger value="browser" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Tarayıcılar
                    </TabsTrigger>
                    <TabsTrigger value="os" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <PieChartIcon className="h-4 w-4 mr-2" />
                      İşletim Sistemleri
                    </TabsTrigger>
                    <TabsTrigger value="country" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ülkeler
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="browser">
                    {renderBrowserChart()}
                  </TabsContent>
                  
                  <TabsContent value="os">
                    {renderOsChart()}
                  </TabsContent>
                  
                  <TabsContent value="country">
                    {renderCountryChart()}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60">
              <div className="space-y-4 w-full max-w-md">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-8 w-2/3 mx-auto" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
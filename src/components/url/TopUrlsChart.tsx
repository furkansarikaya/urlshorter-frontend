"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays, subMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ChartContainer } from "@/components/ui/chart";
import api from "@/lib/api";

interface TopUrlItem {
  id: string;
  shortCode: string;
  title?: string;
  clickCount: number;
}

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

export default function TopUrlsChart() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const { toast } = useToast();
  const router = useRouter();

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

  // Verileri yenile
  const handleRefresh = () => {
    refetchTopUrls();
    toast({
      description: "Analitik verileri yenilendi",
      variant: "default",
    });
  };

  // URL Analiz sayfasına yönlendir
  const goToAnalytics = (shortCode: string) => {
    router.push(`/analytics?code=${shortCode}`);
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
              onClick={(data) => goToAnalytics(data.name)}
              cursor="pointer"
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

  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              En Çok Tıklanan URL'ler
            </CardTitle>
            <CardDescription>
              Seçilen tarih aralığında en popüler URL'lerin tıklanma sayıları
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={dateRange} onValueChange={(value: string) => setDateRange(value as 'week' | 'month' | 'year')}>
              <SelectTrigger className="w-[150px] bg-muted/40 border-none h-8 text-xs">
                <SelectValue placeholder="Tarih aralığı" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Son 7 gün</SelectItem>
                <SelectItem value="month">Son 30 gün</SelectItem>
                <SelectItem value="year">Son 12 ay</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="bg-muted/40 border-none h-8">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderTopUrlsChart()}
      </CardContent>
    </Card>
  );
} 
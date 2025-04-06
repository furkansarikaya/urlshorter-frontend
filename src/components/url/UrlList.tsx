// src/components/url/UrlList.tsx

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Copy, ExternalLink, Loader2, MoreHorizontal, Trash2, Edit, Clock, BarChart } from "lucide-react";
import { format, isValid } from "date-fns";
import { tr } from "date-fns/locale";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorHandler } from '@/components/ui/ErrorHandler';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type UrlData = {
  id: string;
  title?: string;
  originalUrl: string;
  shortCode: string;
  expiresAt?: string;
  clickCount: number;
  createdAt: string;
  updatedAt?: string;
};

interface ApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
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

interface UrlListProps {
  limit?: number;
  showPagination?: boolean;
  initialPage?: number;
  initialPageSize?: number;
}

export default function UrlList({ limit, showPagination = true, initialPage = 1, initialPageSize = 10 }: UrlListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  // URL parametre değişimi için state
  const [currentPage, setCurrentPage] = useState(
    searchParams.get("page") ? parseInt(searchParams.get("page") as string) : initialPage
  );
  const [pageSize, setPageSize] = useState(
    searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize") as string) : limit || initialPageSize
  );

  // Bir sonraki sayfa yüklenirken animasyon için
  const [isChangingPage, setIsChangingPage] = useState(false);

  // URL'leri getir
  const { data: urlsResponse, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['urls', currentPage, pageSize, !!limit],
    queryFn: async () => {
      setIsChangingPage(true);
      try {
        // Sayfalama parametreleri
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        
        // Limit parametresi verildiyse ve sayfalama gösterilmiyorsa, limit değerini kullan
        const effectivePageSize = limit || pageSize;
        params.append('pageSize', effectivePageSize.toString());

        const res = await api.get(`/Url?${params.toString()}`);
        return res.data;
      } catch (err) {
        // Set the error state
        if (err instanceof Error) {
          setError(err);
        }
        throw err;
      } finally {
        setIsChangingPage(false);
      }
    },
  });

  // URL parametrelerini güncelle
  useEffect(() => {
    if (showPagination) {
      const params = new URLSearchParams(window.location.search);
      params.set('page', currentPage.toString());
      params.set('pageSize', pageSize.toString());
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [currentPage, pageSize, showPagination]);

  // URL silme işlemi için mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/Url/${id}`),
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "URL başarıyla silindi",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['urls'] });
    },
    onError: () => {
      toast({
        title: "Hata!",
        description: "URL silinirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  // URL'yi kopyala
  const copyToClipboard = (shortCode: string) => {
    // Tam URL oluştur
    const shortUrl = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl).then(() => {
      toast({
        description: "URL panoya kopyalandı",
        variant: "default",
      });
    }).catch(() => {
      toast({
        title: "Hata!",
        description: "URL kopyalanırken bir hata oluştu",
        variant: "destructive",
      });
    });
  };

  // Kısa URL'yi aç
  const openShortUrl = (shortCode: string, e: React.MouseEvent) => {
    e.preventDefault();
    const shortUrl = `${window.location.origin}/${shortCode}`;
    window.open(shortUrl, '_blank');
  };

  // URL'nin analiz sayfasına git
  const viewAnalytics = (shortCode: string) => {
    router.push(`/analytics?code=${shortCode}`);
  };

  // URL'yi sil
  const deleteUrl = (id: string) => {
    deleteMutation.mutate(id);
  };

  // URL'yi düzenle
  const editUrl = (id: string) => {
    router.push(`/edit/${id}`);
  };

  // Tarih formatla (expiresAt null olabilir)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    
    const date = new Date(dateString);
    if (!isValid(date)) return "-";
    
    return format(date, "dd MMM yyyy HH:mm", { locale: tr });
  };

  // Sayfa değiştirme işlemleri
  const goToPage = (page: number) => {
    if (page >= 1 && (!urlsResponse?.data || page <= urlsResponse.data.pages)) {
      setCurrentPage(page);
    }
  };

  // Sayfalama komponentini render et
  const renderPagination = () => {
    if (!showPagination || !urlsResponse?.success || !urlsResponse.data || urlsResponse.data.pages <= 1) {
      return null;
    }

    // 5'ten fazla sayfa varsa, ellipsis kullan
    const totalPages = urlsResponse.data.pages;
    const currentPageNum = urlsResponse.data.index;

    // Sayfa numaralarını görüntüleme mantığı
    let pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      // 7 veya daha az sayfa varsa, tümünü göster
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Her zaman ilk ve son sayfayı, ve mevcut sayfanın etrafında 2 sayfa göster
      pages.push(1);
      
      if (currentPageNum > 3) {
        pages.push('ellipsis');
      }
      
      // Mevcut sayfanın etrafındaki sayfalar
      const start = Math.max(2, currentPageNum - 1);
      const end = Math.min(totalPages - 1, currentPageNum + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPageNum < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }

    return (
      <Pagination className="my-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => goToPage(currentPageNum - 1)}
              className={!urlsResponse.data.hasPrevious ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {pages.map((page, i) => 
            page === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === currentPageNum}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => goToPage(currentPageNum + 1)}
              className={!urlsResponse.data.hasNext ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Yükleme durumu
  if (isLoading && !isChangingPage) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">URL'ler yükleniyor...</span>
      </div>
    );
  }

  // Hata durumu
  if (isError || error) {
    return (
      <ErrorHandler error={error || queryError} />
    );
  }

  // URL'ler boş mu?
  const urls = urlsResponse?.success ? urlsResponse.data.items : [];
  
  // Tüm URL'leri göster, limit uygulanmaz (API üzerinden zaten sayfalama yapılıyor)
  const displayUrls = urls;

  if (urls.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Henüz hiç URL oluşturmadınız.</p>
        <Button className="mt-4" onClick={() => router.push('/create')}>
          Yeni URL Oluştur
        </Button>
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Kısa URL</TableHead>
              <TableHead className="text-center">Tıklanma</TableHead>
              <TableHead className="hidden md:table-cell">Oluşturma</TableHead>
              <TableHead className="hidden lg:table-cell">Son Güncelleme</TableHead>
              <TableHead className="hidden md:table-cell">Son Kullanma</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isChangingPage ? "opacity-60" : ""}>
            {displayUrls.map((url: UrlData) => (
              <TableRow key={url.id}>
                <TableCell className="font-medium">{url.title || "-"}</TableCell>
                <TableCell>
                  <a 
                    href="#" 
                    onClick={(e) => openShortUrl(url.shortCode, e)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {url.shortCode}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="px-2 hover:bg-primary/10"
                    onClick={() => viewAnalytics(url.shortCode)}
                  >
                    <span>{url.clickCount}</span>
                    <BarChart className="ml-1 h-3 w-3 text-muted-foreground" />
                  </Button>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(url.createdAt)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Oluşturulma Tarihi</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(url.updatedAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {url.expiresAt ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formatDate(url.expiresAt)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Son Kullanma Tarihi</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">İşlemler</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => copyToClipboard(url.shortCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Kopyala
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => viewAnalytics(url.shortCode)}>
                        <BarChart className="h-4 w-4 mr-2" />
                        İstatistikler
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => editUrl(url.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive hover:!bg-destructive/10"
                        onClick={() => deleteUrl(url.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sayfalama */}
      {renderPagination()}
    </div>
  );
}

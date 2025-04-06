'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import axios from 'axios';

// API yanıt tipi
interface ApiResponse {
  success: boolean;
  data: string | null;
  message: string;
  errors: string[];
  statusCode: number;
}

export default function ShortUrlRedirect() {
  const params = useParams();
  const router = useRouter();
  const shortCode = params.shortCode as string;
  const [error, setError] = useState<{ message: string; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching URL:", `${API_BASE_URL}/Url/redirect/${shortCode}`);

        // Axios kullanarak API yanıtını al
        const response = await axios.get<ApiResponse>(`${API_BASE_URL}/Url/redirect/${shortCode}`, {
          validateStatus: () => true, // Tüm HTTP durum kodlarını kabul et
        });

        console.log("API response:", response.status, response.data);

        // Başarılı API yanıtı - URL'yi al ve yönlendir
        if (response.data.success && response.data.data) {
          const targetUrl = response.data.data;
          console.log("Redirecting to:", targetUrl);
          
          // setTimeout ile browser'ın state güncellemesine zaman ver
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 100);
          
          return;
        }

        // API error response
        setError({
          message: response.data.message || 'URL işlenirken bir hata oluştu',
          errors: response.data.errors || []
        });
        setLoading(false);
      } catch (err) {
        console.error("Redirect error:", err);
        setError({
          message: 'Bağlantı sırasında bir hata oluştu',
          errors: [err instanceof Error ? err.message : 'Bilinmeyen bir hata']
        });
        setLoading(false);
      }
    };

    if (shortCode) {
      fetchData();
    }
  }, [shortCode]);

  // Hata göster
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">Hata Oluştu</h1>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            <p className="text-lg">{error.message}</p>
          </div>
          
          {error.errors && error.errors.length > 0 && (
            <div className="mt-2 text-sm">
              <ul className="list-disc list-inside space-y-1">
                {error.errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-muted-foreground text-sm text-center mb-4">
            Bu URL geçersiz olabilir veya süresi dolmuş olabilir.
          </p>
          
          <div className="flex justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Yükleme durumu
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-6 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h2 className="text-xl font-medium mb-2">Yönlendiriliyor...</h2>
        <p className="text-sm text-muted-foreground text-center">Kısa bir süre bekleyin.</p>
      </div>
    );
  }

  return null;
} 
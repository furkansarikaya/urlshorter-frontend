import React from 'react';
import { AlertCircle, Ban, FileWarning, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: boolean;
  data: any;
  message: string;
  errors: string[];
  statusCode: number;
}

interface ErrorHandlerProps {
  error: AxiosError<ApiErrorResponse> | Error | null;
  className?: string;
  showDetails?: boolean;
}

export function ErrorHandler({ error, className = '', showDetails = false }: ErrorHandlerProps) {
  if (!error) return null;

  let statusCode = 0;
  let title = 'Bir hata oluştu';
  let message = 'İşleminiz sırasında beklenmeyen bir hata oluştu.';
  let errorList: string[] = [];
  let variant: 'default' | 'destructive' = 'default';
  let Icon = AlertCircle;

  // Parse AxiosError
  if (error instanceof AxiosError && error.response) {
    const errorData = error.response.data as ApiErrorResponse;
    statusCode = error.response.status;
    
    if (errorData) {
      message = errorData.message || message;
      errorList = errorData.errors || [];
    }

    // Set appropriate error messages and icons based on status code
    if (statusCode === 404) {
      title = 'Kayıt bulunamadı';
      message = 'Aradığınız içerik bulunamadı.';
      Icon = FileWarning;
    } else if (statusCode === 400) {
      title = 'Geçersiz istek';
      message = 'İstek formatı geçersiz veya eksik.';
      Icon = Info;
      variant = 'destructive';
    } else if (statusCode === 401) {
      title = 'Yetkilendirme hatası';
      message = 'Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.';
      Icon = Ban;
    } else if (statusCode === 403) {
      title = 'Erişim reddedildi';
      message = 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
      Icon = Ban;
      variant = 'destructive';
    } else if (statusCode >= 500) {
      title = 'Sunucu hatası';
      message = 'Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      variant = 'destructive';
    }
  } else if (error instanceof Error) {
    // Handle custom API error object
    if ((error as any).apiErrors) {
      message = error.message;
      errorList = (error as any).apiErrors || [];
      statusCode = (error as any).statusCode || 0;
      
      // Set appropriate title and icon based on status code
      if (statusCode === 404) {
        title = 'Kayıt bulunamadı';
        Icon = FileWarning;
      } else if (statusCode === 400) {
        title = 'Geçersiz istek';
        Icon = Info;
        variant = 'destructive';
      } else if (statusCode === 401) {
        title = 'Yetkilendirme hatası';
        Icon = Ban;
      } else if (statusCode === 403) {
        title = 'Erişim reddedildi';
        Icon = Ban;
        variant = 'destructive';
      } else if (statusCode >= 500) {
        title = 'Sunucu hatası';
        variant = 'destructive';
      }
    } else {
      // Handle regular JS errors
      message = error.message;
    }
  }

  return (
    <Alert variant={variant} className={`mb-4 ${className}`}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        
        {(showDetails || true) && errorList.length > 0 && (
          <div className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errorList.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {(showDetails || true) && statusCode > 0 && (
          <p className="text-xs mt-2 text-muted-foreground">
            Durum Kodu: {statusCode}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

export function FullPageErrorDisplay({ error }: { error: AxiosError<ApiErrorResponse> | Error }) {
  let title = 'Bir hata oluştu';
  let message = 'İşleminiz sırasında beklenmeyen bir hata oluştu.';
  let details = '';
  let statusCode = 0;
  let errorList: string[] = [];
  
  if (error instanceof AxiosError && error.response) {
    const errorData = error.response.data as ApiErrorResponse;
    statusCode = error.response.status;
    
    if (errorData) {
      message = errorData.message || message;
      errorList = errorData.errors || [];
      details = errorList.join(', ') || '';
    }
    
    if (statusCode === 404) {
      title = 'Kayıt bulunamadı';
      message = 'Aradığınız içerik bulunamadı.';
    } else if (statusCode === 400) {
      title = 'Geçersiz istek';
    } else if (statusCode === 401) {
      title = 'Yetkilendirme hatası';
      message = 'Bu işlemi gerçekleştirmek için giriş yapmanız gerekiyor.';
    } else if (statusCode === 403) {
      title = 'Erişim reddedildi';
      message = 'Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor.';
    } else if (statusCode >= 500) {
      title = 'Sunucu hatası';
      message = 'Sunucu tarafında bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
    }
  } else if (error instanceof Error) {
    // Handle custom API error object with additional error details
    if ((error as any).apiErrors) {
      message = error.message;
      errorList = (error as any).apiErrors || [];
      statusCode = (error as any).statusCode || 0;
      details = errorList.join(', ') || '';
      
      // Set appropriate title based on status code
      if (statusCode === 404) {
        title = 'Kayıt bulunamadı';
      } else if (statusCode === 400) {
        title = 'Geçersiz istek';
      } else if (statusCode === 401) {
        title = 'Yetkilendirme hatası';
      } else if (statusCode === 403) {
        title = 'Erişim reddedildi';
      } else if (statusCode >= 500) {
        title = 'Sunucu hatası';
      }
    } else {
      message = error.message;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-center mb-3">{message}</p>
      {errorList.length > 0 && (
        <div className="mb-6 max-w-md w-full">
          <ul className="text-sm text-muted-foreground bg-muted p-4 rounded-md list-disc list-inside space-y-1">
            {errorList.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {statusCode > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Durum Kodu: {statusCode}
        </p>
      )}
      <p className="text-sm text-muted-foreground text-center">
        Bu URL geçersiz olabilir veya süresi dolmuş olabilir.
      </p>
      <a 
        href="/"
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
} 
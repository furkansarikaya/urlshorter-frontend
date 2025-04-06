'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import api from "@/lib/api";

// Form için Zod şeması
const formSchema = z.object({
  title: z.string().optional(),
  originalUrl: z.string().url("Geçerli bir URL giriniz").min(1, "URL zorunludur"),
  expiresAt: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditUrlPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Mevcut URL verilerini al
  const { data: urlData, isLoading: isUrlLoading } = useQuery({
    queryKey: ['url', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/Url/${id}`);
        return res.data;
      } catch (error: any) {
        setError(error.response?.data?.message || "URL bilgileri yüklenirken bir hata oluştu.");
        return null;
      }
    },
    enabled: !!(isLoggedIn && !loading && id),
  });

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      originalUrl: "",
      expiresAt: null,
    },
  });

  // URL verisi geldiğinde formu doldur
  useEffect(() => {
    if (urlData?.data) {
      const url = urlData.data;
      form.reset({
        title: url.title || "",
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt ? new Date(url.expiresAt) : null,
      });
    }
  }, [urlData, form]);

  // URL güncelleme için mutation
  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      // expiresAt'ı ISO string formatına çevir (null ise göndermeyecek)
      const data = {
        id,
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };
      return api.put(`/Url/${id}`, data);
    },
    onSuccess: () => {
      // Başarılı olduğunda
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['url', id] });
      toast({
        title: "Başarılı!",
        description: "URL başarıyla güncellendi",
        variant: "default",
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      // Hata durumunda
      setError(error.response?.data?.message || "URL güncellenirken bir hata oluştu.");
    },
  });

  // Form gönderildiğinde
  function onSubmit(values: FormValues) {
    updateMutation.mutate(values);
  }

  // Auth kontrolü
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, loading, router]);

  if (loading || isUrlLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
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
        <h1 className="text-3xl font-bold">URL Düzenle</h1>
        <p className="text-muted-foreground">
          URL bilgilerini güncelleyebilirsiniz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>URL Düzenle</CardTitle>
          <CardDescription>
            Kısa URL bilgilerinizi güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-6 p-4 bg-muted rounded-md">
            <h3 className="text-sm font-medium mb-2">Kısa URL Bilgisi</h3>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-background rounded text-sm">
                {urlData?.data?.shortCode ? `${window.location.origin}/${urlData.data.shortCode}` : 'Yükleniyor...'}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (urlData?.data?.shortCode) {
                    const shortUrl = `${window.location.origin}/${urlData.data.shortCode}`;
                    navigator.clipboard.writeText(shortUrl);
                    toast({
                      description: "URL panoya kopyalandı.",
                      variant: "default",
                    });
                  }
                }}
              >
                Kopyala
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Tıklanma:</span> {urlData?.data?.clickCount || 0}
              </div>
              <div>
                <span className="font-medium">Oluşturulma:</span> {urlData?.data?.createdAt ? new Date(urlData.data.createdAt).toLocaleString('tr-TR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }) : '-'}
              </div>
              {urlData?.data?.updatedAt && (
                <div className="col-span-2">
                  <span className="font-medium">Son Güncelleme:</span> {new Date(urlData.data.updatedAt).toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </div>
              )}
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlık (opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="URL için bir başlık giriniz" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL'nizi tanımlamak için kısa bir başlık.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="originalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orijinal URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ornek.com/uzun-url" {...field} />
                    </FormControl>
                    <FormDescription>
                      Kısaltmak istediğiniz URL. Başında "http://" veya "https://" olmalıdır.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Son Kullanma Tarihi (opsiyonel)</FormLabel>
                    <FormControl>
                      <DatePicker 
                        selected={field.value} 
                        onChange={(date) => field.onChange(date)}
                        minDate={new Date()}
                        showTimeSelect
                        placeholderText="Son kullanma tarihi seçin"
                        dateFormat="dd/MM/yyyy HH:mm"
                        timeFormat="HH:mm"
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>
                      URL'nin ne zaman geçersiz olacağını seçin. Boş bırakılırsa süresiz olacaktır.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
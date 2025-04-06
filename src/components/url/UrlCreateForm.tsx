"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

// Form için Zod şeması
const formSchema = z.object({
  title: z.string().optional(),
  originalUrl: z.string().url("Geçerli bir URL giriniz").min(1, "URL zorunludur"),
  expiresAt: z.date().nullable().optional(),
});

export default function UrlCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // React Hook Form ile form yönetimi
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      originalUrl: "",
      expiresAt: null,
    },
  });
  
  // API isteği için Mutation
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      // expiresAt'ı ISO string formatına çevir (null ise göndermeyecek)
      const data = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
      };
      return api.post('/Url/shorten', data);
    },
    onSuccess: () => {
      // Başarılı olduğunda
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      form.reset(); // Formu sıfırla
      setError(null);
      toast({
        title: "Başarılı!",
        description: "URL başarıyla oluşturuldu",
        variant: "default",
      });
    },
    onError: (error: any) => {
      // Hata durumunda
      setError(error.response?.data?.message || "URL oluşturulurken bir hata oluştu.");
    },
  });
  
  // Form gönderildiğinde
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
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
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://ornek.com/uzun-url" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </div>
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
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Oluşturuluyor..." : "URL Oluştur"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

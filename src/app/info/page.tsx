'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

// Metadata artık client component içinde kullanılamıyor, ayrı bir dosyaya taşıyoruz
// Detaylı bilgi: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

export default function InfoPage() {
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">URL Kısaltma Hizmeti Hakkında</h1>
        <p className="text-xl text-muted-foreground mb-10">
          URL kısaltma hizmetimizi kullanarak uzun bağlantılarınızı kısaltın, yönetin ve takip edin.
        </p>

        <Tabs defaultValue="about" className="mb-10">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">Hakkında</TabsTrigger>
            <TabsTrigger value="howto">Nasıl Kullanılır</TabsTrigger>
            <TabsTrigger value="faq">Sık Sorulan Sorular</TabsTrigger>
            <TabsTrigger value="tips">Kullanım İpuçları</TabsTrigger>
          </TabsList>
          
          {/* Hakkında Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>URL Kısaltma Hizmeti Nedir?</CardTitle>
                <CardDescription>
                  Hizmetimizin temel özellikleri ve avantajları hakkında bilgi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold">Neden URL Kısaltma?</h3>
                <p>
                  URL kısaltma hizmeti, uzun ve karmaşık web adreslerini daha kısa, kullanımı kolay bağlantılara dönüştürmenizi sağlar. Bu hizmet sayesinde:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sosyal medyada daha temiz ve profesyonel görünen bağlantılar paylaşabilirsiniz</li>
                  <li>Karakter sınırı olan platformlarda alan tasarrufu yapabilirsiniz</li>
                  <li>Bağlantı tıklama istatistiklerini takip edebilirsiniz</li>
                  <li>Kısa URL'lerin nereye yönlendirdiğini yönetebilirsiniz</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6">Temel Özellikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium">Hızlı Kısaltma</h4>
                    <p className="text-sm text-muted-foreground">Tek tıklamayla herhangi bir URL'yi anında kısaltın.</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium">Detaylı Analitikler</h4>
                    <p className="text-sm text-muted-foreground">Tıklama sayısı, lokasyon, cihaz gibi verileri takip edin.</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium">Özel URL'ler</h4>
                    <p className="text-sm text-muted-foreground">Markalaşma için özel URL kısaltmaları oluşturun.</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium">Güvenlik</h4>
                    <p className="text-sm text-muted-foreground">SSL korumalı bağlantılar ve zararlı site kontrolü.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Nasıl Kullanılır Tab */}
          <TabsContent value="howto">
            <Card>
              <CardHeader>
                <CardTitle>Nasıl Kullanılır?</CardTitle>
                <CardDescription>URL kısaltma hizmetimizi kullanmaya başlamak için adım adım rehber.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
                    Kayıt Olun
                  </h3>
                  <p className="ml-8 text-muted-foreground">
                    Hizmetimizi kullanmak için öncelikle bir hesap oluşturmanız gerekiyor. 
                    <Link href="/register" className="text-primary hover:underline ml-1">Kayıt sayfasına</Link> giderek e-posta ve şifrenizle hızlıca kaydolabilirsiniz.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
                    URL Oluşturun
                  </h3>
                  <p className="ml-8 text-muted-foreground">
                    Dashboard sayfasına giderek "Yeni URL" butonuna tıklayın. Kısaltmak istediğiniz URL'yi girin ve isteğe bağlı olarak özel bir kısa kod belirleyin.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span>
                    URL'nizi Paylaşın
                  </h3>
                  <p className="ml-8 text-muted-foreground">
                    Oluşturulan kısa URL'yi kopyalayın ve sosyal medya, e-posta veya istediğiniz herhangi bir platformda paylaşın.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">4</span>
                    İstatistikleri Takip Edin
                  </h3>
                  <p className="ml-8 text-muted-foreground">
                    Dashboard'dan URL'lerinizin performansını izleyin. Tıklama sayısı, coğrafi konum, tarayıcı ve cihaz bilgilerini görüntüleyin.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-muted mt-4">
                  <h4 className="font-medium">İpucu</h4>
                  <p className="text-sm">URL'lerinizi düzenleme, silme veya son kullanma tarihi belirleme gibi işlemler için Dashboard'daki URL listesinden ilgili URL'yi seçin.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sık Sorulan Sorular Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Sık Sorulan Sorular</CardTitle>
                <CardDescription>URL kısaltma hizmetimiz hakkında sık sorulan sorular ve yanıtları.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">Kısaltılan URL'ler ne kadar süre geçerli kalır?</h3>
                    <p className="text-muted-foreground mt-1">
                      Oluşturduğunuz URL'ler varsayılan olarak süresiz geçerlidir. Ancak URL oluştururken veya daha sonra düzenleyerek bir son kullanma tarihi belirleyebilirsiniz.
                    </p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold">URL kısaltma hizmeti ücretli mi?</h3>
                    <p className="text-muted-foreground mt-1">
                      Temel hizmetimiz ücretsizdir. Ancak daha gelişmiş analitikler, özel domain kullanımı ve toplu URL yönetimi gibi premium özellikler için ücretli planlarımız mevcuttur.
                    </p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold">Kısaltılan URL'lerin güvenliği nasıl sağlanıyor?</h3>
                    <p className="text-muted-foreground mt-1">
                      Tüm URL'ler oluşturulmadan önce zararlı içerik kontrolünden geçirilir. Ayrıca, kullanıcıların URL'lerinin yetkisiz kişiler tarafından değiştirilmesini önlemek için güvenlik önlemleri alınmıştır.
                    </p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold">Özel URL kısaltmaları oluşturabilir miyim?</h3>
                    <p className="text-muted-foreground mt-1">
                      Evet, URL oluştururken özel bir kısa kod belirleyebilirsiniz. Örneğin, "example.com/ozel-kod" şeklinde bir URL oluşturabilirsiniz. Özel kodlar benzersiz olmalıdır.
                    </p>
                  </div>
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-semibold">URL istatistiklerini nasıl görebilirim?</h3>
                    <p className="text-muted-foreground mt-1">
                      Dashboard'daki URL listesinden ilgili URL'nin yanındaki "İstatistikler" butonuna tıklayarak detaylı analitiklere ulaşabilirsiniz. Burada tıklama sayısı, coğrafi dağılım, tarayıcı ve cihaz bilgilerini görebilirsiniz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Kullanım İpuçları Tab */}
          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <CardTitle>Kullanım İpuçları</CardTitle>
                <CardDescription>URL kısaltma hizmetimizden en iyi şekilde yararlanmak için ipuçları.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">UTM Parametreleri Ekleyin</h3>
                    <p className="text-muted-foreground">
                      URL'lerinize UTM parametreleri ekleyerek kampanya takibini kolaylaştırın. Örneğin: <code>?utm_source=twitter&utm_medium=post</code>
                    </p>
                    <p className="text-sm mt-2">
                      Bu şekilde hangi platformların ve kampanyaların daha etkili olduğunu analiz edebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">Anlamlı Özel Kodlar Kullanın</h3>
                    <p className="text-muted-foreground">
                      Rastgele kodlar yerine, içeriğinizle ilgili anlamlı özel kodlar kullanın. Örneğin: <code>/yeni-urun</code>
                    </p>
                    <p className="text-sm mt-2">
                      Bu, kullanıcıların URL'nin nereye yönlendirdiğini tahmin etmesini kolaylaştırır ve güven oluşturur.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">QR Kodları Kullanın</h3>
                    <p className="text-muted-foreground">
                      Kısaltılmış URL'leriniz için QR kodları oluşturun ve basılı materyallerinizde kullanın.
                    </p>
                    <p className="text-sm mt-2">
                      Bu, kullanıcıların fiziksel dünyadan dijital içeriğinize kolayca erişmesini sağlar.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">Düzenli Analiz Yapın</h3>
                    <p className="text-muted-foreground">
                      URL'lerinizin performansını düzenli olarak kontrol edin ve içerik stratejinizi buna göre ayarlayın.
                    </p>
                    <p className="text-sm mt-2">
                      Hangi saatlerde ve hangi günlerde daha fazla tıklama aldığınızı analiz ederek paylaşım zamanlarınızı optimize edin.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">A/B Testi Yapın</h3>
                    <p className="text-muted-foreground">
                      Aynı hedef URL için farklı kısaltılmış URL'ler oluşturun ve hangisinin daha iyi performans gösterdiğini test edin.
                    </p>
                    <p className="text-sm mt-2">
                      Bu, pazarlama stratejinizi sürekli iyileştirmenize yardımcı olur.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-5 bg-card">
                    <h3 className="text-lg font-semibold mb-2">Son Kullanma Tarihi Belirleyin</h3>
                    <p className="text-muted-foreground">
                      Sınırlı süreli kampanyalar için URL'lerinize son kullanma tarihi ekleyin.
                    </p>
                    <p className="text-sm mt-2">
                      Bu, eski ve artık geçerli olmayan bağlantıların kullanılmasını önler.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            URL kısaltma hizmetimizi kullanmaya başlamak için hemen kayıt olun ve ilk kısa URL'nizi oluşturun.
          </p>
          <div className="flex gap-4 justify-center">
            {!mounted || !isLoggedIn ? (
              <Link href="/register" className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90">
                Kayıt Ol
              </Link>
            ) : null}
            {mounted && isLoggedIn ? (
              <Link href="/dashboard" className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/90">
                Dashboard'a Git
              </Link>
            ) : (
              <Link href="/login?returnUrl=/dashboard" className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:bg-secondary/90">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
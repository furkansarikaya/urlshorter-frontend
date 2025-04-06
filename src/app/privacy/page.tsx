import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, Server, Cookie, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Giriş
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener ("biz", "bizim", "şirketimiz") olarak, gizliliğinize saygı duyuyoruz ve kişisel verilerinizin korunmasını önemsiyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken toplanan, işlenen ve saklanan bilgilerinizin nasıl ele alındığını açıklamaktadır.
            </p>
            <p>
              URL kısaltma hizmetimizi kullanarak, bu politikada belirtilen uygulamaları kabul etmiş olursunuz. Politikamızı düzenli olarak güncelleyebiliriz, bu nedenle zaman zaman kontrol etmenizi öneririz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Topladığımız Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Kullanıcı Tarafından Sağlanan Bilgiler</h3>
            <p>
              Hizmetimize kaydolduğunuzda veya URL kısaltma hizmetimizi kullandığınızda, aşağıdaki bilgileri topluyoruz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>İsim, e-posta adresi ve şifre gibi hesap bilgileri</li>
              <li>Kısaltmak istediğiniz orijinal URL'ler</li>
              <li>Özel URL kısaltmaları için belirlediğiniz kısa kodlar</li>
              <li>İletişim formları aracılığıyla gönderdiğiniz bilgiler</li>
            </ul>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold">Otomatik Olarak Toplanan Bilgiler</h3>
            <p>
              Hizmetimizi kullandığınızda, sistem aşağıdaki bilgileri otomatik olarak toplar:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP adresi</li>
              <li>Tarayıcı türü ve sürümü</li>
              <li>İşletim sistemi</li>
              <li>Cihaz bilgileri</li>
              <li>Kısaltılan URL'lerin tıklanma zamanları ve sayıları</li>
              <li>Kısaltılan URL'lere erişen kullanıcıların coğrafi konumları (ülke/şehir düzeyinde)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Bilgilerin Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Topladığımız bilgileri aşağıdaki amaçlar için kullanırız:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>URL kısaltma hizmetini sağlamak ve geliştirmek</li>
              <li>Hesabınızı yönetmek ve güvenliğini sağlamak</li>
              <li>Hizmet kullanımına ilişkin istatistikleri size sunmak</li>
              <li>Teknik sorunları çözmek ve hizmet kalitesini iyileştirmek</li>
              <li>Sizinle iletişim kurmak ve destek sağlamak</li>
              <li>Yasal yükümlülüklere uymak</li>
            </ul>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold">Analitik ve İstatistikler</h3>
            <p>
              URL Shortener, kullanıcılarına kısalttıkları URL'lerin performansı hakkında istatistikler sunar. Bu istatistikler, tıklama sayıları, ziyaretçi konumları, tarayıcı ve işletim sistemi bilgilerini içerir. Bu bilgiler sadece ilgili URL'nin sahibi tarafından görüntülenebilir ve toplu veriler anonim olarak işlenir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Çerezler ve İzleme Teknolojileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Hizmetimiz, daha iyi bir kullanıcı deneyimi sağlamak için çerezler ve benzer izleme teknolojileri kullanır. Kullandığımız çerezler şunlardır:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Zorunlu Çerezler:</strong> Hizmetin temel işlevleri için gereklidir.</li>
              <li><strong>Analitik Çerezler:</strong> Hizmetin nasıl kullanıldığını anlamamıza yardımcı olur.</li>
              <li><strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlamak ve daha kişiselleştirilmiş özellikler sunmak için kullanılır.</li>
            </ul>

            <p className="mt-4">
              Tarayıcı ayarlarınızı değiştirerek çerezleri devre dışı bırakabilirsiniz, ancak bu durumda bazı hizmet özellikleri düzgün çalışmayabilir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Veri Paylaşımı ve İfşası</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Kişisel bilgilerinizi satmıyor veya kiralamıyoruz. Aşağıdaki durumlarda bilgilerinizi paylaşabiliriz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Hizmet Sağlayıcılar:</strong> Hizmetimizi sunmamıza yardımcı olan üçüncü taraf hizmet sağlayıcılarla.</li>
              <li><strong>Yasal Gereklilikler:</strong> Yasal bir yükümlülüğü yerine getirmek, yasal haklarımızı korumak veya yasal bir talebe yanıt vermek için gerekli olduğunda.</li>
              <li><strong>İş Transferleri:</strong> Şirket birleşmesi, satın alınması veya varlıklarımızın satışı durumunda.</li>
              <li><strong>Rızanızla:</strong> Önceden açık rızanızı aldığımız diğer durumlarda.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Veri Güvenliği</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bilgilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri uygulamaktayız. Ancak, internet üzerinden iletilen hiçbir verinin %100 güvenli olmadığını unutmayın.
            </p>
            <p>
              Güvenlik önlemlerimiz şunları içerir:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>SSL/TLS şifreleme</li>
              <li>Düzenli güvenlik değerlendirmeleri</li>
              <li>Verilere erişim kontrolü</li>
              <li>Veri yedekleme prosedürleri</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Yasaklanan İçerikler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener hizmetimiz, aşağıdaki içeriklere yönlendiren URL'leri kısaltmak için kullanılamaz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Yasadışı içerik veya faaliyetler</li>
              <li>Telif hakkı ihlali içeren materyaller</li>
              <li>Kötü amaçlı yazılım veya virüsler</li>
              <li>Sahtecilik veya kimlik avı sayfaları</li>
              <li>Nefret söylemi veya şiddet içeren içerikler</li>
            </ul>
            <p className="mt-4">
              Bu tür içeriklere yönlendiren kısaltılmış URL'ler tespit edildiğinde derhal devre dışı bırakılabilir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bilgileriniz Üzerindeki Haklarınız</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Verilerinize erişim ve bunların bir kopyasını alma hakkı</li>
              <li>Yanlış veya eksik bilgilerin düzeltilmesini isteme hakkı</li>
              <li>Belirli koşullar altında verilerinizin silinmesini isteme hakkı</li>
              <li>Verilerinizin işlenmesine itiraz etme hakkı</li>
              <li>Veri taşınabilirliği hakkı</li>
            </ul>
            <p className="mt-4">
              Bu haklarınızı kullanmak için <a href="/contact" className="text-primary hover:underline">iletişim formu</a> aracılığıyla bize ulaşabilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
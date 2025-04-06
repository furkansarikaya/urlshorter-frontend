import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckSquare, Users, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <FileText className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Kullanım Koşulları</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Son güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Giriş ve Kabul
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener web sitesini veya hizmetlerini kullanarak, bu Kullanım Koşullarını ("Koşullar") kabul etmiş olursunuz. Bu Koşulları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın.
            </p>
            <p>
              Bu Koşullar, URL Shortener ("Şirket", "biz", "bizim") ile siz ("Kullanıcı", "siz", "sizin") arasında yapılan bir anlaşmadır. Bu Koşullar, URL Shortener web sitesinin ve hizmetlerinin kullanımını düzenler.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Hizmetlerimiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener, kullanıcıların uzun URL'leri kısaltmalarına ve bu kısaltılmış URL'lerin performansını takip etmelerine olanak sağlayan bir hizmettir. Hizmetlerimiz şunları içerir:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>URL kısaltma</li>
              <li>Kişiselleştirilmiş kısa URL'ler</li>
              <li>URL tıklama istatistikleri</li>
              <li>Coğrafi konum analizi</li>
              <li>Tarayıcı ve işletim sistemi analizi</li>
            </ul>

            <p className="mt-4">
              Hizmetlerimizi sürekli geliştirmeye çalışıyoruz ve zaman zaman yeni özellikler ekleyebilir, mevcut özellikleri değiştirebilir veya kaldırabiliriz. Bu değişiklikler hakkında sizi bilgilendireceğiz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hesap Oluşturma ve Kullanım
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener'ın bazı özellikleri için bir hesap oluşturmanız gerekmektedir. Hesap oluşturduğunuzda aşağıdaki koşulları kabul etmiş olursunuz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Doğru, güncel ve eksiksiz bilgiler sağlamak</li>
              <li>Hesap bilgilerinizin gizliliğini korumak</li>
              <li>Hesabınız üzerinden gerçekleştirilen tüm etkinliklerden sorumlu olmak</li>
              <li>Hesabınızla ilgili herhangi bir yetkisiz erişimi bize bildirmek</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Hesap Silme</h3>
            <p>
              Hesabınızı dilediğiniz zaman silebilirsiniz. Hesabınızı sildiğinizde, hesabınızla ilişkili tüm veriler kalıcı olarak silinebilir. Ancak, hesabınız silinse bile, daha önce oluşturduğunuz kısaltılmış URL'ler çalışmaya devam edebilir.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Yasaklanan Kullanımlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener hizmetini aşağıdaki amaçlar için kullanamazsınız:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Yasadışı içeriklere yönlendirmek</li>
              <li>Başkalarının fikri mülkiyet haklarını ihlal etmek</li>
              <li>Spam göndermek veya istenmeyen e-posta kampanyaları yürütmek</li>
              <li>Virüs, trojan, solucan veya diğer zararlı yazılımları yaymak</li>
              <li>Kimlik avı veya diğer aldatıcı uygulamalar yapmak</li>
              <li>Nefret söylemi, şiddet veya ayrımcılık içeren içeriklere yönlendirmek</li>
              <li>Sistemlerimize aşırı yük bindirmek veya güvenliğini bozmak</li>
            </ul>

            <p className="mt-4">
              Bu kurallara uymayan URL'leri önceden bildirimde bulunmaksızın devre dışı bırakma hakkımızı saklı tutarız. Ayrıca, tekrarlanan veya ciddi ihlaller durumunda hesabınızı askıya alabilir veya sonlandırabiliriz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Fikri Mülkiyet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener hizmeti ve içeriği, logolar, ticari markalar, tasarımlar, metinler, grafikler ve diğer materyaller dahil olmak üzere, bize aittir ve telif hakkı, ticari marka ve diğer fikri mülkiyet yasaları tarafından korunmaktadır.
            </p>
            
            <Separator className="my-4" />
            
            <h3 className="text-lg font-semibold">Kullanıcı İçeriği</h3>
            <p>
              Sizin tarafınızdan oluşturulan veya sağlanan içerik (kısaltılmış URL'ler, tanımlayıcı adlar, vs.) sizin mülkiyetinizde kalır. Ancak, bize bu içeriği dünya çapında, telifsiz, sürekli, geri alınamaz ve alt lisanslanabilir bir şekilde kullanma, çoğaltma, dağıtma, yürütme ve görüntüleme hakkı verirsiniz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sorumluluk Reddi ve Sınırlamalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              URL Shortener hizmetini "olduğu gibi" ve "mevcut olduğu şekilde" sunuyoruz, herhangi bir garantimiz yoktur. Aşağıdaki konularda açık veya zımni hiçbir garanti vermiyoruz:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Hizmetin kesintisiz veya hatasız olacağı</li>
              <li>Hataların düzeltileceği</li>
              <li>Hizmetin belirli bir amaca uygun olduğu</li>
              <li>Hizmetin güvenli olduğu</li>
            </ul>
            
            <Separator className="my-4" />
            
            <h3 className="text-lg font-semibold">Sorumluluk Sınırı</h3>
            <p>
              Hiçbir durumda, URL Shortener veya yöneticileri, çalışanları veya temsilcileri, hizmetin kullanımından veya kullanılamamasından kaynaklanan doğrudan, dolaylı, arızi, özel, sonuç niteliğinde veya cezai zararlardan sorumlu olmayacaktır.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Tazminat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Bu Koşulları ihlal etmeniz veya hizmetlerimizi yanlış kullanmanız sonucunda ortaya çıkabilecek her türlü talep, dava, yükümlülük, zarar, kayıp veya masraf karşısında URL Shortener'ı, yöneticilerini, çalışanlarını ve temsilcilerini tazmin etmeyi, savunmayı ve zarar görmemelerini sağlamayı kabul edersiniz.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Değişiklikler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bu Koşulları herhangi bir zamanda değiştirme hakkını saklı tutarız. Önemli değişiklikler olması durumunda, değişikliklerin yürürlüğe girmesinden en az 30 gün önce sizi bilgilendireceğiz. Değişikliklerden sonra hizmetlerimizi kullanmaya devam etmeniz, güncellenen Koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bu Koşullarla ilgili sorularınız veya endişeleriniz varsa, lütfen <a href="/contact" className="text-primary hover:underline">iletişim formu</a> aracılığıyla bizimle iletişime geçin.
            </p>
            <p>
              Bu Koşulların tamamını kabul ettiğinizi ve bunlara bağlı kalmayı kabul ettiğinizi onaylarsınız.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
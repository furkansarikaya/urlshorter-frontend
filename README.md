# URL Kısaltma Panel Uygulaması

Bu uygulama, URL kısaltma servisinin yönetim panelidir. Kullanıcılar URL'leri kısaltabilir, yönetebilir ve istatistikleri görüntüleyebilir.

## Çevresel Değişkenler

Uygulama aşağıdaki çevresel değişkenleri kullanır:

- `NEXT_PUBLIC_API_BASE_URL`: API'nin temel URL'si (örn: https://localhost:7093/api/v1)

## Özellikler

- URL oluşturma ve yönetme
- Detaylı tıklanma istatistikleri
- Kullanıcı kimlik doğrulama (giriş, kayıt, oturum yenileme)
- Kısa URL yönlendirmeleri
- Modern arayüz
- Detaylı analitikler ve grafikler

## Yükleme

```bash
git clone [repo-url]
cd urlshorter-panel
npm install
```

## Eksik Bağımlılıklar

Analitik paneli için aşağıdaki bağımlılıkları kurmanız gerekiyor:

```bash
npm install @radix-ui/react-select
```

## Geliştirme

1. Depoyu klonlayın
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. `.env.local` dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://localhost:7093/api/v1
   ```
4. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```

## Derleme ve Dağıtım

Üretim sürümü için:

```
npm run build
npm run start
```

## Yapı

- `/app` - Next.js sayfa bileşenleri
- `/components` - Yeniden kullanılabilir bileşenler
  - `/auth` - Kimlik doğrulama bileşenleri
  - `/layout` - Yerleşim bileşenleri
  - `/ui` - UI komponentleri
  - `/url` - URL ile ilgili bileşenler
- `/contexts` - React Context API ile durum yönetimi
- `/lib` - Yardımcı işlevler ve API istemcisi

## Analitik Özellikleri

- En popüler URL'lerin çubuk grafiği
- URL bazında detaylı tıklanma analizleri
- Zaman serisi tıklanma verileri
- Referans kaynak dağılımı
- Cihaz dağılımı
- Tarih aralığına göre filtreleme
- Toplam tıklanma, tekil ziyaretçi ve günlük ortalama istatistikleri

## Hata Düzeltme

Eğer eksik bağımlılıklar hatası alırsanız aşağıdaki komutları çalıştırın:

```bash
npm install @radix-ui/react-select
npm install
```

Eğer TypeScript hataları görürseniz, aşağıdaki komutu çalıştırabilirsiniz:

```bash
npm run build
```

## Not

`.env.local` dosyası git tarafından yoksayılır ve yerel ortam değişkenlerinizi içerebilir. Bu dosyayı paylaşmamaya dikkat edin.

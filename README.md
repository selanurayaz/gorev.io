# görev.io

### Mikro Hizmet, Makro Kolaylık.

Görev.io, hizmet almak isteyen kullanıcılar ile hizmet sunan bireyleri güvenilir, hızlı ve adil bir şekilde bir araya getiren yapay zekâ destekli mikro hizmet pazaryeri platformudur.

Platform; görev oluşturma, hizmet yayınlama, teklif verme, hizmet talep etme, mesajlaşma ve değerlendirme süreçlerini tek bir sistem içerisinde birleştirerek kullanıcıların ihtiyaç duydukları hizmetlere daha kolay ulaşmalarını sağlar.

---

# Proje Amacı

Günümüzde hizmet sektöründe karşılaşılan en önemli problemlerden biri fiyat belirsizliğidir. Aynı hizmet için farklı kişiler tarafından çok farklı ücretler talep edilebilmekte, bu durum hem hizmet alan kullanıcılar hem de hizmet sağlayıcılar açısından karar verme sürecini zorlaştırmaktadır.

Görev.io, bu probleme çözüm üretmek amacıyla geliştirilmiştir. Platform, kullanıcıların ihtiyaç duydukları hizmetleri kolayca bulabilmelerini sağlarken aynı zamanda yapay zekâ destekli fiyat öneri sistemi sayesinde daha dengeli ve şeffaf bir hizmet ekosistemi oluşturmayı hedeflemektedir.

---

# Yapay Zekâ Destekli Fiyat Öneri Sistemi

Görev.io'nun en önemli özelliklerinden biri Google Gemini API kullanılarak geliştirilen yapay zekâ destekli fiyat öneri sistemidir.

Kullanıcı bir hizmet oluştururken;

* Hizmet başlığı
* Açıklama
* Kategori
* Şehir bilgisi

gibi veriler analiz edilir ve sistem tarafından:

* Önerilen fiyat
* Minimum fiyat
* Maksimum fiyat
* Fiyatlandırma gerekçesi

oluşturulur.

Bu sistem sayesinde:

* Gerçekçi olmayan fiyatlandırmaların azaltılması,
* Yeni hizmet sağlayıcıların piyasa hakkında fikir sahibi olması,
* Hizmet alan kullanıcıların referans fiyat aralığı görebilmesi,
* Daha adil ve şeffaf bir hizmet ortamı oluşturulması

amaçlanmaktadır.

Yapay zekâ, Görev.io içerisinde yalnızca bir teknoloji entegrasyonu olarak değil; kullanıcıların karar verme süreçlerini destekleyen ve fiyat dengesine katkı sağlayan bir araç olarak kullanılmaktadır.

---

# Özellikler

## Kullanıcı Yönetimi

* Kayıt olma
* Giriş yapma
* Oturum yönetimi
* Profil düzenleme

## Görev Sistemi

* Görev oluşturma
* Görev keşfetme
* Görevlere teklif verme
* Teklif kabul ve reddetme

## Hizmet Sistemi

* Hizmet oluşturma
* Hizmet yayınlama
* Hizmet detay sayfası
* Hizmet talep etme

## Mesajlaşma Sistemi

* Kullanıcılar arası mesajlaşma
* Hizmet süreçlerinde iletişim yönetimi
* Bildirim destekli iletişim

## Değerlendirme Sistemi

* 1–5 yıldız puanlama
* Hizmete özel yorum bırakma
* Ortalama puan hesaplama
* Hizmet bazlı değerlendirme görüntüleme

## Bildirim Sistemi

* Yeni teklif bildirimi
* Hizmet talebi bildirimi
* Kabul ve red bildirimleri

---

# Kullanılan Teknolojiler

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Supabase

### Veritabanı

* PostgreSQL

### Yapay Zekâ

* Google Gemini API

---

# Veritabanı Yapısı

Platformun temel veri yapısı aşağıdaki tablolardan oluşmaktadır:

* profiles
* tasks
* services
* offers
* reviews
* messages
* notifications
* categories

---

# Kullanım Akışı

1. Kullanıcı sisteme kayıt olur.
2. Hizmet oluşturur veya görev yayınlar.
3. Diğer kullanıcılar hizmet talebinde bulunur veya teklif verir.
4. Hizmet sağlayıcı talebi kabul eder.
5. Taraflar mesajlaşma sürecine geçer.
6. İş tamamlanır.
7. Kullanıcı değerlendirme bırakır.
8. Değerlendirme ilgili hizmet kartına yansıtılır.

---

# Geliştirici

**Selanur Ayaz**
Yazılım Mühendisliği Öğrencisi
Fırat Üniversitesi

Görev.io, yazılım geliştirme, veritabanı yönetimi, kullanıcı deneyimi tasarımı ve yapay zekâ entegrasyonu alanlarında edinilen bilgilerin bir araya getirilmesiyle geliştirilmiştir.

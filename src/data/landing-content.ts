/** Landing page copy & structured content — Turkish micro-service examples. */

export const popularCategories = [
  {
    id: 'temizlik',
    title: 'Temizlik & düzen',
    description: 'Ev, ofis ve taşınma sonrası detaylı temizlik.',
    icon: 'sparkles',
  },
  {
    id: 'tasima',
    title: 'Taşıma & nakliyat',
    description: 'Tek parça mobilyadan küçük ölçekli nakliyeye.',
    icon: 'truck',
  },
  {
    id: 'teknik',
    title: 'Teknik destek',
    description: 'Bilgisayar, ağ kurulumu ve akıllı ev kurulumu.',
    icon: 'wrench',
  },
  {
    id: 'tasarim',
    title: 'Tasarım & içerik',
    description: 'Logo, sosyal medya görseli ve basit video kesiti.',
    icon: 'palette',
  },
  {
    id: 'ders',
    title: 'Özel ders & koçluk',
    description: 'Matematik, dil ve mülakat hazırlığı — yüz yüze veya uzaktan.',
    icon: 'book',
  },
  {
    id: 'bahce',
    title: 'Bahçe & bakım',
    description: 'Çim biçme, saksı düzeni ve haftalık bitki bakımı.',
    icon: 'leaf',
  },
] as const

export type CategoryIconName = (typeof popularCategories)[number]['icon']

export const howItWorksSteps = [
  {
    step: '01',
    title: 'Görevini net tanımla',
    description:
      'Süre, yer ve bütçe aralığını gir; doğru uzmanlar öne çıkar.',
  },
  {
    step: '02',
    title: 'Teklifleri karşılaştır',
    description:
      'Profilleri, yorumları ve başarı oranlarını yan yana gör.',
  },
  {
    step: '03',
    title: 'Güvenle tamamla',
    description:
      'Mesajlaş, randevu al ve iş bitince onayla — ödeme güvence altında.',
  },
] as const

export const featuredServices = [
  {
    id: '1',
    title: 'Derinlemesine ev temizliği (3+1)',
    provider: 'Ayşe K.',
    location: 'Çankaya · Yerinde',
    priceLabel: "₺1.200'den başlayan",
    category: 'Temizlik',
    rating: 4.9,
    reviews: 128,
    badge: 'Çok talep görüyor',
  },
  {
    id: '2',
    title: 'IKEA dolap montajı + duvara sabitleme',
    provider: 'Murat T.',
    location: 'Ümraniye · Yerinde',
    priceLabel: 'Sabit ₺950',
    category: 'Montaj',
    rating: 5.0,
    reviews: 84,
    badge: 'Aynı gün uygun',
  },
  {
    id: '3',
    title: 'WordPress site hız optimizasyonu',
    provider: 'Deniz Yazılım',
    location: 'Uzaktan · Türkiye',
    priceLabel: "₺2.500'ye kadar",
    category: 'Yazılım',
    rating: 4.8,
    reviews: 56,
    badge: 'Uzman',
  },
  {
    id: '4',
    title: 'Haftalık köpek gezdirme (45 dk)',
    provider: 'PetCare İstanbul',
    location: 'Beşiktaş · Sürekli',
    priceLabel: 'Haftalık paket ₺1.100',
    category: 'Evcil hayvan',
    rating: 4.95,
    reviews: 203,
    badge: 'Abonelik',
  },
] as const

export const stats = [
  { label: 'Tamamlanan görev', value: '38K+' },
  { label: 'Aktif hizmet veren', value: '12K+' },
  { label: 'Ortalama puan', value: '4,9' },
  { label: 'Şehir', value: '42' },
] as const

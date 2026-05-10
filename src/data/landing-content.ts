/** Landing page copy & structured content — Turkish micro-service examples. */

export const popularServices = [
  {
    id: 'ozel-ders',
    title: 'Özel Ders',
    description:
      'Matematik, dil sınavı ve kodlama giriş — yüz yüze veya uzaktan, net hedeflerle.',
    icon: 'book',
  },
  {
    id: 'temizlik',
    title: 'Temizlik',
    description:
      'Ev ve ofis genel temizliği, taşınma sonrası detay ve düzenli paketler.',
    icon: 'sparkles',
  },
  {
    id: 'grafik-tasarim',
    title: 'Grafik Tasarım',
    description:
      'Logo, menü kartı, sosyal medya şablonları ve sunum görselleri.',
    icon: 'palette',
  },
  {
    id: 'yazilim',
    title: 'Yazılım',
    description:
      'Küçük web düzeltmeleri, otomasyon, WordPress ve hız optimizasyonu.',
    icon: 'code',
  },
  {
    id: 'evcil-hayvan',
    title: 'Evcil Hayvan Bakımı',
    description:
      'Gezdirme, kısa süreli oturma ve temel bakım — günlük veya haftalık.',
    icon: 'heart',
  },
  {
    id: 'tasima-yardimi',
    title: 'Taşıma Yardımı',
    description:
      'Tek parça mobilya, merdiven taşıma ve küçük ölçekli nakliye desteği.',
    icon: 'truck',
  },
] as const

export type ServiceIconName = (typeof popularServices)[number]['icon']

export const howItWorksSteps = [
  {
    step: '01',
    title: 'Görev oluştur',
    description:
      'İhtiyacını, süreyi ve konumu net yaz; ilanın dakikalar içinde yayında olsun.',
  },
  {
    step: '02',
    title: 'Teklif al',
    description:
      'Uygun uzmanlardan teklifleri topla; profilleri ve yorumları karşılaştır.',
  },
  {
    step: '03',
    title: 'Hizmeti tamamla',
    description:
      'Randevuyu onayla, işi bitir ve güvenli ödeme ile süreci sorunsuz kapat.',
  },
] as const

export const featuredServices = [
  {
    id: '1',
    title: 'Hafta içi akşam özel ders (TYT matematik)',
    provider: 'Öğr. Selin A.',
    location: 'Eskişehir · Yerinde',
    priceLabel: "₺900 / seans",
    category: 'Özel Ders',
    rating: 4.9,
    reviews: 214,
    badge: 'Yüksek eşleşme',
  },
  {
    id: '2',
    title: 'Ofis genel temizliği (120 m², 3 saat)',
    provider: 'CleanPro Ankara',
    location: 'Çankaya · Yerinde',
    priceLabel: "₺2.100'den başlayan",
    category: 'Temizlik',
    rating: 4.85,
    reviews: 96,
    badge: 'Aynı hafta',
  },
  {
    id: '3',
    title: 'Sosyal medya görsel paketi (12 paylaşım)',
    provider: 'Studio 17',
    location: 'Uzaktan · Türkiye',
    priceLabel: 'Sabit ₺3.200',
    category: 'Grafik Tasarım',
    rating: 5.0,
    reviews: 44,
    badge: 'Portföy öne çıkan',
  },
  {
    id: '4',
    title: 'React bileşen düzeltmesi + TypeScript inceleme',
    provider: 'DevRoom',
    location: 'Uzaktan · Avrupa saati uyumlu',
    priceLabel: "₺4.500'ye kadar",
    category: 'Yazılım',
    rating: 4.95,
    reviews: 67,
    badge: 'Kısa sürede',
  },
] as const

export const stats = [
  { label: 'Tamamlanan görev', value: '38K+' },
  { label: 'Aktif hizmet veren', value: '12K+' },
  { label: 'Ortalama puan', value: '4,9' },
  { label: 'Şehir', value: '42' },
] as const

/** Dashboard placeholder data — Turkish examples. */

export const dashboardStats = [
  {
    id: 'active',
    label: 'Aktif görevler',
    value: '3',
    change: '+1 bu hafta',
    trend: 'up' as const,
  },
  {
    id: 'completed',
    label: 'Tamamlanan',
    value: '24',
    change: 'Son 30 gün',
    trend: 'neutral' as const,
  },
  {
    id: 'messages',
    label: 'Okunmamış mesaj',
    value: '5',
    change: '2 yeni teklif',
    trend: 'up' as const,
  },
  {
    id: 'rating',
    label: 'Ortalama puan',
    value: '4,9',
    change: '12 değerlendirme',
    trend: 'neutral' as const,
  },
] as const

export const recentTasks = [
  {
    id: 't1',
    title: 'Haftalık ofis temizliği (90 m²)',
    status: 'Teklif bekleniyor',
    statusTone: 'yellow' as const,
    location: 'Levent · Yerinde',
    budget: '₺1.800 – ₺2.400',
    updatedAt: '2 saat önce',
  },
  {
    id: 't2',
    title: 'IKEA çalışma masası montajı',
    status: 'Devam ediyor',
    statusTone: 'green' as const,
    location: 'Kadıköy · Yarın 14:00',
    budget: '₺950',
    updatedAt: 'Dün',
  },
  {
    id: 't3',
    title: 'Logo revizyonu (3 varyant)',
    status: 'Taslak',
    statusTone: 'muted' as const,
    location: 'Uzaktan',
    budget: '₺2.500’ye kadar',
    updatedAt: '3 gün önce',
  },
] as const

export const suggestedServices = [
  {
    id: 's1',
    title: 'Derinlemesine ev temizliği (3+1)',
    provider: 'Ayşe K.',
    category: 'Temizlik',
    priceLabel: "₺1.200'den",
    rating: 4.9,
  },
  {
    id: 's2',
    title: 'TYT matematik özel ders (90 dk)',
    provider: 'Öğr. Selin A.',
    category: 'Özel Ders',
    priceLabel: '₺900 / seans',
    rating: 4.95,
  },
  {
    id: 's3',
    title: 'Haftalık köpek gezdirme paketi',
    provider: 'PetCare İstanbul',
    category: 'Evcil Hayvan',
    priceLabel: '₺1.100 / hafta',
    rating: 4.9,
  },
] as const

export const activityFeed = [
  {
    id: 'a1',
    text: 'Murat T. görevinize teklif gönderdi.',
    time: '14:32',
    type: 'offer' as const,
  },
  {
    id: 'a2',
    text: '“Ofis temizliği” ilanınız yayına alındı.',
    time: '11:05',
    type: 'publish' as const,
  },
  {
    id: 'a3',
    text: 'Deniz Yazılım mesajınızı yanıtladı.',
    time: 'Dün',
    type: 'message' as const,
  },
  {
    id: 'a4',
    text: 'Montaj görevi tamamlandı — değerlendirme bekleniyor.',
    time: 'Dün',
    type: 'complete' as const,
  },
] as const

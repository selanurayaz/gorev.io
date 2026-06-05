import type { DashboardStatDisplay, DashboardStats } from '@/types/dashboard'

function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

export function buildDashboardStatDisplays(
  stats: DashboardStats,
): DashboardStatDisplay[] {
  return [
    {
      id: 'active',
      label: 'Aktif görevler',
      value: String(stats.activeTasks),
      hint:
        stats.activeTasks > 0
          ? 'Açık veya devam eden görevler'
          : 'Aktif görev yok',
    },
    {
      id: 'completed',
      label: 'Tamamlanan',
      value: String(stats.completedTasks),
      hint:
        stats.completedTasks > 0
          ? 'Tamamlanan görev sayısı'
          : 'Henüz tamamlanan görev yok',
    },
    {
      id: 'messages',
      label: 'Okunmamış mesaj',
      value: String(stats.unreadMessages),
      hint:
        stats.unreadMessages > 0
          ? 'Yanıt bekleyen mesajlar'
          : 'Okunmamış mesaj yok',
    },
    {
      id: 'rating',
      label: 'Ortalama puan',
      value:
        stats.averageRating != null
          ? formatRating(stats.averageRating)
          : '—',
      hint:
        stats.reviewCount > 0
          ? `${stats.reviewCount} değerlendirme`
          : 'Henüz değerlendirme yok',
    },
  ]
}

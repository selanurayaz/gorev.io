import { useEffect } from 'react'

const DEFAULT_INTERVAL_MS = 5_000

/** Aktif sohbet / liste için arka planda yenileme. */
export function useMessagePolling(
  enabled: boolean,
  onPoll: () => void | Promise<void>,
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      void onPoll()
    }

    const intervalId = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(intervalId)
  }, [enabled, intervalMs, onPoll])
}

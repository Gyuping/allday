import { useCallback } from 'react'

export function useNotificationPermission() {
  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const isGranted = typeof window !== 'undefined'
    && 'Notification' in window
    && Notification.permission === 'granted'

  return { request, isGranted }
}

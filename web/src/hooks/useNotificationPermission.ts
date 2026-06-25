// 브라우저 알림 권한 요청을 처리하는 커스텀 훅
// 여러 모달에서 동일한 권한 요청 로직이 필요해서 분리했다.
import { useCallback } from 'react'

export function useNotificationPermission() {
  // 알림 권한을 요청하고 허용 여부를 반환하는 비동기 함수
  // 이미 허용됐으면 바로 true, 거부됐으면 바로 false, 미결정이면 팝업을 띄운다.
  const request = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  // 현재 권한이 허용 상태인지 (렌더링 중 동기적으로 확인할 때 사용)
  const isGranted = typeof window !== 'undefined'
    && 'Notification' in window
    && Notification.permission === 'granted'

  return { request, isGranted }
}

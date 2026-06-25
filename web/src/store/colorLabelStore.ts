// 색상별 사용자 정의 라벨을 저장하는 Zustand 스토어
// 예: '#ef4444' → '병원', '#3b82f6' → '회사'
// ColorPicker에서 색상을 더블클릭해 이름을 붙일 수 있다.
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ColorLabelStore = {
  labels: Record<string, string>  // { 색상코드: 라벨이름 }
  setLabel: (color: string, label: string) => void
}

// localStorage 접근 실패(private 브라우징, 용량 초과 등)에 안전하게 대응하는 래퍼
const safeStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key) } catch { return null }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value) } catch { /* quota 초과 시 조용히 무시 */ }
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key) } catch { /* 무시 */ }
  },
}

export const useColorLabelStore = create<ColorLabelStore>()(
  persist(
    (set) => ({
      labels: {},
      setLabel: (color, label) =>
        set((s) => ({ labels: { ...s.labels, [color]: label } })),
    }),
    { name: 'allday-color-labels', storage: createJSONStorage(() => safeStorage) }
  )
)

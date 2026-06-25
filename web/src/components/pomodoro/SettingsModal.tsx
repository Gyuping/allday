'use client'

// 포모도로 타이머 설정 모달
// 집중/휴식 시간과 긴 휴식 주기를 변경할 수 있다.
// 저장 버튼을 눌러야 적용되며, 취소하면 변경사항이 반영되지 않는다.
import { useState } from 'react'
import { Check } from 'lucide-react'
import type { PomodoroSettings } from '@/types'
import SettingRow from './SettingRow'
import Modal from '@/components/ui/Modal'

export default function SettingsModal({ settings, onSave, onClose }: {
  settings: PomodoroSettings; onSave: (s: PomodoroSettings) => void; onClose: () => void
}) {
  // 현재 설정값을 복사해 임시 상태로 관리 — 저장 전엔 원본에 영향 없음
  const [form, setForm] = useState({ ...settings })

  return (
    <Modal title="타이머 설정" onClose={onClose}>
      <div className="p-5 flex flex-col gap-5">
        <SettingRow label="집중 시간" unit="분" value={form.workMinutes} min={1} max={1440} onChange={v => setForm(f => ({ ...f, workMinutes: v }))} />
        <SettingRow label="짧은 휴식" unit="분" value={form.shortBreakMinutes} min={1} max={30} onChange={v => setForm(f => ({ ...f, shortBreakMinutes: v }))} />
        <SettingRow label="긴 휴식" unit="분" value={form.longBreakMinutes} min={1} max={60} onChange={v => setForm(f => ({ ...f, longBreakMinutes: v }))} />
        <div className="h-px bg-neutral-800" />
        <SettingRow label="긴 휴식까지 세션" unit="회" value={form.sessionsBeforeLongBreak} min={1} max={10} onChange={v => setForm(f => ({ ...f, sessionsBeforeLongBreak: v }))} />
      </div>
      <div className="flex gap-3 px-5 pb-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 transition-colors">취소</button>
        <button onClick={() => onSave(form)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors">
          <Check size={14} /> 저장
        </button>
      </div>
    </Modal>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Settings, X, Check } from 'lucide-react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { playWorkComplete, playBreakComplete } from '@/lib/sounds'
import type { PomodoroPhase, PomodoroSettings } from '@/types'

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  work: '집중', shortBreak: '짧은 휴식', longBreak: '긴 휴식',
}

const PHASE_COLOR = {
  work:       { stroke: '#6366f1', bg: 'bg-indigo-500',  text: 'text-indigo-400'  },
  shortBreak: { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-400' },
  longBreak:  { stroke: '#0ea5e9', bg: 'bg-sky-500',     text: 'text-sky-400'     },
} satisfies Record<PomodoroPhase, { stroke: string; bg: string; text: string }>

const RADIUS = 90
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// ── 설정 행 ──────────────────────────────────────────────────────────
function SettingRow({ label, unit, value, min, max, onChange }: {
  label: string; unit: string; value: number
  min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-neutral-300">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors flex items-center justify-center text-lg leading-none">−</button>
        <span className="w-16 text-center text-sm font-semibold tabular-nums">{value} {unit}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors flex items-center justify-center text-lg leading-none">+</button>
      </div>
    </div>
  )
}

// ── 설정 모달 ─────────────────────────────────────────────────────────
function SettingsModal({ settings, onSave, onClose }: {
  settings: PomodoroSettings; onSave: (s: PomodoroSettings) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ ...settings })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-base font-semibold">타이머 설정</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5 flex flex-col gap-5">
          <SettingRow label="집중 시간" unit="분" value={form.workMinutes} min={1} max={90} onChange={v => setForm(f => ({ ...f, workMinutes: v }))} />
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
      </div>
    </div>
  )
}

// ── 메인 페이지 ───────────────────────────────────────────────────────
export default function PomodoroPage() {
  const {
    settings, phase, sessionCount, isRunning, secondsLeft,
    setPhase, setRunning, setSecondsLeft, incrementSession, reset, updateSettings,
  } = usePomodoroStore()

  const [showSettings, setShowSettings] = useState(false)
  const colors = PHASE_COLOR[phase]

  const totalSeconds =
    phase === 'work' ? settings.workMinutes * 60
    : phase === 'shortBreak' ? settings.shortBreakMinutes * 60
    : settings.longBreakMinutes * 60

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')

  const sessionsInCycle = sessionCount % settings.sessionsBeforeLongBreak

  // 타이머 완료 처리
  const completePhase = (skipCount = false) => {
    const st = usePomodoroStore.getState()
    const p = st.phase
    const sc = st.sessionCount
    setRunning(false)
    if (p === 'work') {
      const newCount = skipCount ? sc : sc + 1
      if (!skipCount) incrementSession()
      const nextPhase: PomodoroPhase =
        newCount % st.settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      setPhase(nextPhase)
      if (!skipCount) {
        playWorkComplete()
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted')
          new Notification('집중 완료! 🎉 휴식을 취하세요', { icon: '/favicon.ico' })
      }
    } else {
      setPhase('work')
      if (!skipCount) {
        playBreakComplete()
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted')
          new Notification('휴식 종료! 다시 집중해볼까요?', { icon: '/favicon.ico' })
      }
    }
  }

  const completeRef = useRef(completePhase)
  completeRef.current = completePhase

  useEffect(() => {
    if (!isRunning) return
    const tick = setInterval(() => {
      const { secondsLeft: cur } = usePomodoroStore.getState()
      if (cur <= 1) { clearInterval(tick); setSecondsLeft(0); completeRef.current() }
      else setSecondsLeft(cur - 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [isRunning, setSecondsLeft])

  // 탭 타이틀
  useEffect(() => {
    document.title = isRunning ? `${mins}:${secs} — AllDay` : 'AllDay'
    return () => { document.title = 'AllDay' }
  }, [isRunning, mins, secs])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-8 select-none">

      {/* 페이즈 탭 */}
      <div className="flex gap-1 p-1 bg-neutral-800/60 rounded-xl">
        {(['work', 'shortBreak', 'longBreak'] as PomodoroPhase[]).map(p => (
          <button key={p} onClick={() => { setRunning(false); setPhase(p) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              phase === p ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'
            }`}>
            {PHASE_LABEL[p]}
          </button>
        ))}
      </div>

      {/* 원형 타이머 */}
      <div className="relative flex items-center justify-center">
        <svg width="260" height="260" viewBox="0 0 220 220" className="-rotate-90">
          <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="rgb(38 38 38)" strokeWidth="10" />
          <circle
            cx="110" cy="110" r={RADIUS} fill="none"
            stroke={colors.stroke} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1.5">
          <span className="text-6xl font-bold tabular-nums tracking-tight">
            {mins}:{secs}
          </span>
          <span className={`text-sm font-medium ${colors.text}`}>
            {PHASE_LABEL[phase]}
          </span>
        </div>
      </div>

      {/* 세션 도트 */}
      <div className="flex items-center gap-2.5">
        {Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${
            i < sessionsInCycle ? `w-3 h-3 ${colors.bg}` : 'w-2 h-2 bg-neutral-700'
          }`} />
        ))}
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-6">
        <button onClick={() => { setRunning(false); setSecondsLeft(totalSeconds) }}
          className="p-3 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
          <RotateCcw size={20} />
        </button>
        <button onClick={() => setRunning(!isRunning)}
          className={`flex items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${colors.bg} text-white`}
          style={{ width: 72, height: 72 }}>
          {isRunning ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
        </button>
        <button onClick={() => completePhase(true)}
          className="p-3 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
          <SkipForward size={20} />
        </button>
      </div>

      {/* 세션 정보 + 설정 */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <span>오늘 {sessionCount}회 완료</span>
        {sessionsInCycle > 0 && <><span>·</span><span>{settings.sessionsBeforeLongBreak - sessionsInCycle}회 후 긴 휴식</span></>}
        <button onClick={() => setShowSettings(true)}
          className="ml-2 p-1.5 rounded-lg hover:text-white hover:bg-neutral-800 transition-colors">
          <Settings size={15} />
        </button>
      </div>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={s => { updateSettings(s); reset(); setShowSettings(false) }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

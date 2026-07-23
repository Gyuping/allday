'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { unlockAudio } from '@/lib/sounds'
import type { PomodoroPhase } from '@/types'
import SettingsModal from '@/components/pomodoro/SettingsModal'

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  work: '집중', shortBreak: '짧은 휴식', longBreak: '긴 휴식',
}

const PHASE_CONFIG = {
  work: {
    stroke: '#818cf8',
    glowColor: '#6366f1',
    gradFrom: '#6366f1',
    gradTo: '#8b5cf6',
    text: 'text-indigo-300',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    dot: 'bg-indigo-500',
  },
  shortBreak: {
    stroke: '#34d399',
    glowColor: '#10b981',
    gradFrom: '#10b981',
    gradTo: '#0d9488',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  longBreak: {
    stroke: '#38bdf8',
    glowColor: '#0ea5e9',
    gradFrom: '#0ea5e9',
    gradTo: '#6366f1',
    text: 'text-sky-300',
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
    dot: 'bg-sky-500',
  },
} satisfies Record<PomodoroPhase, object>

const R = 140
const SW = 5
const CIRC = 2 * Math.PI * R
const SIZE = 340

export default function PomodoroPage() {
  const {
    settings, phase, sessionCount, totalFocusMinutes, isRunning, secondsLeft,
    setPhase, setRunning, setSecondsLeft, reset, updateSettings,
  } = usePomodoroStore()

  const [showSettings, setShowSettings] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const [timeDraft, setTimeDraft] = useState('')
  const timeInputRef = useRef<HTMLInputElement>(null)
  const cfg = PHASE_CONFIG[phase]

  const totalSeconds =
    phase === 'work' ? settings.workMinutes * 60
    : phase === 'shortBreak' ? settings.shortBreakMinutes * 60
    : settings.longBreakMinutes * 60

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1
  const dashOffset = CIRC * (1 - progress)
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const sessionsInCycle = sessionCount % settings.sessionsBeforeLongBreak
  const pct = Math.round(progress * 100)

  // 스킵 버튼 전용 — 카운트/사운드 없이 다음 페이즈로 이동
  const skipPhase = () => {
    const { phase, sessionCount, settings } = usePomodoroStore.getState()
    if (phase === 'work') {
      // completeRef와 동일하게 +1 기준으로 판단 (incrementSession은 호출하지 않음)
      const next: PomodoroPhase =
        (sessionCount + 1) % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      setPhase(next)
    } else {
      setPhase('work')
    }
  }

  function startEditTime() {
    if (isRunning) return
    setTimeDraft(`${mins}:${secs}`)
    setEditingTime(true)
    // 다음 렌더링 후 포커스 — ref로 클린업
    const tid = setTimeout(() => { timeInputRef.current?.select() }, 0)
    return () => clearTimeout(tid)
  }

  function commitTime() {
    const raw = timeDraft.trim()
    let totalSecs = 0

    if (/^\d+$/.test(raw)) {
      const mins = parseInt(raw, 10)
      totalSecs = Math.max(0, Math.min(mins, 99)) * 60  // 음수·초과 방지
    } else if (/^\d{1,2}:\d{2}$/.test(raw)) {
      const [m, s] = raw.split(':').map(Number)
      totalSecs = Math.max(0, Math.min(m, 99)) * 60 + Math.max(0, Math.min(s, 59))
    } else {
      setEditingTime(false)
      return
    }

    if (totalSecs > 0) setSecondsLeft(totalSecs)
    setEditingTime(false)
  }

  useEffect(() => {
    document.title = isRunning ? `${mins}:${secs} — AllDay` : 'AllDay'
    return () => { document.title = 'AllDay' }
  }, [isRunning, mins, secs])

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden select-none">

      <div className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse 900px 600px at 50% 40%, ${cfg.glowColor}12 0%, transparent 70%)` }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 400px 400px at 15% 80%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 300px 300px at 85% 20%, rgba(14,165,233,0.05) 0%, transparent 60%)' }} />

      <div className="absolute pointer-events-none transition-all duration-1000"
        style={{ width: 700, height: 700, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -52%)',
          border: `1px solid ${cfg.glowColor}0f` }} />
      <div className="absolute pointer-events-none transition-all duration-1000"
        style={{ width: 550, height: 550, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -52%)',
          border: `1px solid ${cfg.glowColor}0c` }} />
      <div className="absolute pointer-events-none transition-all duration-1000"
        style={{ width: 420, height: 420, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -52%)',
          border: `1px solid ${cfg.glowColor}09` }} />

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row items-center justify-center gap-8 lg:gap-24 px-4 lg:px-16 py-6 lg:py-10 overflow-y-auto">

        <div className="hidden lg:flex flex-col gap-8 w-52 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 font-medium">모드</p>
            <div className="flex flex-col gap-1.5">
              {(['work', 'shortBreak', 'longBreak'] as PomodoroPhase[]).map((p) => (
                <button key={p} onClick={() => { setRunning(false); setPhase(p) }}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    phase === p
                      ? `text-white bg-white/10 border border-white/10`
                      : 'text-neutral-600 hover:text-neutral-400 hover:bg-white/5'
                  }`}>
                  {PHASE_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 font-medium">시간 설정</p>
            <div className="flex flex-col gap-2 text-sm text-neutral-500">
              <div className="flex justify-between">
                <span>집중</span>
                <span className="text-neutral-400 font-medium tabular-nums">{settings.workMinutes}분</span>
              </div>
              <div className="flex justify-between">
                <span>짧은 휴식</span>
                <span className="text-neutral-400 font-medium tabular-nums">{settings.shortBreakMinutes}분</span>
              </div>
              <div className="flex justify-between">
                <span>긴 휴식</span>
                <span className="text-neutral-400 font-medium tabular-nums">{settings.longBreakMinutes}분</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 lg:gap-10 shrink-0 w-full lg:w-auto">

          <div className="flex lg:hidden gap-1 p-0.5 bg-white/5 border border-white/10 rounded-xl">
            {(['work', 'shortBreak', 'longBreak'] as PomodoroPhase[]).map((p) => (
              <button key={p} onClick={() => { setRunning(false); setPhase(p) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  phase === p ? 'bg-white/10 text-white border border-white/10' : 'text-neutral-500 hover:text-neutral-300'
                }`}>
                {PHASE_LABEL[p]}
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center" style={{ width: `min(${SIZE}px, 80vw)`, height: `min(${SIZE}px, 80vw)` }}>
            <div className="absolute inset-0 rounded-full transition-all duration-1000 pointer-events-none"
              style={{ boxShadow: isRunning ? `0 0 80px ${cfg.glowColor}22, 0 0 160px ${cfg.glowColor}11` : 'none' }} />

            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 absolute inset-0">
              <defs>
                <filter id="blur-glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={cfg.gradFrom} />
                  <stop offset="100%" stopColor={cfg.gradTo} />
                </linearGradient>
              </defs>

              <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={SW} />

              <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
                stroke="url(#ring-grad)" strokeWidth={SW} strokeLinecap="round"
                strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                filter="url(#blur-glow)"
                style={{ transition: 'stroke-dashoffset 0.8s linear' }} />
            </svg>

            <div className="relative flex flex-col items-center gap-3">
              {editingTime ? (
                <input
                  ref={timeInputRef}
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value)}
                  onBlur={commitTime}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTime()
                    if (e.key === 'Escape') setEditingTime(false)
                  }}
                  className="bg-transparent text-white text-center font-bold tabular-nums focus:outline-none border-b-2 border-white/30 focus:border-white/70 transition-colors"
                  style={{ fontSize: 'clamp(48px, 10vw, 86px)', lineHeight: 1, letterSpacing: '-0.05em', width: 'min(260px, 90vw)' }}
                  placeholder="MM:SS"
                  maxLength={5}
                />
              ) : (
                <div
                  onClick={startEditTime}
                  title={isRunning ? '' : '클릭해서 시간 변경'}
                  className={`font-bold tabular-nums text-white transition-opacity ${
                    !isRunning ? 'cursor-text hover:opacity-70' : 'cursor-default'
                  }`}
                  style={{ fontSize: 'clamp(48px, 10vw, 86px)', lineHeight: 1, letterSpacing: '-0.05em' }}
                >
                  {mins}:{secs}
                </div>
              )}
              <span className={`text-xs font-semibold uppercase tracking-widest border px-4 py-1.5 rounded-full ${cfg.badge}`}>
                {PHASE_LABEL[phase]}
              </span>
              <span className="text-sm text-neutral-700 font-medium tabular-nums">{pct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => { setRunning(false); setSecondsLeft(totalSeconds) }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-neutral-600 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all">
              <RotateCcw size={20} />
            </button>

            <button onClick={() => { unlockAudio(); setRunning(!isRunning) }}
              className="relative flex items-center justify-center rounded-2xl text-white transition-all duration-200 active:scale-95"
              style={{
                width: 88, height: 88,
                background: `linear-gradient(135deg, ${cfg.gradFrom}, ${cfg.gradTo})`,
                boxShadow: `0 0 32px ${cfg.glowColor}55, 0 8px 32px rgba(0,0,0,0.5)`,
              }}>
              {isRunning ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" className="ml-1" />}
            </button>

            <button onClick={skipPhase}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-neutral-600 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => (
              <div key={i} className="rounded-full transition-all duration-500"
                style={{
                  width: i < sessionsInCycle ? 32 : 8, height: 8,
                  backgroundColor: i < sessionsInCycle ? cfg.glowColor : 'rgba(255,255,255,0.08)',
                  boxShadow: i < sessionsInCycle ? `0 0 10px ${cfg.glowColor}88` : 'none',
                }} />
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-8 w-52 shrink-0">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 font-medium">오늘의 기록</p>
            <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-3xl font-bold text-white tabular-nums">{sessionCount}</p>
                <p className="text-xs text-neutral-600 mt-1">완료한 세션</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-3xl font-bold text-white tabular-nums">
                  {Math.floor(totalFocusMinutes / 60) > 0
                    ? `${Math.floor(totalFocusMinutes / 60)}시간 ${totalFocusMinutes % 60}분`
                    : `${totalFocusMinutes}분`}
                </p>
                <p className="text-xs text-neutral-600 mt-1">총 집중 시간</p>
              </div>
            </div>
          </div>

          {sessionsInCycle > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-600 mb-3 font-medium">다음 긴 휴식까지</p>
              <div className="flex gap-1.5">
                {Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{ backgroundColor: i < sessionsInCycle ? cfg.glowColor : 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                {settings.sessionsBeforeLongBreak - sessionsInCycle}회 남음
              </p>
            </div>
          )}

          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all w-full">
            <Settings size={15} />
            타이머 설정
          </button>
        </div>
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

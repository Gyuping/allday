import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Modal, TextInput, ScrollView,
} from 'react-native'
import { THEME } from '@/lib/colors'
import type { PomodoroPhase, PomodoroSettings } from '@/types'

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: '집중',
  shortBreak: '짧은 휴식',
  longBreak: '긴 휴식',
}

export default function TimerScreen() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS)
  const [phase, setPhase]       = useState<PomodoroPhase>('work')
  const [session, setSession]   = useState(0)
  const [running, setRunning]   = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const phaseMinutes: Record<PomodoroPhase, number> = {
    work:        settings.workMinutes,
    shortBreak:  settings.shortBreakMinutes,
    longBreak:   settings.longBreakMinutes,
  }

  const [secondsLeft, setSecondsLeft] = useState(phaseMinutes[phase] * 60)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSecondsLeft(phaseMinutes[phase] * 60)
    setRunning(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, settings])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            handlePhaseEnd()
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const handlePhaseEnd = () => {
    if (phase === 'work') {
      const next = session + 1
      setSession(next)
      if (next % settings.sessionsBeforeLongBreak === 0) setPhase('longBreak')
      else setPhase('shortBreak')
    } else {
      setPhase('work')
    }
  }

  const reset = () => {
    setRunning(false)
    setSecondsLeft(phaseMinutes[phase] * 60)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  const progress = 1 - secondsLeft / (phaseMinutes[phase] * 60)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>타이머</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>설정</Text>
        </TouchableOpacity>
      </View>

      {/* 페이즈 탭 */}
      <View style={styles.phaseRow}>
        {(['work', 'shortBreak', 'longBreak'] as PomodoroPhase[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => { setPhase(p); setRunning(false) }}
            style={[styles.phaseBtn, phase === p && styles.phaseBtnActive]}
          >
            <Text style={[styles.phaseText, phase === p && styles.phaseTextActive]}>
              {PHASE_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 타이머 디스플레이 */}
      <View style={styles.timerWrap}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{mm}:{ss}</Text>
          <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
        </View>
      </View>

      {/* 세션 카운터 */}
      <Text style={styles.sessionText}>
        세션 {session} · {session % settings.sessionsBeforeLongBreak}/{settings.sessionsBeforeLongBreak}
      </Text>

      {/* 컨트롤 버튼 */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={reset} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>초기화</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setRunning((v) => !v)}
          style={[styles.primaryBtn, running && styles.primaryBtnPause]}
        >
          <Text style={styles.primaryBtnText}>{running ? '일시정지' : '시작'}</Text>
        </TouchableOpacity>
      </View>

      {/* 설정 모달 */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        onSave={(s) => { setSettings(s); setShowSettings(false) }}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  )
}

function SettingsModal({
  visible, settings, onSave, onClose,
}: {
  visible: boolean
  settings: PomodoroSettings
  onSave: (s: PomodoroSettings) => void
  onClose: () => void
}) {
  const [work,   setWork]   = useState(String(settings.workMinutes))
  const [short_,  setShort]  = useState(String(settings.shortBreakMinutes))
  const [long_,   setLong]   = useState(String(settings.longBreakMinutes))
  const [before, setBefore] = useState(String(settings.sessionsBeforeLongBreak))

  const save = () => {
    onSave({
      workMinutes:              Math.max(1, parseInt(work, 10) || 25),
      shortBreakMinutes:        Math.max(1, parseInt(short_, 10) || 5),
      longBreakMinutes:         Math.max(1, parseInt(long_, 10) || 15),
      sessionsBeforeLongBreak:  Math.max(1, parseInt(before, 10) || 4),
    })
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={settingStyles.container}>
        <View style={settingStyles.header}>
          <Text style={settingStyles.title}>타이머 설정</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={settingStyles.closeBtn}>닫기</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={settingStyles.body}>
          {[
            { label: '집중 시간 (분)', value: work, set: setWork },
            { label: '짧은 휴식 (분)', value: short_, set: setShort },
            { label: '긴 휴식 (분)', value: long_, set: setLong },
            { label: '긴 휴식 전 세션 수', value: before, set: setBefore },
          ].map(({ label, value, set }) => (
            <View key={label} style={settingStyles.row}>
              <Text style={settingStyles.label}>{label}</Text>
              <TextInput
                style={settingStyles.input}
                value={value}
                onChangeText={set}
                keyboardType="number-pad"
                selectTextOnFocus
              />
            </View>
          ))}
          <TouchableOpacity onPress={save} style={settingStyles.saveBtn}>
            <Text style={settingStyles.saveBtnText}>저장</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { color: THEME.text, fontSize: 20, fontWeight: '700' },
  settingsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  settingsBtnText: { color: THEME.text, fontSize: 13 },

  phaseRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 40,
  },
  phaseBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  phaseBtnActive: { backgroundColor: THEME.text, borderColor: THEME.text },
  phaseText: { color: THEME.textMuted, fontSize: 12, fontWeight: '500' },
  phaseTextActive: { color: THEME.bg },

  timerWrap: { alignItems: 'center', marginBottom: 24 },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 6,
    borderColor: THEME.border2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
  },
  timerText: { color: THEME.text, fontSize: 52, fontWeight: '200', letterSpacing: 2 },
  phaseLabel: { color: THEME.textMuted, fontSize: 13, marginTop: 4 },

  sessionText: {
    color: THEME.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 32,
  },

  controls: { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  primaryBtn: {
    flex: 1,
    backgroundColor: THEME.text,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnPause: { backgroundColor: THEME.border2 },
  primaryBtnText: { color: THEME.bg, fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border2,
    alignItems: 'center',
  },
  secondaryBtnText: { color: THEME.textMuted, fontSize: 16 },
})

const settingStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  title: { color: THEME.text, fontSize: 17, fontWeight: '600' },
  closeBtn: { color: THEME.accent, fontSize: 15 },
  body: { padding: 20, gap: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  label: { color: THEME.text, fontSize: 14 },
  input: {
    width: 72,
    backgroundColor: THEME.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: THEME.text,
    fontSize: 14,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: THEME.text,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: THEME.bg, fontSize: 15, fontWeight: '600' },
})

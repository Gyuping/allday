let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!sharedCtx || sharedCtx.state === 'closed') {
      sharedCtx = new AudioContext()
    }
    return sharedCtx
  } catch {
    return null
  }
}

// 플레이 버튼 클릭 시 호출 — 사용자 제스처 컨텍스트에서 AudioContext를 미리 활성화
// 이렇게 해야 맥/Safari에서 타이머 완료 후 소리가 제대로 재생된다.
export function unlockAudio() {
  const ctx = getCtx()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

function bell(ctx: AudioContext, freq: number, when: number, vol: number, decay: number) {
  const osc1 = ctx.createOscillator()
  const g1 = ctx.createGain()
  osc1.connect(g1)
  g1.connect(ctx.destination)
  osc1.type = 'sine'
  osc1.frequency.value = freq
  g1.gain.setValueAtTime(0, when)
  g1.gain.linearRampToValueAtTime(vol, when + 0.008)
  g1.gain.exponentialRampToValueAtTime(0.0001, when + decay)
  osc1.start(when)
  osc1.stop(when + decay + 0.02)

  // 비조화 배음(2.756배) — 이 배율이 벨 특유의 맑은 금속음을 만든다
  const osc2 = ctx.createOscillator()
  const g2 = ctx.createGain()
  osc2.connect(g2)
  g2.connect(ctx.destination)
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2.756
  g2.gain.setValueAtTime(0, when)
  g2.gain.linearRampToValueAtTime(vol * 0.12, when + 0.008)
  g2.gain.exponentialRampToValueAtTime(0.0001, when + decay * 0.45)
  osc2.start(when)
  osc2.stop(when + decay + 0.02)
}

function playBells(fn: (ctx: AudioContext) => void) {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => fn(ctx)).catch(() => {})
  } else {
    fn(ctx)
  }
}

// 집중 완료 시 재생 — C5→E5→G5 상행 화음 (보상감 있는 밝은 느낌)
export function playWorkComplete() {
  try {
    playBells((ctx) => {
      const t = ctx.currentTime
      bell(ctx, 523.25, t + 0.00, 0.30, 1.3) // C5
      bell(ctx, 659.25, t + 0.20, 0.28, 1.3) // E5
      bell(ctx, 783.99, t + 0.40, 0.33, 1.6) // G5
    })
  } catch {
    /* Web Audio API를 지원하지 않는 환경에서는 조용히 무시 */
  }
}

// 휴식 완료 시 재생 — G4→C5 2음 신호 (집중 복귀를 촉구하는 간결한 느낌)
export function playBreakComplete() {
  try {
    playBells((ctx) => {
      const t = ctx.currentTime
      bell(ctx, 392.00, t + 0.00, 0.26, 0.9) // G4
      bell(ctx, 523.25, t + 0.24, 0.30, 1.1) // C5
    })
  } catch {
    /* Web Audio API를 지원하지 않는 환경에서는 조용히 무시 */
  }
}

function bell(ctx: AudioContext, freq: number, when: number, vol: number, decay: number) {
  // 기본 사인파
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

  // 비조화 배음(2.756배) — 벨 특유의 맑은 느낌
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

// 집중 완료: C5 → E5 → G5 상행 체임 (보상감 있는 3음)
export function playWorkComplete() {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime
    bell(ctx, 523.25, t + 0.00, 0.30, 1.3) // C5
    bell(ctx, 659.25, t + 0.20, 0.28, 1.3) // E5
    bell(ctx, 783.99, t + 0.40, 0.33, 1.6) // G5
    setTimeout(() => ctx.close(), 3500)
  } catch {
    /* Web Audio API 미지원 */
  }
}

// 휴식 완료: G4 → C5 2음 신호 (집중 촉구, 더 짧고 명료)
export function playBreakComplete() {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime
    bell(ctx, 392.00, t + 0.00, 0.26, 0.9) // G4
    bell(ctx, 523.25, t + 0.24, 0.30, 1.1) // C5
    setTimeout(() => ctx.close(), 2500)
  } catch {
    /* Web Audio API 미지원 */
  }
}

# 🐛 버그 목록

> 버그 발견 시 즉시 이 파일에 기록할 것.
> 심각도: 🔴 심각 / 🟡 보통 / 🟢 낮음
> 상태: 미해결 / 해결중 / 해결완료

## 🐛 버그 목록

| 날짜 | 파일 | 버그 내용 | 심각도 | 상태 | 해결방법 |
|------|------|-----------|--------|------|----------|
| 2026-06-03 | `store/todoStore.ts` | `completedAt`에 UTC 기준 날짜 사용 → 타임존 차이로 날짜 1일 오차 | 🟡 보통 | 해결완료 | `toLocaleDateString('sv-SE')` 로 변경 |
| 2026-06-03 | `app/pomodoro/page.tsx` | 타이머 tick에서 `cur - 1` 하한 없음 → 음수 초 가능 | 🟡 보통 | 해결완료 | `Math.max(0, cur - 1)` 적용 |
| 2026-06-03 | `hooks/useEventReminders.ts` | `startTime` 유효성 검사 없음 → NaN으로 알림 계산 오류 | 🔴 심각 | 해결완료 | 정규식으로 포맷 검증 후 진입 차단 |
| 2026-06-03 | `app/api/holidays/route.ts` | API 응답 `item`이 null일 때 `[null]` 배열 생성 → iterate 오류 | 🟡 보통 | 해결완료 | null 필터링 추가 |
| 2026-06-03 | `store/colorLabelStore.ts` | localStorage 용량 초과 시 silent fail | 🟡 보통 | 해결완료 | try/catch로 감싼 safeStorage 적용 |
| 2026-06-03 | `components/calendar/EventModal.tsx` | `PRESET_COLORS` import 누락 → 런타임 오류 | 🔴 심각 | 해결완료 | import 추가 및 타입 `string` 명시 |
| 2026-06-03 | `components/calendar/RangeAddModal.tsx` | `PRESET_COLORS` import 누락 → 런타임 오류 | 🔴 심각 | 해결완료 | import 추가 |
| 2026-06-03 | `components/calendar/EventDetailModal.tsx` | `parseInt(month)` — month가 이미 number인데 string 인자 전달 | 🟡 보통 | 해결완료 | `parseInt` 제거 |
| 2026-06-03 | `components/calendar/WeekView.tsx` | `endTime`이 비정상 값이면 이벤트 위치가 NaN | 🟡 보통 | 해결완료 | NaN 또는 startMin 이하면 +1시간 fallback |
| 2026-06-03 | `hooks/useTagInput.ts` | 태그 대소문자 구분 ("React" ≠ "react") | 🟢 낮음 | 해결완료 | `.toLowerCase()` 적용 |
| 2026-06-25 | `components/calendar/CalendarGrid.tsx` | 더블클릭이 단일클릭과 충돌 — 팝업이 즉시 열려 더블클릭 인식 불가 | 🟡 보통 | 해결완료 | 130ms 타이머로 단일/더블 클릭 분기 |
| 2026-06-26 | `contexts/AuthContext.tsx` | 팝업 중복 요청 또는 사용자 닫기 시 `auth/cancelled-popup-request` 에러 노출 | 🟢 낮음 | 해결완료 | try/catch로 해당 에러 코드 무시 처리 |
| 2026-06-26 | `components/ui/LoginScreen.tsx` | 로그인 화면이 `body`의 flex 컨테이너에서 왼쪽으로 치우침 | 🟢 낮음 | 해결완료 | `w-full` 추가 |
| 2026-06-26 | `app/layout.tsx` | Google Fonts(`Space Grotesk`) 빌드 시 네트워크 오류 → 빌드 실패 | 🟡 보통 | 해결완료 | 폴백 폰트 추가로 대응 |
| 2026-06-26 | `app/layout.tsx` | 폰트 fallback 배열에 `'"Segoe UI"'` 중첩 따옴표 → 파싱 에러 | 🔴 심각 | 해결완료 | `'"Segoe UI"'` → `'Segoe UI'` 로 수정 |
| 2026-06-26 | `lib/firestore/calendar.ts` | `deleteField()`를 `setDoc`에 사용 → Firestore 에러 후 롤백 → 일정 저장 안 됨 | 🔴 심각 | 해결완료 | `cleanForSet`(undefined 제외) / `cleanForUpdate`(deleteField) 분리 |
| 2026-06-26 | `components/ui/Providers.tsx` | 구독 해제 함수 실패 시 나머지 미실행 → 메모리 누수 | 🟡 보통 | 해결완료 | 각 `unsub()` 호출을 개별 try-catch로 감쌈 |
| 2026-06-26 | `components/ui/Providers.tsx` | `resetExpiredCompleted()` async 미처리 | 🟢 낮음 | 해결완료 | `.catch(() => {})` 추가 |
| 2026-06-26 | `components/calendar/DayDetailModal.tsx` | `Promise.all` 사용 시 일부 실패하면 전체 중단 | 🟡 보통 | 해결완료 | `Promise.allSettled`로 변경 |
| 2026-06-26 | `hooks/useEventReminders.ts` | 매 렌더마다 정규식 재컴파일 | 🟢 낮음 | 해결완료 | `TIME_REGEX` 모듈 상수로 추출 |
| 2026-06-26 | `store/todoStore.ts` | 전체 삭제 시 완료 항목도 삭제됨 | 🟡 보통 | 해결완료 | 미완료 항목만 삭제하도록 수정 |

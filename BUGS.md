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
| 2026-07-11 | `components/todo/TodoItem.tsx` | 터치 기기에서 삭제 버튼이 hover-only라 보이지 않아 삭제 불가 | 🔴 심각 | 해결완료 | `[@media(hover:none)]:opacity-100` 추가, 수정/삭제 버튼을 함께 그룹으로 묶음 |
| 2026-07-11 | `components/todo/TodoItem.tsx` | 모바일에서 더블탭이 브라우저 확대로 처리 → 수정 진입 불가 | 🔴 심각 | 해결완료 | Pencil 아이콘 수정 버튼 추가 (터치에서도 항상 표시) |
| 2026-07-11 | `store/pomodoroStore.ts` | `sessionCount`가 persist되지 않아 새로고침 시 세션 카운터 초기화 → 긴 휴식 타이밍 틀어짐 | 🟡 보통 | 해결완료 | `partialize`에 `sessionCount` 추가 |
| 2026-07-11 | `store/todoStore.ts` | `resetExpiredCompleted` Firestore 실패 시 로컬 상태 롤백 없음 → 서버/클라 불일치 | 🟡 보통 | 해결완료 | catch 블록에 원본 아이템 복원 롤백 추가 |
| 2026-07-11 | `store/todoStore.ts` | `clearAll` Firestore 실패 시 에러 토스트 없음 | 🟢 낮음 | 해결완료 | catch 블록에 `toast.error` 추가 |
| 2026-07-11 | `components/todo/EditTodoModal.tsx` | `onSave`(async)를 await하지 않아 실패해도 모달이 닫힘 | 🟡 보통 | 해결완료 | `handleSubmit` async화, `onSave` await 처리 |
| 2026-07-11 | `lib/firestore/todos.ts` | `clearAllTodos`가 Firestore 배치 한도 500개 초과 시 에러 | 🟡 보통 | 해결완료 | 500개 단위 청크로 분할 커밋 |
| 2026-07-11 | `components/calendar/EventForm.tsx` | `endDate` 필드 없음 → 다일정 편집 시 종료일 확인/변경 불가 | 🟡 보통 | 해결완료 | `EventFormData`에 `endDate` 추가, 날짜 필드를 시작일+종료일 2칸으로 분리 |
| 2026-07-11 | `components/calendar/DayDetailModal.tsx` | 일정 추가/수정 시 `endDate` 미전달 → 다일정 생성 불가 | 🟡 보통 | 해결완료 | `addEvent`/`updateEvent` 호출 시 `data.endDate` 전달 |
| 2026-07-11 | `components/calendar/WeekView.tsx` | `pointercancel` 미처리 → iOS Safari 터치 취소 시 드래그 상태 잔존 | 🟡 보통 | 해결완료 | `cancelDrag` 콜백 추가, `window.addEventListener('pointercancel', cancelDrag)` |
| 2026-07-11 | `components/calendar/DayView.tsx` | `pointercancel` 미처리 → iOS Safari 터치 취소 시 드래그 상태 잔존 | 🟡 보통 | 해결완료 | 동일 방법 적용 |
| 2026-07-11 | `app/calendar/page.tsx` | `onEventClick`에 `initialEvent` 미전달 → 일정 클릭 시 목록 뷰로 열림 (편집 뷰 바로 진입 불가) | 🟢 낮음 | 해결완료 | 세 뷰 모두 `setDayModal({ date: ev.date, initialEvent: ev })` 로 변경 |
| 2026-07-13 | `app/calendar/page.tsx` | 주간/일간 뷰에서 연도를 넘어 이동해도 `viewYear` 미갱신 → 공휴일 미표시 또는 오표시 | 🟡 보통 | 해결완료 | `effectiveYear` 계산(뷰에 따라 weekStart/viewDay 기준), 주가 연도 걸칠 때 `crossYear`로 두 연도 병합 |
| 2026-07-13 | `components/calendar/WeekView.tsx` | `today` 값이 마운트 시 한 번만 계산(`useMemo []`) → 자정 이후에도 오늘 강조 미갱신 | 🟢 낮음 | 해결완료 | `useMemo` 제거, `todayStr()` 직접 호출로 교체 |
| 2026-07-13 | `components/calendar/DayView.tsx` | `todayStr` 값이 마운트 시 한 번만 계산(`useMemo []`) → 자정 이후에도 오늘 강조 미갱신 | 🟢 낮음 | 해결완료 | `useMemo` 제거, `todayStr()` 직접 호출로 교체 (60s 인터벌로 자동 갱신) |
| 2026-07-13 | `components/calendar/MonthPicker.tsx` | 외부 클릭 감지를 `mousedown`만 등록 → 모바일 터치에서 피커가 안 닫힘 | 🟢 낮음 | 해결완료 | `mousedown` → `pointerdown`으로 교체, `isPrimary` 체크 추가 |
| 2026-07-13 | `store/todoStore.ts` | `toggleTodo` 완료 해제 시 `completedAt ?? null` → Firestore에 null 저장 (deleteField 미적용) | 🟢 낮음 | 해결완료 | `?? null` 제거, `cleanForUpdate`가 undefined → `deleteField()` 처리하도록 수정 |
| 2026-07-13 | `store/todoStore.ts` | `resetExpiredCompleted`에서 `Promise.all` 사용 → 부분 실패 시 성공한 항목까지 롤백, 서버/클라 불일치 | 🟢 낮음 | 해결완료 | `Promise.allSettled`로 교체, 실패한 항목만 개별 롤백 |
| 2026-07-13 | `app/pomodoro/page.tsx` | 스킵 버튼 `skipPhase`에서 `sessionCount % n === 0`으로 판단 → 첫 스킵(count=0)에서 longBreak로 잘못 이동, 4번째 스킵에서 shortBreak로 잘못 이동 | 🟡 보통 | 해결완료 | `(sessionCount + 1) % n`으로 수정 (`completeRef`와 동일 기준) |
| 2026-07-13 | `store/pomodoroStore.ts` | `secondsLeft`가 `DEFAULT_SETTINGS.workMinutes * 60`으로 초기화 → 설정 변경 후 새로고침 시 50:00으로 오표시, 링 progress 오류 | 🟢 낮음 | 해결완료 | `onRehydrateStorage`에서 `secondsLeft`를 persisted `settings.workMinutes * 60`으로 재설정 |
| 2026-07-13 | `store/calendarStore.ts` | `updateEvent`에서 `pendingIds` 추가 시 클로저 캡처된 `next` 사용 → `set()` 함수형 업데이트와 패턴 불일치, 동시 set 배치 시 stale 가능성 | 🟢 낮음 | 해결완료 | `set((s) => { const ids = new Set(s.pendingIds); ids.add(id); ... })` 패턴으로 통일 |
| 2026-07-13 | `store/calendarStore.ts` | `deleteEvent` 실패 롤백 시 `[...s.events, prev]`로 이벤트가 배열 맨 뒤로 이동 → 원래 위치 복원 안 됨 | 🟢 낮음 | 해결완료 | `findIndex`로 원래 인덱스 저장, `splice(idx, 0, prev)`로 원위치에 복원 |
| 2026-07-22 | `app/todo/page.tsx` | 필터/태그 결과 0개일 때 "해당하는 할일이 없습니다." 텍스트만 뜨고 추가 버튼 없음 | 🟢 낮음 | 해결완료 | 전체 0개 케이스와 동일하게 원형(`rounded-full bg-emerald-500`) + 버튼 추가 |
| 2026-07-22 | `contexts/AuthContext.tsx` | Google 로그인(`signInWithPopup`) 시 콘솔에 `Cross-Origin-Opener-Policy policy would block the window.closed/close call` 경고 | 🟢 낮음 | 확인됨(조치 불필요) | 원인은 accounts.google.com 자체 COOP 헤더 — AllDay 쪽엔 COOP 헤더 미설정. Firebase SDK가 postMessage fallback으로 로그인 정상 처리(사용자 확인: 로그인 정상 동작). 콘솔 노이즈일 뿐 실제 버그 아님 |
| 2026-07-22 | `app/calendar/page.tsx` | 월/주/일 뷰 `onEventClick`이 전부 `setDayModal({ date: ev.date })`만 호출, `initialEvent` 미전달 → 일정 클릭해도 목록 뷰로만 열리고 편집 화면 직행 안 됨. BUGS.md #43(2026-07-11)에 "해결완료"로 기록됐던 것과 실제 코드가 불일치(회귀) — 직접 재확인함 | 🔴 심각 | 미해결 | - |
| 2026-07-22 | `components/calendar/WeekView.tsx` | 잘못된 형식의 `startTime`이 들어온 이벤트에 대해 `DayView.tsx`는 렌더 스킵하지만 `WeekView.tsx`는 `startMin` NaN 검증이 없어 위치가 깨진 채 렌더링됨 (뷰 간 검증 불일치) | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `components/calendar/EventForm.tsx`, `RangeAddModal.tsx` | 종료시간 < 시작시간으로 저장 가능 (종료일<시작일만 검증, 시간 순서 검증 없음) → 화면에는 자동 보정된 시간이 표시되어 저장값과 표시값이 달라짐 | 🟢 낮음 | 미해결 | - |
| 2026-07-22 | `store/calendarStore.ts` | `updateEvent` 호출 중 같은 id로 또 수정 요청이 오면 `pendingIds.has(id)`일 때 조용히 무시(toast/재시도 없음) → 두 번째 수정 내용이 로컬·서버 어디에도 반영되지 않고 사라짐 | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `store/todoStore.ts` | `toggleTodo`/`updateTodo`/`clearAll` 롤백 시 요청 시작 시점의 전체 스냅샷으로 덮어씀 → 롤백 대상 필드 외에, 그 사이 다른 탭/요청에서 성공한 변경까지 함께 사라짐(동시 편집 시 데이터 손실) | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `store/todoStore.ts` | `deleteTodo` 롤백 시 요청 시작 시점에 캡처한 `idx`를 그 사이 배열이 바뀐 뒤에도 그대로 사용 → 복원 위치가 부정확해질 수 있음 | 🟢 낮음 | 미해결 | - |
| 2026-07-22 | `components/todo/AddTodoModal.tsx`, `EditTodoModal.tsx` | 제목/태그 글자수 제한 없음 → 매우 긴 텍스트 입력 시 Firestore 1MB 문서 한도 초과로 저장 실패, 사용자는 원인을 모른 채 같은 입력 재시도만 반복 | 🟢 낮음 | 미해결 | - |
| 2026-07-22 | `contexts/AuthContext.tsx` | `auth/popup-blocked` catch 안에서 호출하는 `signInWithRedirect` 자체가 실패하면(서드파티 쿠키 차단 등) 별도 try/catch가 없어 unhandled rejection, `loginError` 미설정 → 로그인 버튼이 반응 없는 것처럼 보임 | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `contexts/AuthContext.tsx` | `getRedirectResult` 실패 시(`popup-closed-by-user`/`cancelled-popup-request` 이외 에러코드) `console.error`만 호출, `setLoginError` 미호출 → 로그인 실패가 사용자에게 조용히 삼켜짐 | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `lib/firebase.ts` | `auth`/`db`를 `_auth!`/`_db!`로 non-null 단정 → 환경변수 누락 등으로 실제 undefined일 때 `if (!auth)` 가드 없는 다른 코드에서 처리되지 않은 raw TypeError로 크래시 | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `store/toastStore.ts` | `crypto.randomUUID()`가 비보안 컨텍스트(사설 IP 등)에서 예외를 던짐 → 토스트 자체가 무력화되고, 각지의 `catch { toast.error(...) }` 에러 안내도 함께 조용히 실패 | 🟢 낮음 | 미해결 | - |
| 2026-07-22 | `store/pomodoroStore.ts` | `partialize`가 `phase`를 저장하지 않음 → 휴식 중 새로고침하면 항상 `phase: 'work'`로 리셋되지만 `sessionCount`는 유지되어 진행 상태가 어긋나 보임 | 🟢 낮음 | 미해결 | - |
| 2026-07-22 | `app/pomodoro/page.tsx` | 총 집중시간 통계를 `sessionCount * settings.workMinutes`(현재 설정값)로 계산 → 설정 변경 시 과거에 완료한 세션의 집계 시간까지 소급 변경됨 | 🟡 보통 | 미해결 | - |
| 2026-07-22 | `store/pomodoroStore.ts` | 여러 탭 동시 사용 시 `storage` 이벤트 리스너 없음 → 한 탭의 오래된 상태로 설정 변경 시 다른 탭에서 완료한 `sessionCount`가 덮어써짐(lost update) | 🟢 낮음 | 미해결 | - |

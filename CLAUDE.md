# AllDay — Project Guide

## Overview

AllDay is a productivity app combining a calendar, schedule manager, to-do list, and Pomodoro timer (user-configurable durations). The project targets both **web** and **mobile app**, with web built first. Deployment is planned for both platforms.

## Current Phase

**Web version** — in development, not yet deployed.

## Core Features

| Feature | Description |
|---|---|
| Calendar | Monthly/weekly/daily view, event creation and editing |
| Schedule Manager | Time-blocked events, reminders |
| To-Do List | Task creation, completion tracking, priority/tagging |
| Pomodoro Timer | Work/break durations fully configurable by the user |

## Tech Stack (to be finalized)

- **Web**: React (or Next.js) + TypeScript
- **Styling**: TailwindCSS
- **State**: TBD (Zustand / Redux Toolkit)
- **Backend / DB**: TBD
- **App (future)**: React Native or Flutter

> Update this section as stack decisions are made.

## Project Structure (planned)

```
allday/
├── web/          # Web app (current focus)
├── app/          # Mobile app (future)
├── shared/       # Shared types and utilities
└── CLAUDE.md
```

## Cross-Platform 고려사항 (Windows / Mac)

개발 시 항상 Windows와 Mac 양쪽을 고려할 것.

| 항목 | Windows | Mac | 대응 방법 |
|------|---------|-----|-----------|
| 줄바꿈 | CRLF (`\r\n`) | LF (`\n`) | `.gitattributes`로 통일, `prettier`로 강제 |
| 파일 경로 | `\` 백슬래시 | `/` 슬래시 | 항상 `/` 또는 `path.join()` 사용 |
| 스크롤바 | 항상 표시됨 | 기본 숨겨짐 | 레이아웃 설계 시 스크롤바 공간 고려 |
| 폰트 렌더링 | 각지고 선명 | 부드럽고 둥글게 | 양쪽에서 폰트 크기/굵기 확인 |
| Google Fonts 빌드 | 네트워크 오류 가능 | 상대적으로 안정 | 빌드 실패 시 로컬 폰트 fallback 고려 |
| 터치/스크롤 | 마우스 기반 | 트랙패드 제스처 | wheel 이벤트 처리 시 deltaMode 확인 |

## Development Guidelines

- TypeScript strict mode on all new code.
- **`any` 절대 사용 금지** — `unknown`, 정확한 타입, 또는 타입 가드(`instanceof`, `in`)로 대체할 것. `any`는 나중에 반드시 런타임 오류로 돌아옴.
- Components are small and single-purpose.
- No comments unless the *why* is non-obvious.
- Pomodoro timer durations must be user-configurable — never hardcode 25/5 min defaults as fixed values.
- Feature flags or platform guards go in `shared/` so web and app share the same logic.
- **버그나 에러 발견 시 항상 `/BUGS.md`에 자동으로 기록할 것** (날짜, 파일, 내용, 심각도, 상태, 해결방법 포함)

## Commands

> Fill in once the stack is chosen.

```bash
# Install
# Start dev server
# Build
# Test
```

## Deployment

- Web: TBD (Vercel / Netlify / etc.)
- App: TBD (App Store / Play Store)

---

## 버그 수정 워크플로우

버그 수정이나 QA 요청을 받으면 아래 순서를 반드시 따른다:

1. 대상 기능/항목의 기대 동작을 먼저 정리한다
2. 오류 시나리오(정상 케이스 + 엣지 케이스)를 나열한다
3. 시나리오대로 실제로 실행/테스트하고 결과를 기록한다
4. 기대와 다르게 동작하는 것만 목록으로 정리해서 보고한다
   (표 형식: 항목 / 시나리오 / 기대동작 / 실제동작)
5. 사용자의 확인·승인을 받기 전에는 절대 코드를 수정하지 않는다
6. 승인된 항목만 수정을 진행한다

주의사항:
- 한 번에 너무 광범위한 범위를 다루지 않는다.
  기능 단위(캘린더/할일/뽀모도로/공통 등)로 좁혀서 진행한다
- "테스트했다"고 말할 때는 실제 실행 근거(로그, 결과)를 함께 제시한다.
  코드만 읽고 "정상으로 보입니다"라고 판단하지 않는다
- 낙관적 업데이트, localStorage persist, 시간 기반 로직(자정 리셋 등),
  날짜 유틸리티 관련 코드는 특히 신중하게 시나리오를 짠다

---

## 버그 예방 보완 워크플로우

체크리스트에 명시되지 않은 잠재 버그를 찾을 때, 또는 새 기능을
구현한 직후에는 아래를 함께 수행한다.

### 1. 체크리스트 외 시나리오 확장
기능 하나를 검토할 때, 명시된 케이스 외에 아래 카테고리를
스스로 추가 제안한다:
- 입력값 극단 케이스 (빈 값, 매우 긴 텍스트, 특수문자/이모지,
  숫자만/공백만)
- 네트워크 실패 케이스 (요청 중 끊김, 느린 응답, 타임아웃)
- 동시성 케이스 (같은 데이터를 여러 탭/기기에서 동시에 수정)
- 시간/타임존 케이스 (자정 근처, 다른 타임존 기기, 서머타임)
- 데이터 규모 케이스 (일정/할일이 수백 개 쌓였을 때)
이 카테고리 중 해당 기능과 관련 없는 건 생략해도 되지만,
관련 있는데 누락했다면 반드시 시나리오에 포함시킨다.

### 2. 코드로 확인 불가능한 항목은 명시적으로 분리
아래에 해당하는 건 "코드상으로는 이상 없음"이라고만 보고하고,
정상 동작을 보장한다고 말하지 않는다:
- 실제 브라우저/디바이스 렌더링 (특히 Safari, iOS 터치 이벤트)
- 반응형 레이아웃의 실제 시각적 결과
- 실제 서버 부하/동시 접속 상황
→ 이런 항목은 "실기기 확인 필요" 라벨을 붙여서 목록 맨 아래
별도로 정리한다.

### 3. 새 기능 구현 직후 자동 점검
새 기능을 구현하거나 기존 기능을 수정한 직후에는, 요청받지
않아도 아래를 확인하고 결과를 짧게 보고한다:
- 이 변경이 날짜 유틸(date.ts), store의 낙관적 업데이트,
  localStorage persist 로직 중 하나라도 건드렸는가
  → 건드렸다면 관련 회귀 시나리오를 짧게라도 확인
- 기존 테스트(Vitest)가 깨지지 않았는가

### 4. Sentry 로그 기반 역추적
"최근 에러 확인해줘" 같은 요청을 받으면, 코드만 보지 말고
Sentry 대시보드/로그 데이터를 우선 확인한 뒤, 해당 에러의
재현 시나리오를 역으로 구성해서 보고한다.

### 5. 모르는 것을 모른다고 말한다
검증할 방법이 없는 부분(실기기, 실사용자 트래픽, 외부 API
장애 등)에 대해 추측성으로 "괜찮을 것"이라 단정하지 않는다.
확인 불가 영역은 별도로 명시한다.

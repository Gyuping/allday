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

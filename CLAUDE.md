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

## Development Guidelines

- TypeScript strict mode on all new code.
- Components are small and single-purpose.
- No comments unless the *why* is non-obvious.
- Pomodoro timer durations must be user-configurable — never hardcode 25/5 min defaults as fixed values.
- Feature flags or platform guards go in `shared/` so web and app share the same logic.

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

# Technical Guidelines (Slop Museum)

This document defines the development conventions for the Slop Museum codebase. Keep changes consistent with these rules.

## 1) Stack & Tooling

- **Framework**: Next.js App Router (React 18)
- **Language**: TypeScript (`strict: true`)
- **Styling**: Tailwind CSS + shadcn/ui
- **i18n**: `next-intl`
- **Auth/DB**: Supabase
- **Lint/Format**: ESLint (Next.js) + Prettier

## 2) Code Style

- **Naming**
  - Components: `PascalCase` (e.g., `SlopCard.tsx`)
  - Hooks: `useCamelCase` (e.g., `useSlops`)
  - Variables/functions: `camelCase`
  - Types/interfaces: `PascalCase`
- **Imports** (group in this order)
  1. External libraries
  2. Internal modules via `@/`
  3. Relative files
- **Type Safety**
  - Avoid `any`; prefer explicit types or `unknown` + runtime validation.
  - Define API response shapes in `src/types` or `src/lib/validators`.

## 3) Project Structure

```
src/
  app/
    [locale]/
      layout.tsx        # Locale layout (no <html>/<body> here)
      page.tsx          # Home page
      admin/
      slop/
      submit/
      user/
    api/                # API routes
  components/
    ui/                 # shadcn/ui primitives
    features/           # feature-level components
    layout/             # app-level layout components (Navbar, Footer)
  hooks/
  i18n/
  lib/
    db/                 # Supabase clients/queries
    validators/         # Zod schemas
  types/
```

## 4) App Router + i18n Conventions

- Root layout (`src/app/layout.tsx`) **must** render `<html>` and `<body>`.
- Locale layout (`src/app/[locale]/layout.tsx`) **must not** render `<html>/<body>`.
- Prefer `next-intl` helpers (`getTranslations`, `useTranslations`) for copy.
- Keep locale-aware routes under `src/app/[locale]`.

## 5) Data & API

- Use Supabase clients in `src/lib/db` (server/client split if needed).
- Validate user inputs with Zod (or typed validators) before persistence.
- API routes live under `src/app/api` and should return typed JSON.

## 6) Testing & Quality

- **Unit/Integration**: Jest + React Testing Library (colocate tests with source).
- **Static checks**: `npm run lint` and `tsc --noEmit`.
- **E2E**: TBD (Playwright or Cypress). Document once chosen.

## 7) PR/Change Hygiene

- Keep commits small and focused.
- Update types/validators when API shapes change.
- Run `npm run lint` before pushing.

## 8) Environment Setup

- **Node**: Use the project’s required Node version (match `.nvmrc` if present).
- **Install**: `npm install`
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`

## 9) Secrets & Config

- Keep secrets in `.env.local` (never commit).
- Required env vars should be documented in `README.md`.
- Public env vars must be prefixed with `NEXT_PUBLIC_`.

## 10) Deployment

- Build with `npm run build` and run with `npm run start`.
- Ensure environment variables are set in the hosting platform.
- Run database migrations (if any) before deploying.

## 11) CI/CD Expectations

- CI should run:
  - `npm run lint`
  - `tsc --noEmit`
  - unit/integration tests (once configured)
- Block merges if CI fails.

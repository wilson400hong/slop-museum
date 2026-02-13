
# Technical Guideline (gemini.md)

This document outlines the technical guidelines and best practices for the Slop Museum project. Adhering to these guidelines ensures code quality, consistency, and maintainability.

## 1. Coding Style

- **Language**: TypeScript
- **Linter**: ESLint (Next.js default)
- **Formatter**: Prettier
- **Naming Conventions**:
    - Components: PascalCase (e.g., `SlopCard.tsx`)
    - Variables/Functions: camelCase (e.g., `fetchSlops`)
    - Types/Interfaces: PascalCase (e.g., `type Slop`)
- **Imports**:
    - Use path aliases (`@/components`, `src/lib`) where possible.
    - Group imports:
        1. External libraries (e.g., `react`, `next`)
        2. Internal components/modules (e.g., `@/components`)
        3. Local files (e.g., `./styles.css`)
- **Strict Typing**: `tsconfig.json` is configured with `strict: true`. Avoid using `any` and prefer `unknown` or specific Zod schemas for API responses.

## 2. Folder Structure

The project uses the Next.js App Router. Here is the recommended structure for organizing files:

```
src/
  app/
    [locale]/
      (auth)/          # Route group for auth pages (login, etc)
      (user)/          # Route group for user-related pages
      admin/           # Admin dashboard pages
      slop/            # Slop submission and detail pages
      layout.tsx       # Root layout for locale
      page.tsx         # Home page
    api/
      ...              # API routes
    ...
  components/
    ui/                # Dumb/Primitive UI components (e.g., Button, Card from shadcn/ui)
    features/          # Business-logic rich, feature-specific components
      slop/            # Components related to the "slop" feature
        SlopCard.tsx
        SlopList.tsx
      auth/            # Components related to authentication
        LoginButton.tsx
        UserMenu.tsx
    layout/            # Components for overall page structure
      Navbar.tsx
      Footer.tsx
  lib/
    db/                # Database-related utilities (e.g., Supabase client, queries)
    validators/        # Zod schemas for validation
    utils.ts           # Generic utility functions
  hooks/               # Custom React hooks
  types/               # Global TypeScript types and interfaces
  ...
```

## 3. Testing & QA Plan

Quality is maintained through a multi-layered testing strategy.

### 3.1 Frameworks and Tools

- **Unit & Integration Testing**: [Jest](https://jestjs.io/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **End-to-End (E2E) Testing**: (To be determined, possibly Playwright or Cypress)
- **Static Analysis**: ESLint and TypeScript compiler (`tsc`)

### 3.2 Testing Strategy

- **Unit Tests**:
    - **Target**: Individual functions, components, and hooks.
    - **Location**: `*.test.ts` or `*.test.tsx` files colocated with the source file.
    - **Examples**:
        - Test utility functions in `lib/utils.ts`.
        - Test validation logic in `lib/validators/*.ts`.
        - Test that a `Button` component renders correctly and handles clicks.

- **Integration Tests**:
    - **Target**: Interactions between multiple components and services.
    - **Location**: Typically within the `__tests__` directory or a dedicated `tests/` folder at the root.
    - **Examples**:
        - Test the full "slop submission" flow, mocking Supabase API calls.
        - Test that filtering slops on the homepage correctly updates the displayed list.

- **End-to-End (E2E) Tests**:
    - **Target**: Complete user journeys in a browser-like environment.
    - **Examples**:
        - A user logs in, submits a new slop, and sees it on their profile.
        - An admin user logs in, navigates to the admin dashboard, and deletes a reported slop.

### 3.3 CI/CD Pipeline

- All pull requests must pass linting, type-checking (`tsc --noEmit`), and all unit/integration tests before being eligible for merging.
- E2E tests should be run against the staging environment before deploying to production.

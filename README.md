# interview-khichuri-web

Web client for **Interview Khichuri** — a self-hostable, privacy-first AI interview-preparation and
job-tracking platform.

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/ui on Base UI · react-router 8

> Monorepo note: this is one of several sibling projects (not an npm workspace). The backend lives
> in `../interview-khichuri-api`. Shared domain vocabulary is in the parent `CONTEXT.md`; UI
> conventions are documented in `../docs/ui-rules.md` and `../docs/ui-tokens.md`.

---

## Table of contents

- [Features](#features)
- [Stack](#stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project layout](#project-layout)
- [Conventions](#conventions)
- [Routing](#routing)
- [Data layer](#data-layer)
- [Local state](#local-state)
- [IndexedDB](#indexeddb)
- [Theming](#theming)
- [Auth](#auth)
- [AI features](#ai-features)
- [Adding UI components](#adding-ui-components)
- [Linting and formatting](#linting-and-formatting)
- [Testing](#testing)

---

## Features

- **Jobs** — pipeline tracking with status, deadlines, topics, filters, sorting, and AI extraction
  of a pasted job description.
- **Resumes** — an editor with live preview, three templates, public share links, per-job ATS
  scoring, standalone AI review with a word-level accept/reject diff, and PDF export.
- **Job profile** — a normalised profile graph (experience, education, projects, publications,
  references, skills, preferences) that feeds resume generation and job matching.
- **Prep sessions** — sessions, topics, question sets, and a client-side question bank.
- **Live mock interview** — camera preview, a lip-synced talking avatar, TTS read-aloud, per-question
  timing, and streaming AI follow-up questions. Drafts survive reloads.
- **Notes** — markdown notes with a single attachment and a streaming "learn more" AI explanation.
- **Calendar** — a hand-rolled month/week/day grid merging job deadlines and interviews with custom
  events.
- **Prompt library** — personal prompts with likes and per-category defaults.
- **BYOK AI keys** — six LLM providers, configured per user.
- **Admin** — user management, impersonation, and lookup data.
- **Theming** — 23 built-in presets plus a full customizer, import/export, and no FOUC.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19.3 |
| Build | Vite 8 (`@vitejs/plugin-react`, `@tailwindcss/vite`) |
| Language | TypeScript 7, `strict` |
| Routing | react-router 8 — **declarative** mode (`<BrowserRouter>`) |
| Server state | TanStack Query 5 (`useSuspenseQuery`-first) |
| Client state | Zustand 5 with `persist` |
| Forms | react-hook-form + Zod 4 via `@hookform/resolvers` |
| UI | shadcn/ui on **Base UI** (`@base-ui/react`) — no Radix |
| Styling | Tailwind CSS 4, CSS-first config, `oklch()` tokens |
| Icons | `@phosphor-icons/react` |
| Auth | `better-auth` client + `@better-auth/passkey` |
| Markdown | `react-markdown` + `remark-gfm` + `shiki` |
| PDF | `@react-pdf/renderer` |
| Local persistence | `idb`, `minisearch`, `date-fns` |
| Lint / format | Biome 2 via `ultracite` (Prettier for editors only) |

## Getting started

```bash
npm install
```

Create `.env` in the project root:

```dotenv
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` is the **only variable the app reads** (see `src/lib/api-client.ts` and
`src/lib/auth/auth-client.ts`). It is validated with Zod at module load, so the app throws at boot
if it is missing or malformed.

```bash
npm run dev        # http://localhost:5173
```

Start the API first — this app has no data of its own. See `../interview-khichuri-api/README.md`.

### Cross-origin dev

There is **no dev proxy**. The browser calls `${VITE_API_URL}/api/v1/...` directly with
`credentials: "include"`, so the API must be CORS-configured for your exact origin and both sides
must agree on scheme. Production cookies are `SameSite=None; Secure`, which means HTTPS is required
for cross-site auth outside of `localhost`.

## Scripts

| Script | What it does |
| --- | --- |
| `dev` | Vite dev server on port 5173 |
| `build` | `tsc -b && vite build` |
| `preview` | Serve the production build |
| `typecheck` | `tsc --noEmit -p tsconfig.app.json` |
| `check` | `ultracite check` — Biome lint, **no writes** |
| `fix` | `ultracite fix` — Biome lint + auto-fix |

There is no `test` script. See [Testing](#testing).

## Project layout

`src/` is organised **by technical layer**, not by feature.

```
src/
  api/           TanStack Query hooks + types, one folder per domain
    auth/  calendar/  jobs/  keys/  lookups/  notes/
    profile/  prompts/  resumes/  sessions/
    index.ts     QueryClient ("apiClient") + queryKeys registry
  components/    Feature components, grouped by product area
    admin/  auth/  calendar/  common/  dashboard/  interview/
    job-profile/  jobs/  keys/  layout/  notes/  prep-session/
    prompts/  resume/  settings/  theme/  ui/
  hooks/         12 shared hooks
  lib/           Non-React infrastructure
    auth/  questions/  theme/
    api-client.ts  indexdb.ts  interviewStorage.ts
    search.ts  storageArchive.ts  utils.ts
  pages/         One component per route (+ admin/, auth/, landing/)
  store/         7 Zustand stores
  App.tsx        The route table
  main.tsx       Providers
  app.constants.ts
  index.css  typeset.css  fonts.css
```

Two supporting roots: `src/components/ui/` holds the shadcn/Base UI primitives, and
`src/components/common/` holds cross-feature pieces (forms, markdown, error boundaries, AI
dialogs, score displays).

Path alias: `@` → `./src` (declared in both `tsconfig.app.json` and `vite.config.ts`).

## Conventions

- **Co-located helper modules.** A form is `FooForm.tsx` + `FooForm.helpers.ts` (+ `*.types.ts`,
  `*.data.ts`). The same pattern applies to components, stores, and API modules.
- **Suspense-first data fetching.** `useSuspenseQuery` is the default; `<Spinner />` fallbacks and
  `AppErrorSuspense` handle the pending and failed states. Prefer it over `useQuery` for new code.
- **Class names.** `import { cn } from "cn"` (standalone package), with `class-variance-authority`
  for variants.
- **`import type` is mandatory** — `verbatimModuleSyntax` is on.
- **Icons** come from `@phosphor-icons/react`, not Lucide.
- **No enums or namespaces** — `erasableSyntaxOnly` is on.

## Routing

Declarative mode: `<BrowserRouter>` in `src/main.tsx`, one `<Routes>` tree in `src/App.tsx`. Paths
are constants in `src/app.constants.ts` — always reference the constant, never a string literal.

Auth gating uses wrapper elements, not loaders: a route inside the protected group renders
`<Navigate to={LOGIN_PAGE} />` when there is no session, and guest-only routes redirect the
opposite way.

| Path | Page | Access |
| --- | --- | --- |
| `/` | `LandingPage` | guest |
| `/login` | `LoginPage` | guest |
| `/register` | `RegisterPage` | guest |
| `/forgot-password` | `ForgotPasswordPage` | guest |
| `/reset-password` | `ResetPasswordPage` | public |
| `/verify-email` | `VerifyEmailPage` | public |
| `/email-redirect` | `EmailRedirectPage` | guest |
| `/confirm-login` | `ConfirmLoginPage` (2FA) | guest |
| `/r/:slug` | `PublicResumePage` | **public** |
| `/dashboard` | `DashboardPage` | protected |
| `/jobs` | `JobsPage` | protected |
| `/jobs/:jobId` | `JobDetailPage` | protected |
| `/sessions` | `SessionsPage` | protected |
| `/sessions/:sessionId` | `SessionDetailPage` | protected |
| `/interviews/:interviewId` | `InterviewPage` | protected |
| `/notes` | `NotesPage` | protected |
| `/schedule` | `SchedulePage` | protected |
| `/profile` | `JobProfilePage` | protected |
| `/resumes` | `ResumesPage` | protected |
| `/resumes/:resumeId` | `ResumeDetailPage` | protected |
| `/resumes/:resumeId/edit` | `ResumeEditorWithPreviewPage` | protected, full-screen (no sidebar) |
| `/settings` | `SettingsPage` | protected |
| `/admin` | `AdminPage` | protected, no sidebar |
| `/*` | `EmptyPage` (404) | — |

Six heavy routes are `React.lazy` + `<Suspense>`. `SidebarLayout` provides the sidebar chrome for
the protected group; the resume editor and admin page opt out.

Settings sub-tabs are URL-driven via `useSearchParams` (`?tab=`), not local state.

## Data layer

### The fetch wrapper

`src/lib/api-client.ts` is the **only** place `fetch` is called.

- `API_PREFIX` is derived as `${VITE_API_URL}/api/v1`.
- `request<T>()` sets a 60 s `AbortController` timeout (per-call overridable), sends
  `credentials: "include"`, and unwraps the API's `{ statusCode, message, data }` envelope,
  returning `body.data`.
- Non-OK responses throw `ApiError(statusCode, message, errors?)`. A **401 hard-redirects to
  `/login`** via `location.href`.
- Helpers: `api.get` / `post` / `put` / `patch` / `delete` / `upload(path, FormData)`.
- `streamPost<T>(path, data, signal)` returns an `AsyncGenerator` that reads an SSE body manually
  (`getReader` + `TextDecoder`, buffering on `\n\n`). Used by the live interview and the notes
  "learn more" dialog.

Domain modules in `src/api/<domain>/index.ts` are thin typed hooks over those helpers.

### Query client and keys

The `QueryClient` is exported as **`apiClient`** from `src/api/index.ts` and supplied as the
provider client in `main.tsx`. Defaults: `staleTime` 2 min, `gcTime` 5 min, `retry` 1, refetch on
window focus and reconnect; mutations do not retry.

- Every query and mutation cache error is surfaced as a `sonner` toast automatically.
- Mutation **invalidation is declarative**: set `meta.invalidates` (or `meta.removes`) to a query
  key, a function of the variables, or an array, and the `MutationCache` handles it. Do not call
  `invalidateQueries` by hand in components.
- All cache keys are registered centrally in the `queryKeys` object in `src/api/index.ts` — add new
  keys there rather than inlining strings.

## Local state

Seven persisted Zustand stores in `src/store/`. Most use `skipHydration: true`, because
`useLocalDataOnLogin` drives hydration explicitly.

| Store | localStorage key | Holds |
| --- | --- | --- |
| `appStore` | `app-store` | Avatar variant, page header, default AI provider, current `userId` tag |
| `themeStore` | `khichuri-theme` | Mode, preset variables, radius, user presets, import/export |
| `resumeStore` | `resume-store` | Per-template section enable/order, skill groups |
| `scheduleStore` | `schedule-ui` | Calendar anchor, view mode, event-source visibility, drawer state |
| `useJobsStore` | `job-filters-sort` | Jobs list search, status, sort, date filters |
| `interviewStore` | `interview-panes` | Live-interview pane visibility |
| `resendStore` | `email-resend-timestamp` | Email-resend cooldown timestamp |

### Per-user local data — read this before adding local state

`src/hooks/useLocalDataOnLogin.ts` prevents data leaking between accounts on a shared browser. On
login it:

1. reads the outgoing user's `userId` tag from `app-store`,
2. clears the **entire** query cache,
3. archives the outgoing user's user-scoped localStorage keys into IndexedDB,
4. swaps in the incoming user's archive with `persist` writes muted (so nothing is flushed
   mid-swap),
5. resets and rehydrates the stores, then stamps the new `userId`.

It is cancellable because admin impersonation can rotate the session cookie mid-flight, and
`src/App.tsx` blocks the entire tree while a swap is in progress.

**Consequence:** any new persisted store that holds user data must be added to the archive list in
that hook, or it will survive a logout/login as the previous user's data.

## IndexedDB

Two databases via `idb`:

- **`interview-khichuri-db`** (`src/lib/indexdb.ts`) — ATS score cache, standalone review cache,
  live-interview drafts and archives. `src/lib/interviewStorage.ts` is the typed facade for the
  interview stores.
- **`khichuri-localstorage-archive`** (`src/lib/storageArchive.ts`) — the per-user localStorage
  archive described above.

`src/api/resumes/idb.ts` bridges IndexedDB into React Query: `useScoreResume` and
`useReviewResumeStandalone` write the server result into IDB (120 s timeout) and then seed the
cache, so a revisit renders instantly with no network call. If IDB is unavailable the errors are
swallowed and the server response is still returned.

## Theming

- Tailwind v4, CSS-first — **no `tailwind.config.js`**. `src/index.css` is the only entry.
- Dark mode is a custom variant, not a media query: `@custom-variant dark (&:is(.dark *))`.
- All colours are `oklch()`. The stock shadcn scale is present plus custom **signal** tokens
  (`--signal-success`, `--signal-warning`, `--signal-danger`) used for AI-suggestion diffs and
  status, and a full `--sidebar-*` set.
- The entire radius scale derives from one token: `--radius`, with `--radius-sm` … `--radius-4xl`
  computed from it.
- Fonts: `html` is globally monospace (`--font-mono: JetBrains Mono`, `--font-heading: Geist Mono`).
  `src/fonts.css` lazily loads 15 `@fontsource` families for resume rendering.
- `src/lib/theme/theme-preset.ts` defines 23 presets — 7 bases (neutral, stone, mauve, olive, mist,
  taupe, amber) × 16 accents.
- `theme-inject.ts` appends a `<style id="khichuri-theme-override">` **after** `index.css` and runs
  synchronously at import time, so there is no flash of unstyled theme. `themeStore` subscribes to
  its own state to keep the DOM in sync.

## Auth

`src/lib/auth/auth-client.ts` creates a single `better-auth` client pointed at `VITE_API_URL` with
four plugins:

- `adminClient()` — user management and impersonation (exposed as `authAdmin`).
- `passkeyClient()` — WebAuthn passkeys.
- `twoFactorClient()` — TOTP, with an `onTwoFactorRedirect` to `/confirm-login`.
- `lastLoginMethodClient()` — powers the "continue as …" hint on the login screen.

Sign-in methods: passkey (auto-fills via conditional mediation, with a manual fallback button),
email + password with a `zxcvbn` strength meter, and OAuth for **Google, GitHub, and GitLab**.

The **QR code is TOTP, not a passkey** — it appears only during 2FA enrolment in
`src/components/settings/security/twofactor/QRCodeVerify.tsx`, alongside the backup codes. Passkey
enrolment and management live in `src/components/settings/security/passkey/`.

Also here: linked accounts, session management (with `ua-parser-js` for readable device names),
password change, account deletion, and a global `ImpersonationIndicator` for admin impersonation.

Two helpers make call sites cleaner: `oauthLogin(provider)` / `linkSocial(provider, opts)`, and
`unwrapBetterAuth(promise)`, which throws `response.error.message` instead of making every caller
branch on `{ data, error }`.

## AI features

| Feature | Where | Notes |
| --- | --- | --- |
| BYOK keys | `src/components/keys/`, `src/api/keys/` | Six providers: google, openai, groq, openrouter, mistral, cerebras |
| AI dialog | `src/components/common/ai/` | Shared prompt/confirm flow; skippable per user |
| ATS score | `src/components/resume/ats/` | 4 categories, cached in IndexedDB |
| Standalone review | `src/components/resume/ats/` | 4 categories, cached in IndexedDB |
| Resume suggestions | `src/components/resume/job-profile/preview/` | Word-level accept/reject diff via `diff` |
| Live follow-ups | `src/components/interview/live/LiveInterview.tsx` | SSE via `streamPost` |
| Notes "learn more" | `src/components/notes/question/` | SSE via `streamPost` |

**Speech** has two engines, selectable per interview (`auto` / `google` / `browser`): the browser's
`speechSynthesis`, or Google TTS through the API. The talking avatar maps audio to 7 viseme mouth
shapes (`rest, aa, ee, oh, mbp, th, fv`).

**Two PDF systems** share one set of resume template components: `PDFAdapter.tsx` provides a render
mode context so the same templates render in the browser **or** through `@react-pdf/renderer`, with
`registerPdfFonts()` inlining 15 woff2 files so PDFs render offline.

Search (`src/lib/search.ts`) wraps MiniSearch with per-field boosts and two presets; indexes are
built in-browser from lists already fetched by React Query.

## Adding UI components

```bash
npx shadcn@latest add <component>
```

Components land in `src/components/ui/`. Import them with the `@` alias:

```tsx
import { Button } from "@/components/ui/button";
```

This project is configured for **Base UI**, not Radix (`components.json` → `"style": "base-mira"`),
so new primitives will import from `@base-ui/react`. Icons are Phosphor.

`src/components/ui/` is **excluded from Biome** in `biome.jsonc` — treat it as generated code and
edit with care.

## Linting and formatting

- **Biome 2** handles both linting and formatting, via the shared `ultracite` preset set
  (`core`, `react`, `tanstack`, `vitest`). Use `npm run check` to verify and `npm run fix` to
  autofix.
- Biome skips `src/components/ui/`, `**/*.json`, `**/*.config.ts`, and `**/*.mjs`.
- Naming is enforced: `useNamingConvention` is an error with `strictCase: false`, so both
  `PascalCase` component files and `SCREAMING_CASE` constants pass.
- **Prettier is editor-only.** No npm script calls it. `prettier.config.mjs` extends
  `ultracite/prettier` and adds `prettier-plugin-tailwindcss` for class sorting; `.vscode` wires it
  up as the default formatter with format-on-save.

## Testing

There is **no test runner configured** — no Vitest/Jest/Playwright dependency and no `test` script.
`biome.jsonc` extends `ultracite/biome/vitest`, but that is inherited preset boilerplate.

Verify changes with:

```bash
npm run typecheck   # tsc --noEmit
npm run check       # ultracite check
npm run build       # tsc -b && vite build
```

`.rhf-test/` is a scratch harness, not part of the build: it bundles a single entry as an ES library
to `/tmp/opencode` in order to reproduce a `react-hook-form` dirty-tracking bug in isolation. It is
not referenced by any script or tsconfig.

# interview-khichuri-web testing

## Running

- `npm run test` — all unit tests, once.
- `npm run test:watch` — watch mode.
- `npm run test:coverage` — unit tests + v8 coverage with the global gate
  (85% lines/statements/functions, 80% branches). The gate is red until the
  suites cover enough code; it is intentional, not a failure to paper over.
- `npx vitest run <path>` — a single file or suite while iterating.

## Writing tests

- Query user-visible output only: `getByRole`, `getByLabel`, `getByText`,
  `findBy*`/`waitFor` for async. No class/id selectors, no snapshots.
- Render through the shared helper `render` (`src/test/render.tsx`) — it wires
  up MemoryRouter + a fresh react-query client + the error/suspense boundary
  and returns `user` (`userEvent`), so tests can drive clicks alongside RTL
  queries.
- Mock network via MSW: base handlers live in `src/test/msw/handlers.ts`;
  override per test with `server.use(...)` for error states and for asserting
  request payloads. `onUnhandledRequest` is `"error"` — an unforeseen call
  fails the test, on purpose.
- No mock of our own hooks/components. Third-party libs (e.g. `sonner`) may be
  stubbed or mounted for real assertions.
- Every test asserts something. No assertion-free `it`s.
- `vitest` `globals` are off: import `describe`/`it`/`expect` from `vitest`.
  DOM is cleaned up by `src/test/setup.ts` (it calls RTL `cleanup()` itself) —
  do not rely on RTL auto-cleanup.
- Business-critical code gets four states covered: loading, empty, error,
  success — plus validation for forms.
- Coverage exclusions (tests, `src/test/**`, `src/main.tsx`,
  `src/components/ui/**`) are part of the gate contract. Do not widen the
  exclude list, lower thresholds, or add `/* v8 ignore */` without asking.
- No real OpenAI/Gemini calls anywhere, ever.

Priority of coverage work follows `docs/test-roadmap.md` Step 1: hooks + utils,
forms + validation, query components + error states, mock-interview runner/ATS
review, then presentational.
# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/` with the FastMCP entry at `src/index.ts`; tools in `src/tools/` (ad requirements parsing, research, copy generation, image generation, mixed media); UI helpers in `src/utils/` (ad-requirements-ui, ad-research-ui, ad-copy-ui, ad-images-ui, mixed-media-ui).
- Tests split into `tests/unit/` and `tests/properties/`; build artifacts land in `dist/`.
- `docker-compose.yaml` provisions local Postgres; optional for the demo server.

## Build, Test, and Development Commands
- `npm run dev` — watch + run the server on port 8080.
- `npm run build` then `npm start` — emit to `dist/` and run compiled server.
- `npm run typecheck` — TypeScript strict checks with no emit.
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Vitest suite, watch mode, coverage.
- `npm run mcp:dev` — FastMCP dev mode on `src/index.ts`; `npm run mcp:inspect` — open MCP Inspector for live tool testing.

## Coding Style & Naming Conventions
- TypeScript, ESM, strict mode; prefer `const`, typed params, explicit returns.
- Single Responsibility: one tool per file, one concern per function; isolate validation, UI composition, and transport into helpers.
- Two-space indentation and named exports; file names are kebab-case (`ui-factory.ts`).
- UIResources use semantic URIs (`ui://resource-type/id`) and inline CSS, matching existing tools.
- No formatter config; mirror existing single quotes in imports and concise double-quoted metadata strings.

## Testing Guidelines
- Unit and property tests use Vitest and fast-check; keep new tests colocated under `tests/unit` or `tests/properties`.
- Prefer property tests for schema validation and UI metadata; unit tests cover tool behavior and SRP boundaries (e.g., helpers stay pure, handlers stay thin).
- Run `npm test` before commits; ensure coverage does not regress when adding logic-heavy tools.

## Commit & Pull Request Guidelines
- Follow the Conventional Commits pattern seen in history: `feat(scope): ...`, `chore: ...`, etc.
- PRs should include: a brief summary, linked issue (if any), screenshots or console output for UI changes, and a checklist of commands run (tests, typecheck, inspector/dev where relevant).
- Keep diffs small and focused; note any impacts to HTTP endpoints (`/mcp`, `/sse`, `/ready`) or port 8080 usage; group changes so each commit addresses a single responsibility.

## Security & Configuration Tips
- Do not commit secrets or environment values; Postgres creds in `docker-compose.yaml` are for local use only.
- When exposing the server, verify CORS and transport settings; default endpoints are `http://localhost:8080/mcp` and `/sse`.

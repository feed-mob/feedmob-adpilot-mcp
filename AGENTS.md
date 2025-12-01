# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/` with the FastMCP entry at `src/index.ts`
- Tools in `src/tools/`: parseAdRequirements, conductAdResearch, generateAdCopy, generateAdImages, generateMixedMedia, getCampaign
- Agent services in `src/services/`: ad-requirements-agent, ad-research-agent, ad-copy-agent, ad-images-agent, mixed-media-agent, campaign-management-agent, campaign, database
- UI factories in `src/utils/`: ad-requirements-ui, ad-research-ui, ad-copy-ui, ad-images-ui, mixed-media-ui, campaign-ui
- Schemas in `src/schemas/`: campaign-params, ad-research, ad-copy, ad-images, mixed-media, campaign, health
- Claude Agent skills in `src/plugins/`
- Tests split into `tests/unit/` and `tests/properties/`
- Client UI in `client-ui/` (Next.js)
- Build artifacts in `dist/`

## Build, Test, and Development Commands

```bash
npm run dev              # Watch + run server on port 8080
npm run build            # Compile TypeScript to dist/
npm start                # Run production build
npm run typecheck        # TypeScript strict checks
npm test                 # Run Vitest suite
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run mcp:dev          # FastMCP dev mode
npm run mcp:inspect      # MCP Inspector for live testing
```

## Database Commands

```bash
docker-compose up -d postgres    # Start PostgreSQL
docker-compose down              # Stop services
```

## Coding Style & Naming Conventions

- TypeScript, ESM, strict mode
- Prefer `const`, typed params, explicit returns
- Single Responsibility: one tool per file, one concern per function
- Two-space indentation, named exports
- File names: kebab-case (`ad-requirements-ui.ts`)
- UIResources: semantic URIs (`ui://resource-type/id`) with inline CSS
- Design system CSS variables for light/dark mode support

## Testing Guidelines

- Unit and property tests use Vitest and fast-check
- Tests in `tests/unit/` and `tests/properties/`
- Property tests for schema validation and UI metadata
- Unit tests for tool behavior and SRP boundaries
- Run `npm test` before commits

## Commit & Pull Request Guidelines

- Conventional Commits: `feat(scope): ...`, `chore: ...`, etc.
- PRs include: summary, linked issue, screenshots for UI changes
- Keep diffs small and focused
- Note impacts to HTTP endpoints (`/mcp`, `/sse`, `/health`)

## Security & Configuration

- Never commit secrets or `.env` files
- Use `.env.example` as template
- PostgreSQL creds in `docker-compose.yaml` are for local use only
- Verify CORS and transport settings when exposing server

## Server Endpoints

- MCP: `http://localhost:8080/mcp`
- SSE: `http://localhost:8080/sse`
- Health: `http://localhost:8080/health`

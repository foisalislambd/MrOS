# Contributing to MrOS

Thanks for your interest in contributing. This guide keeps changes predictable for a Bun + TypeScript monorepo.

## Quick start

1. Fork the repo and clone your fork.
2. Install Bun (`>= 1.2`).
3. Install dependencies:

```bash
bun install
cp .env.example .env
```

4. Create a branch:

```bash
git checkout -b feat/your-change
```

5. Make your change, then verify:

```bash
bun run typecheck
bun run lint
bun run build
```

## Project layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js demo UI |
| `apps/api` | Hono API on Bun |
| `apps/telegram-bot` | Telegram control channel |
| `packages/db` | Drizzle + PostgreSQL |
| `packages/shared` | Shared types/constants |
| `packages/typescript-config` | Shared TS configs |

## Development norms

- Prefer small, focused PRs over large mixed changes.
- Match existing TypeScript style and file structure.
- Do not commit secrets, `.env`, or personal tokens.
- Keep shared types in `packages/shared` when more than one app needs them.
- Database schema changes belong in `packages/db` with a clear migration path.

## Commit messages

Use short, imperative messages:

- `feat: add project create endpoint`
- `fix: resolve telegram auth guard`
- `docs: expand local setup steps`
- `chore: bump drizzle`

## Pull requests

- Fill out the PR template.
- Link related issues.
- Include screenshots for UI changes.
- Ensure CI is green before asking for review.

## Issues

- Bug reports: reproduce steps + expected vs actual behavior.
- Feature requests: problem statement first, then proposed approach.
- Security issues: follow [SECURITY.md](./SECURITY.md). Do not open a public issue for vulnerabilities.

## Code of conduct

Participation is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md).

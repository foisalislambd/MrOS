# MrOS

[![CI](https://github.com/foisalislambd/MrOS/actions/workflows/ci.yml/badge.svg)](https://github.com/foisalislambd/MrOS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Open-source vibe coding platform — TypeScript monorepo with PostgreSQL, web UI, API, and Telegram control.

## Stack

- **Runtime / monorepo:** Bun workspaces + Turborepo
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL + Drizzle ORM
- **Web:** Next.js (`apps/web`)
- **API:** Hono on Bun (`apps/api`)
- **Telegram:** grammY (`apps/telegram-bot`)

## Structure

```text
apps/
  web/            # Demo UI (Next.js)
  api/            # Backend API (Bun + Hono)
  telegram-bot/   # Telegram control channel
packages/
  db/             # Drizzle schema + DB client
  shared/         # Shared types & constants
  typescript-config/
```

## Setup

Requirements:

- [Bun](https://bun.sh) `>= 1.2`
- PostgreSQL (for DB features)

```bash
bun install
cp .env.example .env
```

Start everything:

```bash
bun run dev
```

Or individually:

```bash
bun --filter @mros/web dev
bun --filter @mros/api dev
bun --filter @mros/telegram-bot dev
```

## Database

```bash
bun run db:generate
bun run db:migrate
bun run db:studio
```

Requires `DATABASE_URL` in `.env`.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps in development |
| `bun run build` | Build the workspace |
| `bun run typecheck` | TypeScript checks |
| `bun run lint` | Lint packages/apps |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Code of Conduct](./CODE_OF_CONDUCT.md).

- Bug reports / features: use GitHub Issue templates
- Security: see [SECURITY.md](./SECURITY.md)
- Help: see [SUPPORT.md](./SUPPORT.md)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT © [Foisal Islam](https://github.com/foisalislambd) — see [LICENSE](./LICENSE).

## Notes

- `apps/web` is the current demo UI.
- Telegram bot stays idle until `TELEGRAM_BOT_TOKEN` is set.

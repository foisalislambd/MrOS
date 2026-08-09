# @mros/telegram-bot

Telegram control channel for MrOS — **full demo UI** on Bot API Rich Messages.

## Features (demo)

- `/start` welcome + reply keyboard + inline session list
- Sessions / projects with UUID create flow
- Free-text prompts → demo agent reply
- `sendRichMessageDraft` streaming (`<tg-thinking>`, tool steps) → final `sendRichMessage`
- Inline mode: `@bot query` searches sessions
- In-memory per-user store (seeded like the web demo)

## Run

Root `.env` (repo root) is loaded automatically — Turbo runs the bot from `apps/telegram-bot`, so the package also falls back to `../../.env`.

```bash
# repo root .env
TELEGRAM_BOT_TOKEN=123:ABC
# optional allowlist
TELEGRAM_ALLOWED_USER_IDS=123456789

bun --filter @mros/telegram-bot dev
```

Enable **Inline Mode** in [@BotFather](https://t.me/BotFather) for session search.

## Layout

```text
src/
  index.ts           entry
  bot.ts             Bot factory
  config.ts
  demo/              in-memory store + seed data
  keyboards/         reply + inline keyboards
  format/            rich markdown copy
  rich/              sendRichMessage + agent demo stream
  handlers/          commands, callbacks, inline queries
  middleware/        allowlist
```

When the API is ready, replace `demo/store.ts` calls with HTTP — keep keyboards and rich reply UX.

# @mros/telegram-bot

<p align="center">
  <img src="../../assets/logo.png" alt="MrOS" width="96" />
</p>

Telegram control channel for MrOS — human-friendly demo UI on Bot API Rich Messages.

## What it feels like

- **/start** → one home card: greeting, recent chats, clear buttons
- **New chat** → quick ideas (finance, landing, auth…) or type your own
- **New project** → create now or name it (force-reply)
- **Try demo** → streaming thinking + tools + polished final reply
- Navigation edits in place when possible (less chat spam)
- Short button labels, warm copy, typing indicators

## Run

Root `.env` is loaded automatically (package also falls back to `../../.env`).

```bash
TELEGRAM_BOT_TOKEN=123:ABC
TELEGRAM_ALLOWED_USER_IDS=123456789

bun --filter @mros/telegram-bot dev
```

Enable **Inline Mode** in [@BotFather](https://t.me/BotFather) for chat search.

## Layout

```text
src/
  index.ts           entry + bot menu copy
  bot.ts             Bot factory
  config.ts          root .env loader
  demo/              in-memory store + seed data
  keyboards/         reply + inline (2-per-row)
  format/            human copy + safe markdown
  rich/              sendRichMessage + agent demo stream
  handlers/          commands, callbacks, inline queries
  middleware/        allowlist
```

When the API is ready, replace `demo/store.ts` calls with HTTP — keep keyboards and rich reply UX.

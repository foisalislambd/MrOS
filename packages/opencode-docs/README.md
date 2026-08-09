# OpenCode backend (v1.18.15) — vendored into MrOS `packages/`

Source: [anomalyco/opencode](https://github.com/anomalyco/opencode) tag **`v1.18.15`**.

TUI / desktop / console / upstream web UI were **not** copied. MrOS keeps `apps/web` + `apps/telegram-bot`.

## Packages (directly under `packages/`)

| Package | Role |
|---|---|
| `@opencode-ai/schema` | Shared Effect schemas |
| `@opencode-ai/protocol` | HTTP API contract |
| `@opencode-ai/llm` | LLM providers / streaming |
| `@opencode-ai/core` | Sessions, projects, tools, agent runner, SQLite |
| `@opencode-ai/server` | Effect HTTP handlers |
| `@opencode-ai/client` | Typed API clients |
| `@opencode-ai/sdk-next` | In-process embed (`OpenCode.create()`) |
| `@opencode-ai/plugin` | Plugin / tool surface |
| `@opencode-ai/codemode` | Code-mode tools |
| `@opencode-ai/sdk` | Legacy SDK |
| `@opencode-ai/effect-drizzle-sqlite` | DB adapter |
| `@opencode-ai/effect-sqlite-node` | Node SQLite |
| `@opencode-ai/http-recorder` | Test VCR |
| `@opencode-ai/script` | Script helpers |

Docs/specs in this folder + `packages/specs` where present.

## Use from MrOS

```ts
import { OpenCode } from "@opencode-ai/sdk-next"
```

Wire through `apps/api` (or `@mros/agent`) — web/telegram stay as clients.

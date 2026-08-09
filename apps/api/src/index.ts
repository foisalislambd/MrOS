import { Hono } from "hono";
import { APP_NAME } from "@mros/shared";

const app = new Hono();
const port = Number(process.env.API_PORT ?? 4000);

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "api",
    app: APP_NAME,
  }),
);

app.get("/", (c) =>
  c.json({
    message: `${APP_NAME} API is ready`,
  }),
);

console.log(`[api] ${APP_NAME} listening on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

import { Hono } from "hono";
import { api } from "./api";

export interface Env {
  KV_LINKS: KVNamespace;
}

const app = new Hono();

app.route("/api", api);

export default app;

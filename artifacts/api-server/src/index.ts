import "dotenv/config";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { initDb } from "@workspace/db";

const rawPort = process.env["PORT"] || "3000";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

await initDb();

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
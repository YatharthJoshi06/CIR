import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { pool } from "@workspace/db";

const app: Express = express();

app.use(pinoHttp({
  logger,
  serializers: {
    req(req: Request) {
      return { id: (req as any).id, method: req.method, url: req.url?.split("?")[0] };
    },
    res(res: Response) {
      return { statusCode: res.statusCode };
    },
  },
}));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Root health check & favicon for deployment monitors / browsers
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "CIR API Server is running" });
});
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// Database connectivity & table health check
app.get(["/db-check", "/api/db-check"], async (_req, res) => {
  try {
    const timeRes = await pool.query("SELECT NOW() as now");
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({
      status: "connected",
      now: timeRes.rows[0]?.now,
      tables: tablesRes.rows.map((r: any) => r.table_name),
    });
  } catch (err: any) {
    res.status(500).json({
      status: "db_error",
      message: err.message,
      code: err.code,
    });
  }
});

// Support both /api/* and root /* to prevent 404s from URL prefix mismatches
app.use("/api", router);
app.use(router);

export default app;
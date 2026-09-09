import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

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

// Support both /api/* and root /* to prevent 404s from URL prefix mismatches
app.use("/api", router);
app.use(router);

export default app;
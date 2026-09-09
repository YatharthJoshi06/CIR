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

// Root health check for deployment monitors
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "CIR API Server is running" });
});
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

export default app;
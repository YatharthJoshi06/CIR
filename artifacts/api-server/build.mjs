import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: true,
  external: [
    // native addons
    "pg-native",
    "fsevents",
    // pino uses worker threads (worker.js) internally — must NOT be bundled
    "pino",
    "pino-http",
    "pino-pretty",
    "pino-abstract-transport",
    "sonic-boom",
    "thread-stream",
    // workspace packages resolved at runtime via node_modules symlinks
    "@workspace/db",
    "@workspace/api-zod",
  ],
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
    `.trim(),
  },
});

console.log("Build complete → dist/index.mjs");
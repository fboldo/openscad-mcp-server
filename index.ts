import { bootstrap, type BootstrapMethod } from "./src/boostrap";
import { createServer } from "./src/server";

/**
 * Explicit `--http` / `--stdio` flags win. Without a flag, the published build
 * (NODE_ENV=production) defaults to stdio and local development defaults to HTTP.
 */
const resolveBootstrapMethod = (argv: string[]): BootstrapMethod => {
  if (argv.includes("--http")) return "http";
  if (argv.includes("--stdio")) return "stdio";
  return process.env.NODE_ENV === "production" ? "stdio" : "http";
};

await bootstrap(resolveBootstrapMethod(process.argv), createServer);

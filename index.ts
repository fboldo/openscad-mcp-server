import { bootstrap } from "./src/boostrap";
import { createServer } from "./src/server";

const isStdio =
  process.argv.includes("--stdio") || process.env.NODE_ENV === "production";

await bootstrap(isStdio ? "stdio" : "http", createServer);

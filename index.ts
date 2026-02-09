import { bootstrap } from "./src/boostrap";
import { createServer } from "./src/server";

await bootstrap(
  process.argv.includes("--stdio") ? "stdio" : "http",
  createServer,
);

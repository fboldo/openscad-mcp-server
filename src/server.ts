import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRenderScadPngTool } from "./app/tools/render-scad-png/register";

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "OpenSCAD MCP Server",
    version: "1.0.0",
  });

  registerRenderScadPngTool(server);

  return server;
}

export type ServerFactory = () => McpServer;

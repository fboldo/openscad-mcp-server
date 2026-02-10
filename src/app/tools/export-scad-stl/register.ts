import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EmbeddedResourceSchema } from "@modelcontextprotocol/sdk/types.js";
import { exportScadStlTool } from "./tool";
import { ExportScadStlToolInputSchema } from "./type";

export const registerExportScadStlTool = (server: McpServer) => {
  server.registerTool(
    "export_scad_stl",
    {
      title: "Export OpenSCAD source to an STL",
      description:
        "Export OpenSCAD (SCAD) source code into an STL and return it as an embedded resource blob.",
      inputSchema: ExportScadStlToolInputSchema,
      outputSchema: EmbeddedResourceSchema,
    },
    exportScadStlTool,
  );
};

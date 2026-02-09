import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageContentSchema } from "@modelcontextprotocol/sdk/types.js";
import { renderScadPngTool } from "./tool";
import { RenderScadPngToolInputSchema } from "./type";

export const registerRenderScadPngTool = (server: McpServer) => {
  server.registerTool(
    "render_scad_png",
    {
      title: "Render OpenSCAD source to a PNG image",
      description:
        "Render OpenSCAD (SCAD) source code into a PNG preview image.Provide the SCAD text in `scadCode` and optionally set `width`/`height` (pixels). Returns an MCP ImageContent payload containing the rendered PNG (base64-encoded).",
      inputSchema: RenderScadPngToolInputSchema,
      outputSchema: ImageContentSchema,
    },
    renderScadPngTool,
  );
};

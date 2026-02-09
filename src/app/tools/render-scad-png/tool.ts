import { getOpenSCADInstance } from "@/infra/openscad";
import { createPngBase64FromStl } from "@/infra/stl-to-png";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { RenderScadPngToolInput, RenderScadPngToolOutput } from "./type";

export const renderScadPngTool = async ({
  scadCode,
  width,
  height,
}: RenderScadPngToolInput): Promise<CallToolResult> => {
  const openscad = await getOpenSCADInstance();
  const stl = await openscad.renderToStl(scadCode);
  const base64Png = await createPngBase64FromStl(stl, width, height);
  const image: RenderScadPngToolOutput = {
    type: "image",
    data: base64Png,
    mimeType: "image/png",
  };

  return {
    content: [image],
    structuredContent: image,
  };
};

import type { ImageContentSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export const RenderScadPngToolInputSchema = z.object({
  scadCode: z.string().describe("The OpenSCAD code to render"),
  width: z
    .number()
    .optional()
    .default(800)
    .describe("The width of the output image in pixels (default: 800)"),
  height: z
    .number()
    .optional()
    .default(600)
    .describe("The height of the output image in pixels (default: 600)"),
});

export type RenderScadPngToolInput = z.infer<
  typeof RenderScadPngToolInputSchema
>;

export type RenderScadPngToolOutput = z.infer<typeof ImageContentSchema>;

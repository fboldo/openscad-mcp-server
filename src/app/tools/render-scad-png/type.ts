import type { ImageContentSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const RenderScadPngToolInputSchema = z.object({
  scadCode: z.string().describe('The OpenSCAD code to render'),
  width: z
    .number()
    .optional()
    .default(800)
    .describe('The width of the output image in pixels (default: 800)'),
  height: z
    .number()
    .optional()
    .default(600)
    .describe('The height of the output image in pixels (default: 600)'),
  cameraPosition: z
    .tuple([z.number(), z.number(), z.number()])
    .optional()
    .describe('Camera position as [x,y,z]. Example: [0, -25, 20]'),
});

export type RenderScadPngToolInput = z.infer<typeof RenderScadPngToolInputSchema>;

export type RenderScadPngToolOutput = z.infer<typeof ImageContentSchema>;

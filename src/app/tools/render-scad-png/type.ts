import type { ImageContentSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const RenderScadPngCamera = z.object({
  x: z.number().describe('Camera X position').default(0),
  y: z.number().describe('Camera Y position').default(-25),
  z: z.number().describe('Camera Z position').default(20),
});

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
  cameraPosition: RenderScadPngCamera.optional().describe(
    'Camera position as { x,y,z }. Example: { x: 0, y: -25, z: 20 }'
  ),
});

export type RenderScadPngToolInput = z.infer<typeof RenderScadPngToolInputSchema>;

export type RenderScadPngToolOutput = z.infer<typeof ImageContentSchema>;

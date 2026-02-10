import { ImageContentSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const RenderScadPngCamera = z.object({
  x: z.number().describe('Camera X position').default(0),
  y: z.number().describe('Camera Y position').default(-25),
  z: z.number().describe('Camera Z position').default(20),
});

export const RenderScadPngCameraPreset = z
  .enum(['isometric', 'front', 'back', 'left', 'right', 'top', 'bottom'])
  .describe('Named camera preset used when `cameraPosition` is not provided');

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
  cameraPreset: RenderScadPngCameraPreset.optional().describe(
    'A named camera preset used when `cameraPosition` is not provided'
  ),
  cameraPosition: RenderScadPngCamera.optional().describe(
    'Camera position as { x,y,z }. Example: { x: 0, y: -25, z: 20 }'
  ),
});

export type RenderScadPngToolInput = z.infer<typeof RenderScadPngToolInputSchema>;

export const RenderScadPngToolOutputSchema = z.object({
  image: ImageContentSchema,
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    cameraPreset: RenderScadPngCameraPreset.optional(),
    cameraPosition: RenderScadPngCamera.optional(),
    timingsMs: z.object({
      openscadToStl: z.number(),
      stlToPng: z.number(),
      total: z.number(),
    }),
  }),
});

export type RenderScadPngToolOutput = z.infer<typeof RenderScadPngToolOutputSchema>;

import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { asTool } from '@/app/tool-utils';
import { renderScadPngTool } from '../src/app/tools/render-scad-png/tool';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const parsePngIhdr = (png: Buffer): { width: number; height: number } => {
  if (png.length < 24) {
    throw new Error('PNG too small');
  }
  if (!png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('Invalid PNG signature');
  }
  const chunkType = png.subarray(12, 16).toString('ascii');
  if (chunkType !== 'IHDR') {
    throw new Error(`First chunk is not IHDR (got ${chunkType})`);
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  return { width, height };
};

test(
  'render_scad_png converts SCAD fixture to PNG',
  async () => {
    const fixturePath = path.join(import.meta.dir, 'fixtures', 'cube.scad');
    const scadCode = await readFile(fixturePath, 'utf8');

    const width = 256;
    const height = 192;

    const execute = asTool(renderScadPngTool);

    const result = await execute({
      scadCode,
      width,
      height,
      cameraPreset: 'isometric',
    });

    const structured = 'structuredContent' in result ? result.structuredContent : null;

    expect(structured?.type).toBe('image');
    expect(structured?.mimeType).toBe('image/png');
    expect(structured?.data.length).toBeGreaterThan(100);

    const png = Buffer.from(structured?.data ?? '', 'base64');
    expect(png.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);

    const ihdr = parsePngIhdr(png);
    expect(ihdr.width).toBe(width);
    expect(ihdr.height).toBe(height);
  },
  { timeout: 30_000 }
);

test(
  'render_scad_png accepts explicit cameraPosition object',
  async () => {
    const fixturePath = path.join(import.meta.dir, 'fixtures', 'cube.scad');
    const scadCode = await readFile(fixturePath, 'utf8');

    const execute = asTool(renderScadPngTool);

    const result = await execute({
      scadCode,
      width: 256,
      height: 192,
      cameraPosition: { x: 10, y: -22, z: 18 },
    });

    const structured = 'structuredContent' in result ? result.structuredContent : null;

    expect(structured?.type).toBe('image');
    expect(structured?.mimeType).toBe('image/png');
    expect(structured?.data.length).toBeGreaterThan(100);
  },
  { timeout: 30_000 }
);

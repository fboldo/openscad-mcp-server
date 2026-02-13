import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { asTool } from '@/app/tool-utils';
import { exportScadStlTool } from '../src/app/tools/export-scad-stl/tool';

test(
  'export_scad_stl converts SCAD fixture to an embedded STL resource',
  async () => {
    const fixturePath = path.join(import.meta.dir, 'fixtures', 'cube.scad');
    const scadCode = await readFile(fixturePath, 'utf8');

    const execute = asTool(exportScadStlTool);
    const result = await execute({
      scadCode,
      filename: 'cube.stl',
    });

    const structured = 'structuredContent' in result ? result.structuredContent : null;
    const blobResult = (structured?.resource as { blob: string })?.blob;

    expect(structured?.type).toBe('resource');
    expect(structured?.resource.mimeType).toBe('model/stl');
    expect(structured?.resource.uri).toBe('file://cube.stl');
    expect(blobResult).not.toBeNull();

    expect(blobResult.length).toBeGreaterThan(100);

    const stlText = Buffer.from(blobResult, 'base64').toString('utf8');

    expect(stlText.startsWith('solid')).toBe(true);
    expect(stlText.includes('facet normal')).toBe(true);
    expect(stlText.includes('endsolid')).toBe(true);
  },
  { timeout: 30_000 }
);

test(
  'export_scad_stl return error when given invalid SCAD code',
  async () => {
    const scadCode = 'invalid scad code';

    const execute = asTool(exportScadStlTool);
    const result = await execute({
      scadCode,
      filename: 'cube.stl',
    });

    const textResult =
      'content' in result &&
      Array.isArray(result.content) &&
      result.content[0] &&
      'text' in result.content[0]
        ? result.content[0]
        : null;

    expect(result?.isError).toBe(true);
    expect(textResult?.text).toBe(
      'Operation failed: ERROR: Parser error: syntax error in file /input.scad, line 1'
    );
  },
  { timeout: 30_000 }
);

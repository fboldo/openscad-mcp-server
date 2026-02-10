import { createSingleBlockResult, type StructuredToolResult } from '@/app/tool-utils';
import { getOpenSCADInstance } from '@/infra/openscad';
import type { ExportScadStlToolInput, ExportScadStlToolOutput } from './type';

export const exportScadStlTool = async ({
  filename = 'model.stl',
  scadCode,
}: ExportScadStlToolInput): Promise<StructuredToolResult<ExportScadStlToolOutput>> => {
  const openscad = await getOpenSCADInstance();
  const stl = await openscad.renderToStl(scadCode);
  const assignedFilename = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  const defaultFilename = `model-${new Date().getTime()}.stl`;

  const outputUri = `file://${assignedFilename ?? defaultFilename}`;
  const blob = Buffer.from(stl, 'utf8').toString('base64');

  const resource: ExportScadStlToolOutput = {
    type: 'resource',
    resource: {
      uri: outputUri,
      mimeType: 'model/stl',
      blob,
    },
  };

  return createSingleBlockResult(resource);
};

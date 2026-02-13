import { executeOpenSCAD } from '@/infra/openscad';
import type { ExportScadStlToolInput, ExportScadStlToolOutput } from './type';

export const exportScadStlTool = async ({
  filename = 'model.stl',
  scadCode,
}: ExportScadStlToolInput): Promise<ExportScadStlToolOutput> => {
  const result = await executeOpenSCAD(async (instance) => {
    const openscad = instance.getInstance();
    openscad.FS.writeFile('input.scad', scadCode);
    openscad.callMain(['input.scad', '-o', 'output.stl', '--backend=manifold']);
    const stlData = openscad.FS.readFile('output.stl');
    return stlData;
  });

  if (!result) {
    throw new Error('Failed to generate STL from OpenSCAD');
  }

  const assignedFilename = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  const defaultFilename = `model-${new Date().getTime()}.stl`;

  const outputUri = `file://${assignedFilename ?? defaultFilename}`;
  const blob = Buffer.from(result as string, 'utf8').toString('base64');

  const resource: ExportScadStlToolOutput = {
    type: 'resource',
    resource: {
      uri: outputUri,
      mimeType: 'model/stl',
      blob,
    },
  };

  return resource;
};

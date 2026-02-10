import { getOpenSCADInstance } from '@/infra/openscad';
import { createPngBase64FromStl } from '@/infra/stl-to-png';
import type { RenderScadPngToolInput, RenderScadPngToolOutput } from './type';

const CAMERA_PRESETS: Record<
  NonNullable<RenderScadPngToolInput['cameraPreset']>,
  [number, number, number]
> = {
  isometric: [0, -25, 20],
  front: [0, -30, 0],
  back: [0, 30, 0],
  left: [-30, 0, 0],
  right: [30, 0, 0],
  top: [0, 0, 30],
  bottom: [0, 0, -30],
};

export const toCameraPositionTupple = (
  cameraPosition: RenderScadPngToolInput['cameraPosition']
): [number, number, number] | undefined => {
  if (!cameraPosition) return undefined;
  const { x, y, z } = cameraPosition;
  return [x, y, z];
};

const resolveCameraPosition = (
  cameraPosition: RenderScadPngToolInput['cameraPosition'],
  cameraPreset: RenderScadPngToolInput['cameraPreset']
): [number, number, number] | undefined => {
  const tuple = toCameraPositionTupple(cameraPosition);
  if (tuple) return tuple;
  if (!cameraPreset) return undefined;
  return CAMERA_PRESETS[cameraPreset];
};

export const renderScadPngTool = async ({
  scadCode,
  width,
  height,
  cameraPreset,
  cameraPosition,
}: RenderScadPngToolInput): Promise<RenderScadPngToolOutput> => {
  const openscad = await getOpenSCADInstance();
  const stl = await openscad.renderToStl(scadCode);
  const base64Png = await createPngBase64FromStl(
    stl,
    width,
    height,
    resolveCameraPosition(cameraPosition, cameraPreset)
  );
  const image: RenderScadPngToolOutput = {
    type: 'image',
    data: base64Png,
    mimeType: 'image/png',
    _meta: {
      width,
      height,
      cameraPreset: cameraPreset ?? null,
      cameraPosition: cameraPosition ?? null,
    },
  };

  return image;
};

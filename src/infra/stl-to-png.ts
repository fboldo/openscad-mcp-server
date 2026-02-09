import { makeEdgeMaterial, stl2png } from "@scalenc/stl-to-png";

export const createPngBase64FromStl = async (
  stl: string,
  width: number,
  height: number,
): Promise<string> => {
  const pngData = stl2png(Buffer.from(stl), {
    edgeMaterials: [makeEdgeMaterial(0.1, 0x287dad)],
    width,
    height,
  });
  return pngData.toString("base64");
};

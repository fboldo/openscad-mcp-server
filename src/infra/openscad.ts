import { createOpenSCAD, type OpenSCADInstance } from "openscad-wasm";

let openscadInstance = null as OpenSCADInstance | null;

export const getOpenSCADInstance = async (): Promise<OpenSCADInstance> => {
  if (!openscadInstance) {
    openscadInstance = await createOpenSCAD();
  }
  return openscadInstance as OpenSCADInstance;
};

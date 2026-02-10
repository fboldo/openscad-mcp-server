import { createOpenSCAD, type OpenSCADInstance } from "openscad-wasm";

export const getOpenSCADInstance = async (): Promise<OpenSCADInstance> => {
  return await createOpenSCAD();
};

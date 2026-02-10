import { createOpenSCAD, type OpenSCADInstance } from 'openscad-wasm';

export const getOpenSCADInstance = async (): Promise<OpenSCADInstance> => {
  const writeStderr = (line: string) => {
    try {
      process.stderr.write(line.endsWith('\n') ? line : `${line}\n`);
    } catch {
      // Fallback (shouldn't happen in Node/Bun)
      console.error(line);
    }
  };

  return await createOpenSCAD({
    print: (text: string) => writeStderr(`[OpenSCAD]: ${text}`),
    printErr: (text: string) => writeStderr(`[OpenSCAD Error]: ${text}`),
  });
};

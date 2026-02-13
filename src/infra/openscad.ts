import { createOpenSCAD, type OpenSCADInstance } from 'openscad-wasm';

export type OpenSCADCallback<T> = (openscad: OpenSCADInstance) => Promise<T>;

/**
 * Executes a callback function with an OpenSCAD instance, capturing any errors and outputs produced during the execution.
 *
 * @param callback - An async function that receives an OpenSCAD instance to perform operations
 * @returns A tuple containing the callback result (or error), an array of errors captured from OpenSCAD's stderr, and a set of outputs captured from OpenSCAD's stdout
 */
export const executeOpenSCAD = async <T>(callback: OpenSCADCallback<T>): Promise<T> => {
  const outputs: string[] = [];
  const instance = await createOpenSCAD({
    noInitialRun: true,
    printErr: (text: string) => {
      outputs.push(text);
    },
    print: (text: string) => {
      outputs.push(text);
    },
  });
  const response = await callback(instance).catch((e) => {
    return e;
  });

  if (response.constructor.name.includes('Error')) {
    const errors = outputs.filter((o) => o.toLowerCase().includes('error:'));
    const errorMessage =
      errors.length > 0
        ? [response.message, ...errors].filter(Boolean).join('\n')
        : response.message;
    throw new Error(errorMessage);
  }

  return response;
};

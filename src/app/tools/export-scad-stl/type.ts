import { EmbeddedResourceSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export const ExportScadStlToolInputSchema = z.object({
  filename: z.string().describe("The name of the output STL file").optional(),
  scadCode: z.string().describe("The OpenSCAD code to render"),
});

export type ExportScadStlToolInput = z.infer<
  typeof ExportScadStlToolInputSchema
>;

export type ExportScadStlToolOutput = z.infer<typeof EmbeddedResourceSchema>;

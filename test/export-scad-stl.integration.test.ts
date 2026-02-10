import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { exportScadStlTool } from "../src/app/tools/export-scad-stl/tool";

test(
  "export_scad_stl converts SCAD fixture to an embedded STL resource",
  async () => {
    const fixturePath = path.join(import.meta.dir, "fixtures", "cube.scad");
    const scadCode = await readFile(fixturePath, "utf8");

    const result = await exportScadStlTool({
      scadCode,
      filename: "cube.stl",
    });

    const blobResult = (result.structuredContent.resource as { blob: string })
      .blob;

    expect(result.structuredContent.type).toBe("resource");
    expect(result.structuredContent.resource.mimeType).toBe("model/stl");
    expect(result.structuredContent.resource.uri).toBe("file://cube.stl");
    expect(blobResult).not.toBeNull();

    expect(blobResult.length).toBeGreaterThan(100);

    const stlText = Buffer.from(blobResult, "base64").toString("utf8");

    expect(stlText.startsWith("solid")).toBe(true);
    expect(stlText.includes("facet normal")).toBe(true);
    expect(stlText.includes("endsolid")).toBe(true);
  },
  { timeout: 30_000 },
);

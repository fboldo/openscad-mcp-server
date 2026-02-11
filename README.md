# OpenSCAD MCP Server

[![npm version](https://img.shields.io/npm/v/openscad-mcp-server.svg)](https://www.npmjs.com/package/openscad-mcp-server)
[![CI](https://github.com/fboldo/openscad-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/fboldo/openscad-mcp-server/actions/workflows/ci.yml)

An MCP (Model Context Protocol) server that renders **PNG previews** and **STL geometry** from OpenSCAD (SCAD) source code. It is designed to support **iterative, agent-driven CAD workflows**, where models can be previewed visually and exported for downstream use (e.g. fabrication, simulation, or inspection).

⚠️ **Beta**  
This MCP server is currently in beta. Performance, APIs, and capabilities may change. Issues and contributions are welcome.

## Use cases

- **Iterative agent-driven modeling**  
  Agents generate or modify OpenSCAD source, render PNG previews to evaluate shape and proportions, and refine the model across multiple turns.

- **Geometry artifact generation within MCP contexts**  
  Agents export STL files as concrete geometry artifacts that can be passed to downstream tools, stored, inspected, or handed off to other MCP-enabled systems.

- **Visual grounding for parametric design**  
  PNG previews provide visual grounding for parametric or programmatic SCAD code, reducing hallucination and enabling agents to reason about spatial changes.

- **Design validation and comparison**  
  Agents can render multiple variants of a model (e.g. parameter sweeps) and visually compare results before deciding which geometry to persist or export.

## Available Tools

- `render_scad_png`: Renders a PNG preview image from SCAD source.
  - Input: `scadCode` (string), optional `width`/`height` (numbers), optional `cameraPreset` and optional `cameraPosition`
    - `cameraPreset`: one of `isometric`, `front`, `back`, `left`, `right`, `top`, `bottom`
    - `cameraPosition`: `{ x, y, z }`
  - Output: MCP `ImageContent`
- `export_scad_stl`: Exports an STL generated from SCAD source.
  - Input: `scadCode` (string), optional `filename` (string)
  - Output: MCP embedded resource (STL)

## Installation

The published package is intended to run over stdio. Configure it in your MCP client using `npx`:

```json
{
  "mcpServers": {
    "openscad": {
      "command": "npx",
      "args": ["-y", "openscad-mcp-server"]
    }
  }
}
```

## Local development

- Install deps: `bun install`
- Stdio (matches how clients run it): `bun index.ts --stdio`
- HTTP (useful for manual testing): `bun index.ts`
  - Port: `MCP_PORT` (default `3000`)
  - Endpoints: `GET /health`, MCP at `POST /mcp`
- MCP Inspector: `bun run dev`

## Similar Projects

- [jhacksman/OpenSCAD-MCP-Server](https://github.com/jhacksman/OpenSCAD-MCP-Server)
  This project provides a different approach relying on generating images from user prompts, followed by 3D reconstruction and even 3D printer discovery. It's a very interesting project, and I recommend checking it out if you are interested in OpenSCAD and MCP servers.

- [petrijr/openscad-mcp](https://github.com/petrijr/openscad-mcp)
  Similar to this project, but it uses a Python-based server and relies on the OpenSCAD CLI for rendering.

## Relevant Links

- [OpenSCAD](https://openscad.org/)
- [OpenSCAD WASM](https://github.com/openscad/openscad-wasm)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.org/)
- [Bun](https://bun.sh/)

## License

MIT — see [LICENSE](LICENSE).

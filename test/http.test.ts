import { expect, test } from 'bun:test';

import { createHttpApp } from '../src/entrypoints/http';
import { createServer } from '../src/server';

const mcpRequest = (body: unknown) =>
  new Request('http://localhost/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'mcp-protocol-version': '2025-06-18',
    },
    body: JSON.stringify(body),
  });

test('http transport handles multiple /mcp requests', async () => {
  const app = createHttpApp(createServer);

  const initialize = await app.fetch(
    mcpRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'test', version: '0.0.0' },
      },
    })
  );
  expect(initialize.status).toBe(200);
  expect((await initialize.json()).result.serverInfo.name).toBe('OpenSCAD MCP Server');

  const listTools = await app.fetch(mcpRequest({ jsonrpc: '2.0', id: 2, method: 'tools/list' }));
  expect(listTools.status).toBe(200);
  const toolNames = (await listTools.json()).result.tools.map((t: { name: string }) => t.name);
  expect(toolNames).toContain('render_scad_png');
  expect(toolNames).toContain('export_scad_stl');
});

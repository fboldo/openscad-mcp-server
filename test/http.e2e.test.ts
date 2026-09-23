import { afterAll, beforeAll, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { createServer as createNetServer } from 'node:net';
import path from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { type Subprocess } from 'bun';

const getFreePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createNetServer();
    server.once('error', reject);
    server.listen(0, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
  });

const waitForHealth = async (baseUrl: string, timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) return;
    } catch {
      // server not listening yet
    }
    await Bun.sleep(100);
  }
  throw new Error(`Server at ${baseUrl} did not become healthy within ${timeoutMs}ms`);
};

let serverProcess: Subprocess;
let baseUrl: string;

beforeAll(async () => {
  const port = await getFreePort();
  baseUrl = `http://localhost:${port}`;

  // NODE_ENV=production mirrors the published build, where stdio is the default
  // and `--http` must be honoured explicitly.
  serverProcess = Bun.spawn(['bun', path.join(import.meta.dir, '..', 'index.ts'), '--http'], {
    env: { ...process.env, MCP_PORT: String(port), NODE_ENV: 'production' },
    stdout: 'ignore',
    stderr: 'inherit',
  });

  await waitForHealth(baseUrl);
});

afterAll(async () => {
  serverProcess?.kill();
  await serverProcess?.exited;
});

const connectClient = async () => {
  const client = new Client({ name: 'e2e-test', version: '0.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`)));
  return client;
};

test('GET /health responds ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: 'ok' });
});

test(
  'MCP client can list and call tools over HTTP across multiple requests',
  async () => {
    const client = await connectClient();
    const scadCode = await readFile(path.join(import.meta.dir, 'fixtures', 'cube.scad'), 'utf8');

    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name)).toEqual(
        expect.arrayContaining(['render_scad_png', 'export_scad_stl'])
      );

      const png = await client.callTool({ name: 'render_scad_png', arguments: { scadCode } });
      expect(png.isError).toBeFalsy();
      expect(png.content).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: 'image', mimeType: 'image/png' })])
      );

      const stl = await client.callTool({
        name: 'export_scad_stl',
        arguments: { scadCode, filename: 'cube.stl' },
      });
      expect(stl.isError).toBeFalsy();
      expect(stl.content).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'resource',
            resource: expect.objectContaining({ mimeType: 'model/stl' }),
          }),
        ])
      );
    } finally {
      await client.close();
    }
  },
  { timeout: 60_000 }
);

test('separate clients can connect to the same server', async () => {
  const [a, b] = await Promise.all([connectClient(), connectClient()]);
  try {
    const [toolsA, toolsB] = await Promise.all([a.listTools(), b.listTools()]);
    expect(toolsA.tools.length).toBeGreaterThan(0);
    expect(toolsB.tools).toEqual(toolsA.tools);
  } finally {
    await Promise.all([a.close(), b.close()]);
  }
});

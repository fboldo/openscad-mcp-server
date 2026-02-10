import { serve } from '@hono/node-server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type ServerFactory } from '../server';

export const createHttpServer = async (createServer: ServerFactory) => {
  const transport = new WebStandardStreamableHTTPServerTransport();

  const app = new Hono();

  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'mcp-session-id', 'Last-Event-ID', 'mcp-protocol-version'],
      exposeHeaders: ['mcp-session-id', 'mcp-protocol-version'],
    })
  );

  app.get('/health', (c) => c.json({ status: 'ok' }));

  app.all('/mcp', (c) => transport.handleRequest(c.req.raw));

  const PORT = process.env.MCP_PORT ? Number.parseInt(process.env.MCP_PORT, 10) : 3000;

  await createServer().connect(transport);

  console.log(`Starting Hono MCP server on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);

  serve({
    fetch: app.fetch,
    port: PORT,
  });
};

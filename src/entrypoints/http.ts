import { serve } from '@hono/node-server';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type ServerFactory } from '../server';

/**
 * Creates the Hono app serving the MCP endpoint in stateless mode.
 *
 * Stateless transports cannot be reused across requests, so a fresh server and
 * transport pair is created for every `/mcp` request and closed once it has responded.
 */
export const createHttpApp = (createServer: ServerFactory) => {
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

  app.all('/mcp', async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    const server = createServer();

    try {
      await server.connect(transport);
      return await transport.handleRequest(c.req.raw);
    } finally {
      await server.close();
    }
  });

  return app;
};

export const createHttpServer = async (createServer: ServerFactory) => {
  const app = createHttpApp(createServer);

  const PORT = process.env.MCP_PORT ? Number.parseInt(process.env.MCP_PORT, 10) : 3000;

  console.log(`Starting Hono MCP server on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);

  serve({
    fetch: app.fetch,
    port: PORT,
  });
};

import { createHttpServer } from './entrypoints/http';
import { startStdioServer } from './entrypoints/stdio';
import { type ServerFactory } from './server';

export const bootstrapMethod = ['stdio', 'http'] as const;

export type BootstrapMethod = (typeof bootstrapMethod)[number];

/**
 * Bootstraps the MCP server using the specified method (stdio or http).
 *
 * @param method - The bootstrap method to use ("stdio" or "http").
 * @param createServer - A factory function that creates and returns an instance of the MCP server.
 * @returns A promise that resolves when the server is successfully started.
 */
export const bootstrap = (method: BootstrapMethod, createServer: ServerFactory) => {
  switch (method) {
    case 'stdio':
      return startStdioServer(createServer);
    case 'http':
      return createHttpServer(createServer);
    default:
      throw new Error(`Unsupported bootstrap method: ${method}`);
  }
};

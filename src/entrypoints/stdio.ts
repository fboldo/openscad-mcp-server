import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { type ServerFactory } from '../server';

export const startStdioServer = async (createServer: ServerFactory): Promise<void> => {
  await createServer().connect(new StdioServerTransport());
};

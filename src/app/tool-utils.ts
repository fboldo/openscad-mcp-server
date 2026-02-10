import type { CallToolResult, ContentBlock } from '@modelcontextprotocol/sdk/types.js';

export type StructuredToolResult<Structured, Block extends ContentBlock = ContentBlock> =
  | (Omit<CallToolResult, 'content' | 'structuredContent'> & {
      content: Block[];
      structuredContent: Structured;
    })
  | Pick<CallToolResult, 'isError' | 'content'>;

export const createSingleBlockResult = <Block extends ContentBlock>(
  block: Block
): StructuredToolResult<Block, Block> => {
  return {
    content: [block],
    structuredContent: block,
  };
};

/**
 * Higher-order function that wraps a tool function to automatically format its output into a structured tool result with a single content block.
 * If the wrapped function throws an error, it catches it and returns a structured tool result with an error message.
 * @param fn The tool function to wrap.
 * @returns A new function that wraps the original tool function and returns a structured tool result.
 */
export const asTool = <Output extends ContentBlock, Args extends unknown[]>(
  fn: (...args: Args) => Promise<Output>
): ((...args: Args) => Promise<StructuredToolResult<Output>>) => {
  return async (...args: Args) => {
    try {
      const result = await fn(...args);
      return createSingleBlockResult(result);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Operation failed: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  };
};

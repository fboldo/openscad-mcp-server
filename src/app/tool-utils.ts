import type { CallToolResult, ContentBlock } from '@modelcontextprotocol/sdk/types.js';

export type StructuredToolResult<Structured, Block extends ContentBlock = ContentBlock> = Omit<
  CallToolResult,
  'content' | 'structuredContent'
> & {
  content: Block[];
  structuredContent: Structured;
};

export const createSingleBlockResult = <Block extends ContentBlock>(
  block: Block
): StructuredToolResult<Block, Block> => {
  return {
    content: [block],
    structuredContent: block,
  };
};

import { expect, test } from 'bun:test';

import { asTool } from '@/app/tool-utils';

test('asTool wraps a successful tool into a structured result', async () => {
  const tool = async (name: string) => {
    return {
      type: 'text' as const,
      text: `hello ${name}`,
    };
  };

  const execute = asTool(tool);
  const result = await execute('world');

  expect('isError' in result && result.isError).toBe(false);
  expect('structuredContent' in result).toBe(true);

  if ('structuredContent' in result) {
    expect(result.structuredContent.type).toBe('text');
    expect((result.structuredContent as { text?: string }).text).toBe('hello world');
  }

  expect(result.content.length).toBe(1);
  expect(result.content[0]?.type).toBe('text');
});

test('asTool converts thrown errors into an isError result', async () => {
  const tool = async () => {
    throw new Error('boom');
  };

  const execute = asTool(tool);
  const result = await execute();

  expect('isError' in result && result.isError).toBe(true);
  expect('structuredContent' in result).toBe(false);

  expect(result.content.length).toBeGreaterThan(0);
  expect(result.content[0]?.type).toBe('text');

  const text = (result.content[0] as { text?: string })?.text ?? '';
  expect(text).toContain('Operation failed:');
  expect(text).toContain('boom');
});

import { describe, expect, it } from 'vitest';
import { renderTemplate } from './template.util';

describe('renderTemplate', () => {
  it('substitutes variables', () => {
    const out = renderTemplate('Hello {{name}}, query: {{query}}', {
      name: 'world',
      query: 'test?',
    });
    expect(out).toBe('Hello world, query: test?');
  });

  it('throws on missing variable', () => {
    expect(() => renderTemplate('{{missing}}', {})).toThrow('Missing template variable');
  });
});

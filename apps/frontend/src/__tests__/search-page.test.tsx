import { describe, it, expect } from 'vitest';

describe('SearchPage', () => {
  it('module exists and exports default component', async () => {
    const module = await import('../app/search/page');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('function');
  });
});
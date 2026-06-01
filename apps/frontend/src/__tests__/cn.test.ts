import { cn } from '../utils/cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('handles tailwind conflicting classes', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});
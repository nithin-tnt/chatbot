import { describe, it, expect } from 'vitest';
import { detectProfileQuery } from '@/lib/openai';

describe('OpenAI Utilities', () => {
  describe('detectProfileQuery', () => {
    it('should detect "who am i" query', () => {
      expect(detectProfileQuery('Who am I?')).toBe(true);
      expect(detectProfileQuery('who am i')).toBe(true);
      expect(detectProfileQuery('Who Am I')).toBe(true);
    });

    it('should detect "tell me about myself" query', () => {
      expect(detectProfileQuery('Tell me about myself')).toBe(true);
      expect(detectProfileQuery('Can you tell me about myself?')).toBe(true);
    });

    it('should detect personality-related queries', () => {
      expect(detectProfileQuery('What kind of person am I?')).toBe(true);
      expect(detectProfileQuery('What do you know about me?')).toBe(true);
      expect(detectProfileQuery('Describe my personality')).toBe(true);
    });

    it('should not detect unrelated queries', () => {
      expect(detectProfileQuery('Hello, how are you?')).toBe(false);
      expect(detectProfileQuery('What is the weather?')).toBe(false);
      expect(detectProfileQuery('Tell me a joke')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(detectProfileQuery('')).toBe(false);
    });
  });
});

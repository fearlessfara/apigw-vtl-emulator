import { describe, it, expect } from 'vitest';
import { UtilFunctions } from '../../src/engine/UtilFunctions';

describe('UtilFunctions', () => {
  const util = new UtilFunctions();

  describe('escapeJavaScript', () => {
    it('should escape special characters', () => {
      expect(util.escapeJavaScript('Hello "World"')).toBe('Hello \\"World\\"');
      expect(util.escapeJavaScript("It's fine")).toBe("It\\'s fine");
      expect(util.escapeJavaScript('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
      expect(util.escapeJavaScript('Tab\there')).toBe('Tab\\there');
    });

    it('should handle null and undefined', () => {
      expect(util.escapeJavaScript(null)).toBe('');
      expect(util.escapeJavaScript(undefined)).toBe('');
    });

    it('should serialize objects', () => {
      const obj = { name: 'test', value: 123 };
      const result = util.escapeJavaScript(obj);
      expect(result).toContain('\\"name\\"');
      expect(result).toContain('\\"test\\"');
    });
  });

  describe('base64Encode and base64Decode', () => {
    it('should encode and decode strings', () => {
      const original = 'Hello, World!';
      const encoded = util.base64Encode(original);
      const decoded = util.base64Decode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle empty strings', () => {
      expect(util.base64Encode('')).toBe('');
      expect(util.base64Decode('')).toBe('');
    });

    it('should handle null', () => {
      expect(util.base64Encode(null as any)).toBe('');
      expect(util.base64Decode(null as any)).toBe('');
    });
  });

  describe('parseJson', () => {
    it('should parse valid JSON', () => {
      const json = '{"name":"test","value":123}';
      const result = util.parseJson(json);
      expect(result).toEqual({ name: 'test', value: 123 });
    });

    it('should return original string on parse failure', () => {
      const invalid = 'not json';
      const result = util.parseJson(invalid);
      expect(result).toBe(invalid);
    });

    it('should handle null and empty strings', () => {
      expect(util.parseJson(null as any)).toBeNull();
      expect(util.parseJson('')).toBeNull();
      expect(util.parseJson('   ')).toBeNull();
    });
  });

  describe('urlEncode and urlDecode', () => {
    it('should encode and decode URLs', () => {
      const original = 'hello world & special=chars';
      const encoded = util.urlEncode(original);
      expect(encoded).toContain('hello%20world');
      const decoded = util.urlDecode(encoded);
      expect(decoded).toBe(original);
    });

    it('should handle null', () => {
      expect(util.urlEncode(null as any)).toBe('');
      expect(util.urlDecode(null as any)).toBe('');
    });
  });
});

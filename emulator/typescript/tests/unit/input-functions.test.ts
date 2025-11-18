import { describe, it, expect } from 'vitest';
import { InputFunctions } from '../../src/engine/InputFunctions';

describe('InputFunctions', () => {
  describe('path', () => {
    it('should navigate simple paths', () => {
      const input = { name: 'John', age: 30 };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.path('name')).toBe('John');
      expect(inputFn.path('age')).toBe(30);
    });

    it('should navigate nested paths', () => {
      const input = {
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.path('user.profile.name')).toBe('John');
      expect(inputFn.path('user.profile.age')).toBe(30);
    });

    it('should handle array access', () => {
      const input = {
        users: [
          { name: 'Alice' },
          { name: 'Bob' },
        ],
      };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.path('users[0].name')).toBe('Alice');
      expect(inputFn.path('users[1].name')).toBe('Bob');
    });

    it('should return null for missing paths', () => {
      const input = { name: 'John' };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.path('missing')).toBeNull();
      expect(inputFn.path('user.profile.name')).toBeNull();
    });
  });

  describe('json', () => {
    it('should return JSON string', () => {
      const input = { name: 'John', age: 30 };
      const inputFn = new InputFunctions({}, input);

      const result = inputFn.json('name');
      expect(result).toBe('"John"');
    });

    it('should return entire input when path is empty', () => {
      const input = { name: 'John', age: 30 };
      const inputFn = new InputFunctions({}, input);

      const result = inputFn.json('$');
      expect(JSON.parse(result)).toEqual(input);
    });

    it('should return null for missing paths', () => {
      const input = { name: 'John' };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.json('missing')).toBe('null');
    });
  });

  describe('body', () => {
    it('should return raw input string', () => {
      const inputString = '{"name":"John","value":10.00}';
      const inputFn = new InputFunctions({}, {}, inputString);

      expect(inputFn.body()).toBe(inputString);
      expect(inputFn.getBody()).toBe(inputString);
    });
  });

  describe('params', () => {
    it('should return all params', () => {
      const context = {
        params: {
          path: { id: '123' },
          querystring: { filter: 'active' },
          header: { 'Content-Type': 'application/json' },
        },
      };
      const inputFn = new InputFunctions(context);

      const allParams = inputFn.params();
      expect(allParams).toHaveProperty('path');
      expect(allParams).toHaveProperty('querystring');
      expect(allParams).toHaveProperty('header');
    });

    it('should search params in order: path, querystring, header', () => {
      const context = {
        params: {
          path: { id: 'path-123' },
          querystring: { id: 'query-456', filter: 'active' },
          header: { id: 'header-789', 'Content-Type': 'application/json' },
        },
      };
      const inputFn = new InputFunctions(context);

      // Should find in path first
      expect(inputFn.params('id')).toBe('path-123');

      // Should find in querystring if not in path
      expect(inputFn.params('filter')).toBe('active');

      // Should find in header if not in path or querystring
      expect(inputFn.params('Content-Type')).toBe('application/json');
    });
  });

  describe('size', () => {
    it('should return size of arrays', () => {
      const input = [1, 2, 3, 4, 5];
      const inputFn = new InputFunctions({}, input as any);

      expect(inputFn.size()).toBe(5);
    });

    it('should return size of objects', () => {
      const input = { a: 1, b: 2, c: 3 };
      const inputFn = new InputFunctions({}, input);

      expect(inputFn.size()).toBe(3);
    });
  });
});

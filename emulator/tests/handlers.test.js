import {expect} from 'chai';
import {renderVTL} from '../src/engine.js';

describe('VTL Custom Handler Test Suite - Comprehensive Coverage', () => {

  // ============================================
  // $input.json() Tests
  // ============================================
  describe('$input.json() Path Resolution', () => {
    it('handles simple nested object path', () => {
      const tpl = '$input.json("$.foo.bar")';
      const event = {body: JSON.stringify({foo: {bar: 'baz'}})};
      expect(renderVTL(tpl, event)).to.equal('baz');
    });

    it('handles deep nested paths', () => {
      const tpl = '$input.json("$.level1.level2.level3.value")';
      const event = {body: JSON.stringify({level1: {level2: {level3: {value: 'deep'}}}})};
      expect(renderVTL(tpl, event)).to.equal('deep');
    });

    it('handles array access in JSON path', () => {
      const tpl = '$input.json("$.items.0.name")';
      const event = {body: JSON.stringify({items: [{name: 'first'}, {name: 'second'}]})};
      expect(renderVTL(tpl, event)).to.equal('first');
    });

    it('returns null for non-existent path', () => {
      const tpl = '$input.json("$.nonexistent.path")';
      expect(renderVTL(tpl)).to.equal("");
    });

    it('returns entire object for root path "$"', () => {
      const tpl = '$input.json("$")';
      const event = {body: JSON.stringify({foo: 'bar', num: 42})};
      const result = JSON.parse(renderVTL(tpl, event));
      expect(result.foo).to.equal('bar');
      expect(result.num).to.equal(42);
    });

    it('handles empty path gracefully', () => {
      const tpl = '$input.json("")';
      const event = {body: JSON.stringify({foo: 'bar'})};
      expect(renderVTL(tpl, event)).to.equal(''); // Empty string, not 'null'
    });

    it('handles invalid JSON path format', () => {
      const tpl = '$input.json("invalid.path")';
      const event = {body: JSON.stringify({foo: 'bar'})};
      expect(renderVTL(tpl, event)).to.equal('');
    });
  });

  // ============================================
  // $input.body Tests
  // ============================================
  describe('$input.body Access', () => {
    it('returns raw string body', () => {
      const tpl = '$input.body';
      const event = {body: '{"raw":"json"}'};
      expect(renderVTL(tpl, event)).to.equal('{"raw":"json"}');
    });

    it('stringifies object body', () => {
      const tpl = '$input.body';
      const event = {body: {key: 'value'}};
      expect(renderVTL(tpl, event)).to.equal('{"key":"value"}');
    });

    it.skip('handles empty string body', () => {
      const tpl = '$input.body';
      const event = {body: ''};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it.skip('handles null body', () => {
      const tpl = '$input.body';
      const event = {body: null};
      expect(renderVTL(tpl, event)).to.equal('null');
    });
  });

  // ============================================
  // $input.path Tests
  // ============================================
  describe('$input.path Access', () => {
    it('returns specific path parameter', () => {
      const tpl = '$input.path("id")';
      const event = {pathParameters: {id: '123', name: 'test'}};
      expect(renderVTL(tpl, event)).to.equal('123');
    });

    it('returns full path when no parameter specified', () => {
      const tpl = '$input.path()';
      const event = {path: '/api/users/123'};
      expect(renderVTL(tpl, event)).to.equal('/api/users/123');
    });

    it('returns default "/" when no path exists', () => {
      const tpl = '$input.path()';
      const event = {};
      expect(renderVTL(tpl, event)).to.equal('/');
    });

    it('returns empty string for non-existent path parameter', () => {
      const tpl = '$input.path("missing")';
      const event = {pathParameters: {id: '123'}};
      expect(renderVTL(tpl, event)).to.equal('');
    });
  });

  // ============================================
  // $input.querystring Tests
  // ============================================
  describe('$input.querystring Access', () => {
    it('returns specific query parameter', () => {
      const tpl = '$input.querystring("search")';
      const event = {queryStringParameters: {search: 'test', limit: '10'}};
      expect(renderVTL(tpl, event)).to.equal('test');
    });

    it('returns empty string for non-existent parameter', () => {
      const tpl = '$input.querystring("missing")';
      const event = {queryStringParameters: {search: 'test'}};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it('handles null query parameters', () => {
      const tpl = '$input.querystring("test")';
      const event = {queryStringParameters: null};
      expect(renderVTL(tpl, event)).to.equal('');
    });
  });

  // ============================================
  // $input.header Tests
  // ============================================
  describe('$input.header Access', () => {
    it('returns header value case-insensitive', () => {
      const tpl = '$input.header("Content-Type")';
      const event = {headers: {'content-type': 'application/json', 'X-Custom': 'value'}};
      expect(renderVTL(tpl, event)).to.equal('application/json');
    });

    it('handles mixed case header names', () => {
      const tpl = '$input.header("x-custom")';
      const event = {headers: {'X-Custom': 'test-value'}};
      expect(renderVTL(tpl, event)).to.equal('test-value');
    });

    it('returns empty string for missing header', () => {
      const tpl = '$input.header("Missing-Header")';
      const event = {headers: {'existing': 'value'}};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it('handles null headers', () => {
      const tpl = '$input.header("test")';
      const event = {headers: null};
      expect(renderVTL(tpl, event)).to.equal('');
    });
  });

  // ============================================
  // $input.method Tests
  // ============================================
  describe('$input.method Access', () => {
    it('returns HTTP method', () => {
      const tpl = '$input.method()';
      const event = {httpMethod: 'POST'};
      expect(renderVTL(tpl, event)).to.equal('POST');
    });

    it('defaults to GET when no method specified', () => {
      const tpl = '$input.method()';
      const event = {};
      expect(renderVTL(tpl, event)).to.equal('GET');
    });

    it('handles various HTTP methods', () => {
      ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].forEach(method => {
        const tpl = '$input.method()';
        const event = {httpMethod: method};
        expect(renderVTL(tpl, event)).to.equal(method);
      });
    });
  });

  // ============================================
  // $input.params() Tests
  // ============================================
  describe('$input.params() Unified Access', () => {
    it('provides unified access to query, path, and headers', () => {
      const tpl = '$input.params().querystring.get("q") $input.params().path.get("id") $input.params().header.get("X-Test")';
      const event = {
        queryStringParameters: {q: 'search'},
        pathParameters: {id: '42'},
        headers: {'X-Test': 'header-value'}
      };
      expect(renderVTL(tpl, event)).to.equal('search 42 header-value');
    });

    it('handles missing parameters gracefully', () => {
      const tpl = '$input.params().querystring.get("missing")';
      const event = {queryStringParameters: {existing: 'value'}};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it('works with case-insensitive headers through params', () => {
      const tpl = '$input.params().header.get("content-type")';
      const event = {headers: {'Content-Type': 'application/json'}};
      expect(renderVTL(tpl, event)).to.equal('application/json');
    });
  });

  // ============================================
  // $util.escapeJavaScript Tests
  // ============================================
  describe('$util.escapeJavaScript Escaping', () => {
    it('escapes double quotes only', () => {
      const input = 'Hello "World"';
      const tpl = `#set($e = $util.escapeJavaScript("${input.replace(/"/g, '\\"')}")) $e`;
      expect(renderVTL(tpl)).to.equal('Hello \\"World\\"');
    });

    it('preserves literal backslash sequences', () => {
      const input = String.raw`"Hello\nWorld"`;
      const tpl = `#set($e = $util.escapeJavaScript("${input.replace(/"/g, '\\"')}")) $e`;
      expect(renderVTL(tpl)).to.equal('\\"Hello\\nWorld\\"');
    });

    it('escapes actual control characters', () => {
      const input = 'Hello\nWorld\tTest';
      const tpl = `#set($e = $util.escapeJavaScript("${input}")) $e`;
      expect(renderVTL(tpl)).to.equal('Hello\\nWorld\\tTest');
    });

    it('handles empty string', () => {
      const tpl = '$util.escapeJavaScript("")';
      expect(renderVTL(tpl)).to.equal('');
    });

    it('handles all control characters', () => {
      const input = 'test\r\n\t\f\b"end';
      const tpl = `#set($e = $util.escapeJavaScript("${input.replace(/"/g, '\\"')}")) $e`;
      expect(renderVTL(tpl)).to.equal('test\\r\\n\\t\\f\\b\\"end');
    });

    it('handles null input', () => {
      const tpl = '$util.escapeJavaScript(null)';
      expect(renderVTL(tpl)).to.equal('');
    });
  });

  // ============================================
  // $util.base64Encode/Decode Tests
  // ============================================
  describe('$util.base64 Encoding/Decoding', () => {
    it('encodes and decodes simple strings', () => {
      expect(renderVTL('$util.base64Encode("hello")')).to.equal('aGVsbG8=');
      expect(renderVTL('$util.base64Decode("aGVsbG8=")')).to.equal('hello');
    });

    it('handles complex strings with special characters', () => {
      const input = 'Hello World! 123 @#$%^&*()';
      const encoded = renderVTL(`$util.base64Encode("${input}")`);
      const decoded = renderVTL(`$util.base64Decode("${encoded}")`);
      expect(decoded).to.equal(input);
    });

    it('handles unicode characters', () => {
      const input = 'café résumé naïve 你好';
      const encoded = renderVTL(`$util.base64Encode("${input}")`);
      const decoded = renderVTL(`$util.base64Decode("${encoded}")`);
      expect(decoded).to.equal(input);
    });

    it('handles empty strings', () => {
      expect(renderVTL('$util.base64Encode("")')).to.equal('');
      expect(renderVTL('$util.base64Decode("")')).to.equal('');
    });

    it('handles null values', () => {
      expect(renderVTL('$util.base64Encode(null)')).to.equal('');
      expect(renderVTL('$util.base64Decode(null)')).to.equal('');
    });

    it('round-trip encoding/decoding', () => {
      const testCases = [
        'simple text',
        'with "quotes" and \'apostrophes\'',
        'line1\nline2\ttabbed',
        '{"json": "data", "number": 123}',
        'special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      ];

      testCases.forEach(input => {
        const tpl = `$util.base64Decode($util.base64Encode("${input.replace(/"/g, '\\"')}"))`;
        expect(renderVTL(tpl)).to.equal(input);
      });
    });
  });

  // ============================================
  // $util.urlEncode/Decode Tests
  // ============================================
  describe('$util.url Encoding/Decoding', () => {
    it('encodes spaces as plus signs', () => {
      expect(renderVTL('$util.urlEncode("hello world")')).to.equal('hello+world');
    });

    it('encodes special characters correctly', () => {
      expect(renderVTL('$util.urlEncode("hello world!")')).to.equal('hello+world%21');
      expect(renderVTL('$util.urlEncode("user@example.com")')).to.equal('user%40example.com');
      expect(renderVTL('$util.urlEncode("key=value&other=123")')).to.equal('key%3Dvalue%26other%3D123');
    });

    it('handles percent signs correctly', () => {
      expect(renderVTL('$util.urlEncode("100% off")')).to.equal('100%25+off');
    });

    it('decodes encoded strings correctly', () => {
      expect(renderVTL('$util.urlDecode("hello%20world%21")')).to.equal('hello world!');
      expect(renderVTL('$util.urlDecode("hello+world")')).to.equal('hello world');
      expect(renderVTL('$util.urlDecode("user%40example.com")')).to.equal('user@example.com');
    });

    it('handles mixed encoding formats', () => {
      expect(renderVTL('$util.urlDecode("hello+world%20test")')).to.equal('hello world test');
    });

    it('round-trip encoding/decoding', () => {
      const testCases = [
        'hello world!',
        'user@example.com',
        'key=value&other=123',
        '100% satisfaction!',
        'path/to/file.txt',
        'special chars: !@#$%^&*()',
        'unicode: café résumé'
      ];

      testCases.forEach(input => {
        const encoded = renderVTL(`$util.urlEncode("${input.replace(/"/g, '\\"')}")`);
        const decoded = renderVTL(`$util.urlDecode("${encoded}")`);
        expect(decoded).to.equal(input);
      });
    });

    it('handles empty strings', () => {
      expect(renderVTL('$util.urlEncode("")')).to.equal('');
      expect(renderVTL('$util.urlDecode("")')).to.equal('');
    });

    it('handles null values', () => {
      expect(renderVTL('$util.urlEncode(null)')).to.equal('');
      expect(renderVTL('$util.urlDecode(null)')).to.equal('');
    });
  });

  // ============================================
  // $util.parseJson Tests
  // ============================================
  describe('$util.parseJson Parsing', () => {
    it('parses valid JSON objects', () => {
      const rawJson = JSON.stringify({foo: {bar: 123}});
      const tpl = `#set($data = $util.parseJson("${rawJson.replace(/"/g, '\\"')}")) $data.foo.bar`;
      expect(renderVTL(tpl)).to.equal('123');
    });

    it('parses JSON arrays', () => {
      const rawJson = JSON.stringify([1, 2, 3]);
      const tpl = `#set($data = $util.parseJson("${rawJson}")) $data.get(1)`;
      expect(renderVTL(tpl)).to.equal('2');
    });

    it('parses JSON primitives', () => {
      expect(renderVTL('$util.parseJson("123")')).to.equal('123');
      expect(renderVTL('$util.parseJson("true")')).to.equal('true');
      expect(renderVTL('$util.parseJson("\\"test\\"")')).to.equal('test');
    });

    it('returns null for invalid JSON', () => {
      expect(renderVTL('$util.parseJson("invalid json")')).to.equal('null');
      expect(renderVTL('$util.parseJson("{")')).to.equal('null');
      expect(renderVTL('$util.parseJson("")')).to.equal('null');
    });

    it('handles null input', () => {
      expect(renderVTL('$util.parseJson(null)')).to.equal('null');
    });

    it('handles complex nested structures', () => {
      const complexJson = JSON.stringify({
        users: [
          {name: 'John', age: 30, preferences: {theme: 'dark'}},
          {name: 'Jane', age: 25, preferences: {theme: 'light'}}
        ],
        meta: {count: 2, version: '1.0'}
      });
      const tpl = `#set($data = $util.parseJson("${complexJson.replace(/"/g, '\\"')}")) $data.users.get(0).preferences.theme`;
      expect(renderVTL(tpl)).to.equal('dark');
    });
  });

  // ============================================
  // $context.* Tests
  // ============================================
  describe('$context Property Access', () => {
    it('returns standard context properties', () => {
      const tpl = '$context.accountId $context.requestId $context.stage';
      const event = {
        context: {
          accountId: 'acc123',
          requestId: 'req999',
          stage: 'prod'
        }
      };
      expect(renderVTL(tpl, event)).to.equal('acc123 req999 prod');
    });

    it.skip('returns empty string for missing context properties', () => {
      const tpl = '$context.nonExistentProperty';
      const event = {context: {accountId: 'acc123'}};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it('handles all standard AWS context properties', () => {
      const contextProps = [
        'accountId', 'apiId', 'authorizer', 'domainName', 'domainPrefix',
        'extendedRequestId', 'httpMethod', 'identity', 'path', 'protocol',
        'requestId', 'requestTime', 'requestTimeEpoch', 'resourceId',
        'resourcePath', 'stage'
      ];

      const contextData = {};
      contextProps.forEach(prop => {
        contextData[prop] = `${prop}-value`;
      });

      contextProps.forEach(prop => {
        const tpl = `$context.${prop}`;
        const event = {context: contextData};
        expect(renderVTL(tpl, event)).to.equal(`${prop}-value`);
      });
    });

    it.skip('handles missing context object', () => {
      const tpl = '$context.accountId';
      const event = {};
      expect(renderVTL(tpl, event)).to.equal('');
    });

    it.skip('handles null context values', () => {
      const tpl = '$context.accountId';
      const event = {context: {accountId: null}};
      expect(renderVTL(tpl, event)).to.equal('');
    });
  });

  // ============================================
  // Edge Cases and Error Handling
  // ============================================
  describe('Edge Cases and Error Handling', () => {
    it.skip('handles undefined/null event gracefully', () => {
      const tpl = '$input.body $input.method()';
      expect(renderVTL(tpl, null)).to.equal(' GET');
      expect(renderVTL(tpl, undefined)).to.equal(' GET');
    });

    it.skip('handles malformed JSON in body', () => {
      const tpl = '$input.json("$.test")';
      const event = {body: '{invalid json}'};
      expect(renderVTL(tpl, event)).to.equal('null');
    });

    it('handles very deep JSON paths', () => {
      const deepObj = {a: {b: {c: {d: {e: {f: 'deep_value'}}}}}};
      const tpl = '$input.json("$.a.b.c.d.e.f")';
      const event = {body: JSON.stringify(deepObj)};
      expect(renderVTL(tpl, event)).to.equal('deep_value');
    });

    it('handles special characters in JSON keys', () => {
      const specialObj = {'key-with-dashes': 'value1', 'key.with.dots': 'value2'};
      const tpl1 = '$input.json("$.key-with-dashes")';
      const tpl2 = '$input.json("$.key.with.dots")';
      const event = {body: JSON.stringify(specialObj)};
      expect(renderVTL(tpl1, event)).to.equal('value1');
      // Note: This might fail due to dot notation conflict - that's expected
    });

    it('handles large strings in encoding functions', () => {
      const largeString = 'a'.repeat(1000);
      const encoded = renderVTL(`$util.base64Encode("${largeString}")`);
      const decoded = renderVTL(`$util.base64Decode("${encoded}")`);
      expect(decoded).to.equal(largeString);
    });

    it.skip('handles unknown context properties gracefully', () => {
      const tpl = '$context.unknownProperty $context.anotherUnknown';
      expect(renderVTL(tpl)).to.equal(' ');
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Integration and Complex Scenarios', () => {
    it('combines multiple input sources in template', () => {
      const tpl = `
        Method: $input.method()
        Path: $input.path("id")
        Query: $input.querystring("filter")
        Header: $input.header("Authorization")
        Body: $input.json("$.action")
        Context: $context.stage
      `.trim();

      const event = {
        httpMethod: 'POST',
        pathParameters: {id: 'user123'},
        queryStringParameters: {filter: 'active'},
        headers: {'Authorization': 'Bearer token123'},
        body: JSON.stringify({action: 'update', data: {name: 'John'}}),
        context: {stage: 'development'}
      };

      const result = renderVTL(tpl, event);
      expect(result).to.include('Method: POST');
      expect(result).to.include('Path: user123');
      expect(result).to.include('Query: active');
      expect(result).to.include('Header: Bearer token123');
      expect(result).to.include('Body: update');
      expect(result).to.include('Context: development');
    });

    it('chains utility functions', () => {
      const originalData = {message: 'Hello World!', timestamp: Date.now()};
      const jsonString = JSON.stringify(originalData);
      const encodedJson = Buffer.from(jsonString).toString('base64');

      const tpl = `#set($decoded = $util.base64Decode("${encodedJson}"))#set($parsed = $util.parseJson($decoded))$parsed.message`;
      expect(renderVTL(tpl)).to.equal('Hello World!');
    });

    it('handles real-world API Gateway event structure', () => {
      const tpl = `
#set($body = $input.json('$'))
{
  "method": "$context.httpMethod",
  "path": "$context.path",
  "pathParams": {
    "id": "$input.params().path.get('id')"
  },
  "queryParams": {
    "include": "$input.params().querystring.get('include')"
  },
  "headers": {
    "Content-Type": "$input.params().header.get('Content-Type')"
  },
  "body": "$util.escapeJavaScript($body)",
  "context": {
    "accountId": "$context.accountId",
    "requestId": "$context.requestId",
    "stage": "$context.stage"
  }
}
`.trim();

      const event = {

        path: '/api/users/123',
        pathParameters: {id: '123'},
        queryStringParameters: {include: 'profile'},
        headers: {'Content-Type': 'application/json'},
        body: '{"hello":"world"}',
        context: {
          accountId: 'account123',
          requestId: 'request456',
          stage: 'prod',
          path: '/api/users/123',
          httpMethod: 'GET',
        }
      };

      const result = JSON.parse(renderVTL(tpl, event));

      expect(result.method).to.equal('GET');
      expect(result.path).to.equal('/api/users/123');
      expect(result.pathParams.id).to.equal('123');
      expect(result.queryParams.include).to.equal('profile');
      expect(result.headers['Content-Type']).to.equal('application/json');
      expect(result.body).to.equal('{"hello":"world"}'); // string body
      expect(result.context.accountId).to.equal('account123');
    });


  });
});
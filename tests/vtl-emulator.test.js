// vtl-emulator.test.js
import { expect } from 'chai';
import { renderVTL, buildInput, buildUtil, buildContext } from '../vtl-emulator.js';

describe('VTL Emulator Tests', () => {
  describe('buildInput', () => {
    it('should handle params method correctly', () => {
      const event = {
        queryStringParameters: { query: 'test' },
        headers: { 'content-type': 'application/json' },
        pathParameters: { id: '123' }
      };

      const input = buildInput(event);

      expect(input.params().querystring('query')).to.equal('test');
      expect(input.params().header('content-type')).to.equal('application/json');
      expect(input.params().path('id')).to.equal('123');
      // Non-existent params should return empty array
      expect(input.params().querystring('nonexistent')).to.deep.equal("");
    });

    it('should handle path method with different arguments', () => {
      const event = {
        path: '/api/users/123',
        pathParameters: { id: '123' }
      };

      const input = buildInput(event);

      // path() should return full path
      expect(input.path()).to.equal('/api/users/123');
      // path(key) should return path parameter
      expect(input.path('id')).to.equal('123');
      // Non-existent path parameter should return empty string
      expect(input.path('nonexistent')).to.equal('');
    });

    it('should handle json method correctly', () => {
      const event = {
        body: JSON.stringify({ user: { name: 'John', details: { age: 30 } } })
      };

      const input = buildInput(event);

      // json('$') should return the entire parsed body
      expect(input.json('$')).to.deep.equal({ user: { name: 'John', details: { age: 30 } } });
      // json('$.user.name') should return the nested value
      expect(input.json('$.user.name')).to.equal('John');
      expect(input.json('$.user.details.age')).to.equal(30);
      // Non-existent path should return null
      expect(input.json('$.nonexistent')).to.be.null;
    });

    it('should handle invalid JSON body gracefully', () => {
      const event = {
        body: 'invalid-json'
      };

      const input = buildInput(event);

      expect(input.json('$')).to.deep.equal({});
    });

    it('should handle other methods correctly', () => {
      const event = {
        httpMethod: 'POST',
        queryStringParameters: { query: 'test' },
        headers: { 'content-type': 'application/json' },
        pathParameters: { id: '123' },
        body: JSON.stringify({ name: 'John' })
      };

      const input = buildInput(event);

      expect(input.method()).to.equal('POST');
      expect(input.querystring('query')).to.equal('test');
      expect(input.header('content-type')).to.equal('application/json');
      expect(input.body).to.equal('{"name":"John"}');
    });
  });

  describe('buildUtil', () => {
    it('should handle escapeJavaScript correctly', () => {
      const util = buildUtil();

      console.log(util.escapeJavaScript('line\nbreak')); // prints: line\nbreak

      expect(util.escapeJavaScript('test "quoted" text')).to.equal('test \\"quoted\\" text');
      expect(util.escapeJavaScript('line\nbreak')).to.equal('line\\nbreak');
      expect(util.escapeJavaScript(null)).to.equal('');
    });

    it('should handle base64 encoding/decoding correctly', () => {
      const util = buildUtil();
      const testString = 'Hello, World!';
      const encoded = util.base64Encode(testString);

      expect(encoded).to.equal('SGVsbG8sIFdvcmxkIQ==');
      expect(util.base64Decode(encoded)).to.equal(testString);
      expect(util.base64Encode(null)).to.equal('');
    });

    it('should handle URL encoding/decoding correctly', () => {
      const util = buildUtil();
      const testString = 'Hello, World!';
      const encoded = util.urlEncode(testString);

      expect(encoded).to.equal('Hello%2C%20World!');
      expect(util.urlDecode(encoded)).to.equal(testString);
      expect(util.urlEncode(null)).to.equal('');
    });

    it('should handle JSON operations correctly', () => {
      const util = buildUtil();
      const testObj = { name: 'John', age: 30 };
      const json = JSON.stringify(testObj);

      expect(util.toJson(testObj)).to.equal(json);
      expect(util.parseJson(json)).to.deep.equal(testObj);
      // Should handle invalid JSON
      expect(util.parseJson('invalid-json')).to.be.null;
    });

    it('should generate valid UUIDs', () => {
      const util = buildUtil();
      const uuid = util.randomUUID();

      // Very basic UUID format check
      expect(uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('should handle time utilities correctly', () => {
      const util = buildUtil();

      // Epoch seconds should be roughly current time
      const now = Math.floor(Date.now() / 1000);
      const epochSeconds = util.time.nowEpochSeconds();
      expect(epochSeconds).to.be.closeTo(now, 2);

      // Formatted time should match expected pattern
      const formatted = util.time.nowFormatted();
      expect(formatted).to.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('buildContext', () => {
    it('should create default context when no input provided', () => {
      const context = buildContext();

      expect(context.accountId).to.equal('test-account');
      expect(context.stage).to.equal('test');
      expect(context.identity.sourceIp).to.equal('127.0.0.1');
    });

    it('should override default values with provided values', () => {
      const customContext = {
        accountId: 'custom-account',
        stage: 'prod',
        identity: {
          sourceIp: '192.168.1.1',
          userAgent: 'Custom-Agent'
        }
      };

      const context = buildContext(customContext);

      expect(context.accountId).to.equal('custom-account');
      expect(context.stage).to.equal('prod');
      expect(context.identity.sourceIp).to.equal('192.168.1.1');
      expect(context.identity.userAgent).to.equal('Custom-Agent');
      // Non-overridden values should still have defaults
      expect(context.resourceId).to.equal('test-resource-id');
    });
  });

  describe('renderVTL', () => {
    it('should render basic VTL template correctly', () => {
      const template = 'Hello, $input.params().querystring("name")!';
      const event = {
        queryStringParameters: { name: 'World' }
      };

      const result = renderVTL(template, event);
      expect(result).to.equal('Hello, World!');
    });

    it('should handle JSON templates correctly', () => {
      const template = `{
        "name": "$input.json('$.user.name')",
        "age": $input.json('$.user.age'),
        "path": "$input.path('id')"
      }`;

      const event = {
        body: JSON.stringify({ user: { name: 'John', age: 30 } }),
        pathParameters: { id: '123' }
      };

      const result = renderVTL(template, event);
      // Parse to compare as objects to ignore whitespace differences
      const parsedResult = JSON.parse(result);

      expect(parsedResult.name).to.equal('John');
      expect(parsedResult.age).to.equal(30);
      expect(parsedResult.path).to.equal('123');
    });

    it('should handle utility functions correctly', () => {
      const template = `{
        "encoded": "$util.base64Encode('test')",
        "escaped": "$util.escapeJavaScript('test "quote"')"
      }`;

      const result = renderVTL(template, {});
      const parsedResult = JSON.parse(result);

      expect(parsedResult.encoded).to.equal('dGVzdA==');
      // In the parsed JSON, the escaping is simplified
      expect(parsedResult.escaped).to.equal('test "quote"');
    });

    it('should handle context variables correctly', () => {
      const template = `{
        "ip": "$context.identity.sourceIp",
        "stage": "$context.stage"
      }`;

      const event = {
        context: {
          identity: { sourceIp: '192.168.1.1' },
          stage: 'prod'
        }
      };

      const result = renderVTL(template, event);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.ip).to.equal('192.168.1.1');
      expect(parsedResult.stage).to.equal('prod');
    });

    it('should handle stage variables correctly', () => {
      const template = 'Environment: $stageVariables.environment';
      const event = {
        stageVariables: { environment: 'production' }
      };

      const result = renderVTL(template, event);
      expect(result).to.equal('Environment: production');
    });

    it('should handle complex templates with multiple features', () => {
      const template = `#set($user = $input.json('$.user'))
{
  "greeting": "Hello, $user.name!",
  "message": "Your request to $input.path() was received at $context.identity.sourceIp",
  "details": {
    "encodedId": "$util.base64Encode($input.path('id'))",
    "environment": "$stageVariables.environment",
    #if($user.isAdmin)
    "admin": true,
    #else
    "admin": false,
    #end
    "timestamp": $util.time.nowEpochSeconds()
  }
}`;

      const event = {
        path: '/api/users/123',
        pathParameters: { id: '123' },
        body: JSON.stringify({ user: { name: 'John', isAdmin: true } }),
        context: {
          identity: { sourceIp: '192.168.1.1' }
        },
        stageVariables: { environment: 'staging' }
      };

      const result = renderVTL(template, event);
      const parsedResult = JSON.parse(result);

      expect(parsedResult.greeting).to.equal('Hello, John!');
      expect(parsedResult.message).to.equal('Your request to /api/users/123 was received at 192.168.1.1');
      expect(parsedResult.details.encodedId).to.equal('MTIz');
      expect(parsedResult.details.environment).to.equal('staging');
      expect(parsedResult.details.admin).to.be.true;
      expect(parsedResult.details.timestamp).to.be.a('number');
    });

    it('should handle errors gracefully', () => {
      // Non-string template
      expect(renderVTL(null)).to.include('Error:');

      // Invalid VTL syntax
      const invalidTemplate = '#if(bad syntax)';
      expect(renderVTL(invalidTemplate)).to.include('Error:');
    });
  });
});
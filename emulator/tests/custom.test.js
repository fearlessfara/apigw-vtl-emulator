import { expect } from 'chai';
import { renderVTL } from '../src/engine.js';

describe('VTL Emulator Tests', () => {
  it('renders greeting from query param', () => {
    const tpl = 'Hello, $input.params().querystring.get("name")!';
    const event = { queryStringParameters: { name: 'World' } };
    expect(renderVTL(tpl, event)).to.equal('Hello, World!');
  });

  it('reads header via $input.params().header.get()', () => {
    const tpl = 'Content-Type: $input.params().header.get("Content-Type")';
    const event = { headers: { 'Content-Type': 'application/json' } };
    expect(renderVTL(tpl, event)).to.equal('Content-Type: application/json');
  });

  it('reads path param via $input.params().path.get()', () => {
    const tpl = 'ID: $input.params().path.get("id")';
    const event = { pathParameters: { id: '123' } };
    expect(renderVTL(tpl, event)).to.equal('ID: 123');
  });

  it('returns full raw body from $input.body', () => {
    const tpl = 'Body: $input.body';
    const event = { body: '{"foo":"bar"}' };
    expect(renderVTL(tpl, event)).to.equal('Body: {"foo":"bar"}');
  });

  it('extracts value from body using $input.json()', () => {
    const tpl = '$input.json("$.user.name")';
    const event = { body: JSON.stringify({ user: { name: 'Alice' } }) };
    expect(renderVTL(tpl, event)).to.equal('Alice');
  });

  it('gets current HTTP method', () => {
    const tpl = 'Method: $input.method()';
    const event = { httpMethod: 'POST' };
    expect(renderVTL(tpl, event)).to.equal('Method: POST');
  });

  it('gets all input as JSON', () => {
    const tpl = '$input.all()';
    const event = {
      queryStringParameters: { a: '1' },
      pathParameters: { id: '2' },
      headers: { 'x-key': 'v' },
      body: JSON.stringify({ foo: 'bar' })
    };
    const result = JSON.parse(renderVTL(tpl, event));
    expect(result.querystring.a).to.equal('1');
    expect(result.path.id).to.equal('2');
    expect(result.header['x-key']).to.equal('v');
    expect(result.body.foo).to.equal('bar');
  });

  it('base64 encodes/decodes data', () => {
    expect(renderVTL('$util.base64Encode("hello")')).to.equal('aGVsbG8=');
    expect(renderVTL('$util.base64Decode("aGVsbG8=")')).to.equal('hello');
  });

  it('encodes/decodes URLs', () => {
    expect(renderVTL('$util.urlEncode("hello world")')).to.equal('hello%20world');
    expect(renderVTL('$util.urlDecode("hello%20world")')).to.equal('hello world');
  });

  it('parses and re-stringifies JSON correctly', () => {
    const tpl = '$util.parseJson("{\\"x\\":123}")';
    expect(renderVTL(tpl)).to.equal('{x=123}'); // VTL Json
  });

  it('returns full parsed JSON body with $input.json("$")', () => {
    const tpl = '$input.json("$").user.name';
    const event = { body: JSON.stringify({ user: { name: 'Charlie' } }) };
    expect(renderVTL(tpl, event)).to.equal('Charlie');
  });

  it('handles $context.* values correctly', () => {
    const tpl = 'ID: $context.requestId, Path: $context.path';
    const event = {
      context: {
        requestId: 'req-456',
        path: '/my/path'
      }
    };
    expect(renderVTL(tpl, event)).to.equal('ID: req-456, Path: /my/path');
  });


  it('gracefully handles bad JSON for $util.parseJson()', () => {
    const tpl = '$util.parseJson("notjson")';
    expect(renderVTL(tpl)).to.equal('null');
  });

  it('handles fallback for missing context property', () => {
    const tpl = 'Missing: $context.doesNotExist';
    expect(renderVTL(tpl)).to.equal('Missing: $context.doesNotExist');
  });

  it('renders JSON object with query param using direct call', () => {
    const tpl = '{"message": "Hello, $input.params().querystring.get("name")!"}';
    const event = { queryStringParameters: { name: 'Bob' } };
    expect(renderVTL(tpl, event)).to.equal('{"message": "Hello, Bob!"}');
  });
});
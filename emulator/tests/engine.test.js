import { expect } from 'chai';
import { renderVTL } from '../src/engine.js';

describe('Engine Template Rendering', () => {
  it('renders string with path param', () => {
    const tpl = 'Hello, $input.params().path.get("name")!';
    const event = { pathParameters: { name: 'Test' } };
    expect(renderVTL(tpl, event)).to.equal('Hello, Test!');
  });

  it('renders JSON object with interpolated path param', () => {
    const tpl = '{"user": "$input.params().path.get("name")"}';
    const event = { pathParameters: { name: 'Bob' } };
    expect(renderVTL(tpl, event)).to.equal('{"user": "Bob"}');
  });

  it('throws error if malformed template and throwOnError=true', () => {
    const tpl = '#if($input.params().header.get("key")';
    expect(() => renderVTL(tpl, {}, { throwOnError: true })).to.throw();
  });

  it('returns error string if malformed template', () => {
    const tpl = '#if($input.params().header.get("key")';
    const result = renderVTL(tpl);
    expect(result).to.include('Error:');
  });
});

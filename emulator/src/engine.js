import velocity from 'velocityjs';
import customMethodHandlers from './handlers.js';

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
}

function safeParseJson(data) {
  if (typeof data === 'object' && data !== null) return data;
  if (typeof data !== 'string') return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function buildContext(event = {}) {
  const query = event.queryStringParameters || {};
  const headers = normalizeHeaders(event.headers || {});
  const pathParams = event.pathParameters || {};
  const body = event.body || '{}';
  const parsedBody = safeParseJson(body);
  const eventContext = event.context || {};
  const stageVariables = event.stageVariables || {};

  return {
    input: {
      __type: 'input',
      query,
      headers,
      pathParams,
      parsedBody,
      event,
      body: typeof body === 'string' ? body : JSON.stringify(body)
    },
    util: {
      __type: 'util'
    },
    context: {
      __type: 'context',
      ...eventContext
    },
    stageVariables: {
      __type: 'stageVariables',
      ...stageVariables
    }
  };
}

function renderVTL(templateString, event = {}, options = {}) {
  try {
    const ctx = buildContext(event);
    const ast = velocity.parse(templateString);
    const compile = new velocity.Compile(ast, {
      preserveWhitespace: true,
      customMethodHandlers
    });
    const output = compile.render(ctx);
    return typeof output === 'string' ? output.trim() : output;
  } catch (error) {
    console.error('Error rendering VTL template:', error);
    if (options.throwOnError) throw error;
    return `Error: ${error.message}`;
  }
}

export {renderVTL};

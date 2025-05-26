import velocity from 'velocityjs';
import customMethodHandlers from './handlers.js';

/**
 * Normalizes headers by converting all keys to lowercase.
 * @param {Record<string, string>} headers
 * @returns {Record<string, string>}
 */
function normalizeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
}

/**
 * Safely parses a JSON string or returns the original object if already parsed.
 * Returns an empty object on parse failure.
 * @param {string|object} data
 * @returns {object}
 */
function safeParseJson(data) {
  if (typeof data === 'object' && data !== null) return data;
  if (typeof data !== 'string') return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Builds the Velocity rendering context, simulating API Gateway structure.
 * @param {ApiGatewayProxyEvent} [event={}] - Mocked API Gateway event object
 * @returns {object} Velocity-compatible context
 */
function buildContext(event = {}) {
  const query = event.queryStringParameters || {};
  const headers = normalizeHeaders(event.headers || {});
  const pathParams = event.pathParameters || {};
  const body = event.body || '{}';
  const parsedBody = safeParseJson(body);
  const eventContext = event.requestContext || {};
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

/**
 * Renders a Velocity Template Language (VTL) string using a simulated API Gateway context.
 * @param {string} templateString - VTL template to render
 * @param {ApiGatewayProxyEvent} [event={}] - API Gateway-like event structure
 * @param {object} [options={}] - Additional options
 * @param {boolean} [options.throwOnError=false] - Whether to throw on render error
 * @returns {string} Rendered output or error message
 */
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

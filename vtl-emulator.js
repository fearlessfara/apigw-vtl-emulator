// vtl-emulator.js
import velocity from 'velocityjs';

/**
 * Normalizes HTTP headers to lowercase keys
 * @param {Object} headers - HTTP headers object
 * @returns {Object} - Normalized headers object
 */
function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
      Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
}

/**
 * Safely parses JSON string
 * @param {string|Object} data - JSON string or object
 * @returns {Object} - Parsed object or empty object on error
 */
function safeParseJson(data) {
  if (typeof data === 'object' && data !== null) return data;
  if (typeof data !== 'string') return {};
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

/**
 * Gets a value from an object using a JSON path
 * @param {Object} obj - Object to traverse
 * @param {string} path - JSON path (only supports simple dot notation)
 * @returns {*} - Value at path or null if not found
 */
function getValueByJsonPath(obj, path) {
  if (!path || path === '$') return obj;
  if (!path.startsWith('$.')) return null;

  const segments = path.substring(2).split('.');
  let current = obj;

  for (const segment of segments) {
    if (current === undefined || current === null) return null;
    current = current[segment];
  }

  return current === undefined ? null : current;
}

/**
 * Creates a parameter accessor function that mimics AWS API Gateway behavior
 * @param {Object} params - Parameter object
 * @returns {Function} - Function that can be called with a key to get value
 */
function createParameterAccessor(params = {}) {
  const accessor = function (key) {
    if (key === undefined) return '';
    return params[key] || '';
  };

  // Add get method for compatibility
  accessor.get = function (key) {
    return params[key] || '';
  };

  return accessor;
}

/**
 * Builds the input object with methods that match API Gateway's $input variable
 * @param {Object} event - API Gateway event object
 * @returns {Object} - Input object with API Gateway compatible methods
 */
function buildInput(event = {}) {
  const query = event.queryStringParameters || {};
  const headers = normalizeHeaders(event.headers);
  const pathParams = event.pathParameters || {};
  const body = event.body || '{}';
  const parsedBody = safeParseJson(body);

  return {
    // $input.params() - returns object with parameter accessor functions
    params: function (type) {
      const collections = {
        header: createParameterAccessor(headers),
        querystring: createParameterAccessor(query),
        path: createParameterAccessor(pathParams)
      };

      if (arguments.length === 0) {
        return collections;
      }

      return collections[type] || createParameterAccessor({});
    },

    // $input.json() - gets JSON value by path
    json: (jsonPath) => {
      return getValueByJsonPath(parsedBody, jsonPath);
    },

    // $input.body - raw request body as string
    body: typeof body === 'string' ? body : JSON.stringify(body || {}),

    // $input.path() - returns request path or path parameter
    path: function () {
      if (arguments.length === 0) {
        return event.path || '/';
      }
      const key = arguments[0];
      return pathParams[key] || '';
    },

    // Direct parameter accessors
    querystring: (key) => query[key] || '',
    header: (key) => headers[key.toLowerCase()] || '',

    // HTTP method
    method: () => event.httpMethod || 'GET',

    // All parameters as JSON string
    all: () => {
      try {
        return JSON.stringify({
          body: parsedBody,
          path: pathParams,
          querystring: query,
          header: headers
        });
      } catch {
        return '{}';
      }
    }
  };
}

/**
 * Creates utility functions that match API Gateway's $util variable
 * @returns {Object} - Utility object with API Gateway compatible methods
 */
function buildUtil() {
  return {
    // String escaping for JavaScript/JSON
    escapeJavaScript: (str) => {
      if (str === null || str === undefined) return '';
      return String(str).replace(/[\\"\r\n\t\f\b]/g, match => {
        switch (match) {
          case '\\':
            return '\\\\';
          case '"':
            return '\\"';
          case '\r':
            return '\\r';
          case '\n':
            return '\\n';
          case '\t':
            return '\\t';
          case '\f':
            return '\\f';
          case '\b':
            return '\\b';
          default:
            return match;
        }
      });
    },

    // Base64 encoding/decoding
    base64Encode: (str) => {
      if (str === null || str === undefined) return '';
      return Buffer.from(String(str)).toString('base64');
    },

    base64Decode: (str) => {
      if (str === null || str === undefined) return '';
      try {
        return Buffer.from(String(str), 'base64').toString('utf-8');
      } catch (e) {
        return '';
      }
    },

    // URL encoding/decoding
    urlEncode: (str) => {
      if (str === null || str === undefined) return '';
      try {
        return encodeURIComponent(String(str));
      } catch (e) {
        return '';
      }
    },

    urlDecode: (str) => {
      if (str === null || str === undefined) return '';
      try {
        return decodeURIComponent(String(str));
      } catch (e) {
        return '';
      }
    },

    // JSON parsing/stringifying
    parseJson: (str) => {
      if (str === null || str === undefined) return null;
      try {
        return JSON.parse(str);
      } catch (e) {
        return null;
      }
    },

    toJson: (obj) => {
      if (obj === undefined) return 'null';
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return 'null';
      }
    },

    // ID generation
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    autoId: () => Math.random().toString(36).substring(2, 15),

    // Time utilities matching AWS API Gateway format
    time: {
      nowEpochMilliSeconds: () => Date.now(),
      nowEpochSeconds: () => Math.floor(Date.now() / 1000),
      nowFormatted: (format = 'yyyy-MM-dd HH:mm:ss') => {
        const now = new Date();
        return format
            .replace('yyyy', now.getFullYear())
            .replace('MM', String(now.getMonth() + 1).padStart(2, '0'))
            .replace('dd', String(now.getDate()).padStart(2, '0'))
            .replace('HH', String(now.getHours()).padStart(2, '0'))
            .replace('mm', String(now.getMinutes()).padStart(2, '0'))
            .replace('ss', String(now.getSeconds()).padStart(2, '0'));
      }
    },

    // AWS-specific utilities
    matches: (str, pattern) => {
      if (str === null || str === undefined) return false;
      try {
        const regex = new RegExp(pattern);
        return regex.test(String(str));
      } catch (e) {
        return false;
      }
    }
  };
}

/**
 * Builds context object that matches API Gateway's $context variable
 * @param {Object} customContext - Custom context properties
 * @returns {Object} - Context object with API Gateway compatible properties
 */
function buildContext(customContext = {}) {
  const defaultContext = {
    accountId: 'test-account',
    apiId: 'test-api',
    requestId: 'test-request-id',
    resourceId: 'test-resource-id',
    resourcePath: '/test',
    httpMethod: 'GET',
    stage: 'test',
    requestTime: new Date().toISOString(),
    requestTimeEpoch: Math.floor(Date.now() / 1000),
    protocol: 'HTTP/1.1',
    domainName: 'example.com',
    domainPrefix: 'api'
  };

  const identity = {
    cognitoIdentityId: null,
    cognitoIdentityPoolId: null,
    cognitoAuthenticationType: null,
    cognitoAuthenticationProvider: null,
    accountId: null,
    sourceIp: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    userArn: null,
    caller: null,
    user: null,
    accessKey: null,
    ...(customContext.identity || {})
  };

  return {
    ...defaultContext,
    ...customContext,
    identity,
    authorizer: customContext.authorizer || {}
  };
}

/**
 * Renders a VTL template with API Gateway context
 * @param {string} templateString - Raw VTL template string
 * @param {Object} event - API Gateway event object
 * @param {Object} options - Additional options for rendering
 * @returns {string} - Rendered template result
 */
function renderVTL(templateString, event = {}, options = {}) {
  try {
    if (typeof templateString !== 'string') {
      throw new Error('Template must be a string');
    }

    const context = {
      input: buildInput(event),
      util: buildUtil(),
      context: buildContext(event.context),
      stageVariables: event.stageVariables || {},
      ...options.additionalContext
    };

    // Custom macros for API Gateway compatibility
    const macros = {
      // Add any specific AWS API Gateway macros here
      ...options.macros
    };

    const result = velocity.render(templateString, context, macros);

    // Trim whitespace that VTL might introduce
    return options.preserveWhitespace ? result : result.trim();

  } catch (error) {
    console.error('Error rendering VTL template:', error);
    if (options.throwOnError) {
      throw error;
    }
    return `Error: ${error.message}`;
  }
}

export {renderVTL, buildInput, buildUtil, buildContext};
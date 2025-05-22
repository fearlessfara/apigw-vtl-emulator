function getValueByJsonPath(obj, path) {
  if (!path || path === '$') return obj;
  if (!path.startsWith('$.')) return null;
  const segments = path.slice(2).split('.');
  return segments.reduce((o, s) => (o ? o[s] : null), obj);
}

const customMethodHandlers = [
  {
    uid: 'input.params.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'params',
    resolve: ({context}) => ({
      header: {get: (key) => context.headers?.[key.toLowerCase()] || ''},
      querystring: {get: (key) => context.query?.[key] || ''},
      path: {get: (key) => context.pathParams?.[key] || ''}
    })
  },
  {
    uid: 'input.json.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'json',
    resolve: ({context, params}) => getValueByJsonPath(context.parsedBody, params[0])
  },
  {
    uid: 'input.body.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'body',
    resolve: ({context}) => typeof context.event.body === 'string' ? context.event.body : JSON.stringify(context.event.body)
  },
  {
    uid: 'input.path.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'path',
    resolve: ({
                context,
                params
              }) => params.length > 0 ? context.pathParams?.[params[0]] || '' : context.event.path || '/'
  },
  {
    uid: 'input.querystring.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'querystring',
    resolve: ({context, params}) => context.query?.[params[0]] || ''
  },
  {
    uid: 'input.header.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'header',
    resolve: ({context, params}) => context.headers?.[params[0].toLowerCase()] || ''
  },
  {
    uid: 'input.method.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'method',
    resolve: ({context}) => context.event.httpMethod || 'GET'
  },
  {
    uid: 'input.all.handler',
    match: ({property, context}) => context?.__type === 'input' && property === 'all',
    resolve: ({context}) => JSON.stringify({
      body: context.parsedBody,
      path: context.pathParams,
      querystring: context.query,
      header: context.headers
    })
  },

  // $util methods
  {
    uid: 'util.escapeJavaScript',
    match: ({ property }) => property === 'escapeJavaScript',
    resolve: ({ params }) => {
      const raw = JSON.stringify(params[0] ?? {});
      return raw.replace(/["'\\\r\n\t\f\b]/g, (c) => ({
        '\\': '\\\\',
        '"': '\\"',
        "'": "\\'",
        '\r': '\\r',
        '\n': '\\n',
        '\t': '\\t',
        '\f': '\\f',
        '\b': '\\b'
      })[c] || c);
    }
  },
  {
    uid: 'util.base64Encode',
    match: ({property}) => property === 'base64Encode',
    resolve: ({params}) => Buffer.from(String(params[0] ?? '')).toString('base64')
  },
  {
    uid: 'util.base64Decode',
    match: ({property}) => property === 'base64Decode',
    resolve: ({params}) => Buffer.from(String(params[0] ?? ''), 'base64').toString('utf-8')
  },
  {
    uid: 'util.urlEncode',
    match: ({property}) => property === 'urlEncode',
    resolve: ({params}) => encodeURIComponent(params[0] ?? '')
  },
  {
    uid: 'util.urlDecode',
    match: ({property}) => property === 'urlDecode',
    resolve: ({params}) => decodeURIComponent(params[0] ?? '')
  },
  {
    uid: 'util.parseJson',
    match: ({property}) => property === 'parseJson',
    resolve: ({params}) => {
      try {
        return JSON.parse(params[0]);
      } catch {
        return null;
      }
    }
  },

  // context.* properties (read-only)
  ...[
    'accountId', 'apiId', 'authorizer', 'domainName', 'domainPrefix', 'extendedRequestId', 'httpMethod', 'identity',
    'path', 'protocol', 'requestId', 'requestTime', 'requestTimeEpoch', 'resourceId', 'resourcePath', 'stage'
  ].map(key => ({
    uid: `context.${key}`,
    match: ({property, context}) => context?.__type === 'context' && property === key,
    resolve: ({context}) => context?.eventContext?.[key] ?? ''
  }))
];

export default customMethodHandlers;

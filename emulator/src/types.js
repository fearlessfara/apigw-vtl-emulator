/**
 * @typedef {Object} ApiGatewayProxyEvent
 * @property {string} version
 * @property {string} resource
 * @property {string} path
 * @property {string} httpMethod
 * @property {Object.<string, string>} [headers]
 * @property {Object.<string, string[]>} [multiValueHeaders]
 * @property {Object.<string, string>} [queryStringParameters]
 * @property {Object.<string, string[]>} [multiValueQueryStringParameters]
 * @property {Object.<string, string>|null} [pathParameters]
 * @property {Object.<string, string>|null} [stageVariables]
 * @property {string|null} body
 * @property {boolean} isBase64Encoded
 * @property {ApiGatewayRequestContext} requestContext
 */

/**
 * @typedef {Object} ApiGatewayRequestContext
 * @property {string} accountId
 * @property {string} apiId
 * @property {string} domainName
 * @property {string} domainPrefix
 * @property {string} extendedRequestId
 * @property {string} httpMethod
 * @property {ApiGatewayIdentity} identity
 * @property {string} path
 * @property {string} protocol
 * @property {string} requestId
 * @property {string} requestTime
 * @property {number} requestTimeEpoch
 * @property {string|null} resourceId
 * @property {string} resourcePath
 * @property {string} stage
 * @property {ApiGatewayAuthorizer} [authorizer]
 */

/**
 * @typedef {Object} ApiGatewayIdentity
 * @property {string|null} accessKey
 * @property {string|null} accountId
 * @property {string|null} caller
 * @property {string|null} cognitoAuthenticationProvider
 * @property {string|null} cognitoAuthenticationType
 * @property {string|null} cognitoIdentityId
 * @property {string|null} cognitoIdentityPoolId
 * @property {string|null} principalOrgId
 * @property {string} sourceIp
 * @property {string|null} user
 * @property {string|null} userAgent
 * @property {string|null} userArn
 * @property {Object} [clientCert]
 * @property {string} clientCert.clientCertPem
 * @property {string} clientCert.subjectDN
 * @property {string} clientCert.issuerDN
 * @property {string} clientCert.serialNumber
 * @property {Object} clientCert.validity
 * @property {string} clientCert.validity.notBefore
 * @property {string} clientCert.validity.notAfter
 */

/**
 * @typedef {Object} ApiGatewayAuthorizer
 * @property {Object.<string, string>|null} [claims]
 * @property {string[]|null} [scopes]
 */

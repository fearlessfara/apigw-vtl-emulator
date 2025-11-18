/**
 * Context functions for AWS API Gateway VTL templates ($context.*)
 * Matches the behavior of the Java implementation
 */

/**
 * Client certificate validity context
 */
class ValidityContext {
  getNotBefore(): string {
    return 'Jan 01 00:00:00 2023 GMT';
  }

  getNotAfter(): string {
    return 'Jan 01 00:00:00 2024 GMT';
  }
}

/**
 * Client certificate context
 */
class ClientCertContext {
  getClientCertPem(): string {
    return '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/OvK5tYzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\n-----END CERTIFICATE-----';
  }

  getSubjectDN(): string {
    return 'CN=example.com, O=Example Corp, C=US';
  }

  getIssuerDN(): string {
    return 'CN=Example CA, O=Example Corp, C=US';
  }

  getSerialNumber(): string {
    return '1234567890123456789012345678901234567890';
  }

  getValidity(): ValidityContext {
    return new ValidityContext();
  }
}

/**
 * Identity context ($context.identity.*)
 */
class IdentityContext {
  private context: Record<string, any>;

  constructor(context: Record<string, any>) {
    this.context = context;
  }

  private getIdentityMap(): Record<string, any> {
    if (this.context.identity && typeof this.context.identity === 'object') {
      return this.context.identity;
    }
    return {};
  }

  getAccountId(): string {
    const identity = this.getIdentityMap();
    return identity.accountId ? String(identity.accountId) : '123456789012';
  }

  getApiKey(): string | null {
    const identity = this.getIdentityMap();
    return identity.apiKey ? String(identity.apiKey) : null;
  }

  getApiKeyId(): string | null {
    const identity = this.getIdentityMap();
    return identity.apiKeyId ? String(identity.apiKeyId) : null;
  }

  getCaller(): string {
    const identity = this.getIdentityMap();
    return identity.caller ? String(identity.caller) : 'AIDACKCEVSQ6C2EXAMPLE';
  }

  getCognitoAuthenticationProvider(): string {
    return 'cognito-idp.us-east-1.amazonaws.com/us-east-1_example,cognito-idp.us-east-1.amazonaws.com/us-east-1_example:CognitoSignIn:user123';
  }

  getCognitoAuthenticationType(): string {
    return 'authenticated';
  }

  getCognitoIdentityId(): string {
    return 'us-east-1:12345678-1234-1234-1234-123456789012';
  }

  getCognitoIdentityPoolId(): string {
    return 'us-east-1:12345678-1234-1234-1234-123456789012';
  }

  getPrincipalOrgId(): string {
    return 'o-1234567890';
  }

  getSourceIp(): string {
    const identity = this.getIdentityMap();
    return identity.sourceIp ? String(identity.sourceIp) : '192.0.2.1';
  }

  getUser(): string {
    const identity = this.getIdentityMap();
    return identity.user ? String(identity.user) : 'AIDACKCEVSQ6C2EXAMPLE';
  }

  getUserAgent(): string {
    const identity = this.getIdentityMap();
    return identity.userAgent
      ? String(identity.userAgent)
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  }

  getUserArn(): string {
    const identity = this.getIdentityMap();
    return identity.userArn
      ? String(identity.userArn)
      : 'arn:aws:iam::123456789012:user/example-user';
  }

  getVpcId(): string {
    return 'vpc-12345678';
  }

  getVpceId(): string {
    return 'vpce-12345678';
  }

  getClientCert(): ClientCertContext {
    return new ClientCertContext();
  }
}

/**
 * Authorizer context ($context.authorizer.*)
 */
class AuthorizerContext {
  private context: Record<string, any>;

  constructor(context: Record<string, any>) {
    this.context = context;
  }

  getPrincipalId(): string {
    return this.context.principalId ? String(this.context.principalId) : 'user123';
  }

  getClaims(): null {
    return null; // Returns null as per documentation
  }

  // Dynamic property access for authorizer context
  get(property: string): string | null {
    if (this.context[property] !== undefined) {
      return String(this.context[property]);
    }

    // Simulate authorizer context map
    const authorizerContext: Record<string, any> = {
      key: 'value',
      numKey: 1,
      boolKey: true,
      user_id: '12345',
      scope: 'read write',
    };

    const value = authorizerContext[property];
    return value !== undefined ? String(value) : null;
  }
}

/**
 * Error context ($context.error.*)
 */
class ErrorContext {
  getMessage(): string {
    return 'Internal server error';
  }

  getMessageString(): string {
    return '"Internal server error"';
  }

  getResponseType(): string {
    return 'DEFAULT_5XX';
  }

  getValidationErrorString(): string {
    return 'Validation error: Invalid parameter value';
  }
}

/**
 * Request override header context
 */
class RequestOverrideHeaderContext {
  get(headerName: string): string | null {
    // Simulate header overrides
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer override-token',
    };
    return headers[headerName] || null;
  }
}

/**
 * Request override path context
 */
class RequestOverridePathContext {
  get(pathName: string): string | null {
    // Simulate path overrides
    const paths: Record<string, string> = {
      id: 'override-id',
      version: 'v2',
    };
    return paths[pathName] || null;
  }
}

/**
 * Request override querystring context
 */
class RequestOverrideQuerystringContext {
  get(querystringName: string): string | null {
    // Simulate querystring overrides
    const querystrings: Record<string, string> = {
      filter: 'override-filter',
      sort: 'desc',
    };
    return querystrings[querystringName] || null;
  }
}

/**
 * Request override context ($context.requestOverride.*)
 */
class RequestOverrideContext {
  getHeader(): RequestOverrideHeaderContext {
    return new RequestOverrideHeaderContext();
  }

  getPath(): RequestOverridePathContext {
    return new RequestOverridePathContext();
  }

  getQuerystring(): RequestOverrideQuerystringContext {
    return new RequestOverrideQuerystringContext();
  }
}

/**
 * Response override header context
 */
class ResponseOverrideHeaderContext {
  get(headerName: string): string | null {
    // Simulate response header overrides
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache',
      'X-Custom-Header': 'override-value',
    };
    return headers[headerName] || null;
  }
}

/**
 * Response override context ($context.responseOverride.*)
 */
class ResponseOverrideContext {
  getStatus(): string {
    return '200';
  }

  getHeader(): ResponseOverrideHeaderContext {
    return new ResponseOverrideHeaderContext();
  }
}

/**
 * Main context functions class
 */
export class ContextFunctions {
  private context: Record<string, any>;

  constructor(context: Record<string, any>) {
    this.context = context;
  }

  // Basic context properties
  getAccountId(): string {
    return this.context.accountId ? String(this.context.accountId) : '123456789012';
  }

  getApiId(): string {
    return this.context.apiId ? String(this.context.apiId) : 'abc123def4';
  }

  getRequestId(): string {
    return this.context.requestId
      ? String(this.context.requestId)
      : `test-request-id-${Date.now()}`;
  }

  getExtendedRequestId(): string {
    return this.context.extendedRequestId
      ? String(this.context.extendedRequestId)
      : `test-extended-request-id-${Date.now()}`;
  }

  getAwsEndpointRequestId(): string {
    return this.context.awsEndpointRequestId
      ? String(this.context.awsEndpointRequestId)
      : this.context.extendedRequestId
      ? String(this.context.extendedRequestId)
      : `test-aws-endpoint-request-id-${Date.now()}`;
  }

  getHttpMethod(): string {
    return this.context.httpMethod ? String(this.context.httpMethod) : 'GET';
  }

  getStage(): string {
    return this.context.stage ? String(this.context.stage) : 'test';
  }

  getDeploymentId(): string {
    return this.context.deploymentId ? String(this.context.deploymentId) : 'deployment-123';
  }

  getDomainName(): string {
    return this.context.domainName
      ? String(this.context.domainName)
      : 'abc123def4.execute-api.us-east-1.amazonaws.com';
  }

  getDomainPrefix(): string {
    return this.context.domainPrefix ? String(this.context.domainPrefix) : 'abc123def4';
  }

  getPath(): string {
    return this.context.path ? String(this.context.path) : '/test/resource';
  }

  getProtocol(): string {
    return this.context.protocol ? String(this.context.protocol) : 'HTTP/1.1';
  }

  getResourceId(): string {
    return this.context.resourceId ? String(this.context.resourceId) : 'resource-123';
  }

  getResourcePath(): string {
    return this.context.resourcePath ? String(this.context.resourcePath) : '/resource';
  }

  getRequestTime(): string {
    const now = new Date();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = String(now.getUTCDate()).padStart(2, '0');
    const month = months[now.getUTCMonth()];
    const year = now.getUTCFullYear();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} +0000`;
  }

  getRequestTimeEpoch(): number {
    return Date.now();
  }

  getIsCanaryRequest(): boolean {
    return false;
  }

  getWafResponseCode(): string {
    return this.context.wafResponseCode ? String(this.context.wafResponseCode) : 'WAF_ALLOW';
  }

  getWebaclArn(): string {
    return this.context.webaclArn
      ? String(this.context.webaclArn)
      : 'arn:aws:wafv2:us-east-1:123456789012:regional/webacl/test-webacl/12345678-1234-1234-1234-123456789012';
  }

  // Identity context
  getIdentity(): IdentityContext {
    return new IdentityContext(this.context);
  }

  // Authorizer context
  getAuthorizer(): AuthorizerContext {
    return new AuthorizerContext(this.context);
  }

  // Error context
  getError(): ErrorContext {
    return new ErrorContext();
  }

  // Request/Response override context
  getRequestOverride(): RequestOverrideContext {
    return new RequestOverrideContext();
  }

  getResponseOverride(): ResponseOverrideContext {
    return new ResponseOverrideContext();
  }
}

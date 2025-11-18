import { VelocityEngine } from '@fearlessfara/velocits';
import { InputFunctions } from './InputFunctions';
import { UtilFunctions } from './UtilFunctions';
import { ContextFunctions } from './ContextFunctions';

/**
 * VTL Processor using velocits engine
 * Matches the behavior of the Java implementation
 */
export class VTLProcessor {
  private velocityEngine: VelocityEngine;

  constructor() {
    this.velocityEngine = new VelocityEngine();
  }

  /**
   * Process a VTL template with input and context
   * @param template - The VTL template string
   * @param inputString - The raw input/body string (defaults to empty string)
   * @param contextJson - The context JSON string (defaults to empty object)
   * @returns The processed output string
   */
  process(template: string, inputString: string = '', contextJson: string = '{}'): string {
    try {
      // Parse context JSON
      const context: Record<string, any> = JSON.parse(contextJson);

      // Parse input as JSON if possible, otherwise treat as empty object
      let input: Record<string, any>;
      try {
        input = JSON.parse(inputString);
      } catch (e) {
        input = {};
      }

      // Store the original input string for body() function
      context.body = inputString;
      context.input = input;

      // Create velocity context with all variables
      const velocityContext: Record<string, any> = { ...context };

      // Add API Gateway custom functions as objects
      this.addApiGatewayFunctions(velocityContext, context, input, inputString);

      // Render the template
      let output = this.velocityEngine.render(template, velocityContext);

      // Try to minify if output is valid JSON
      try {
        const json = JSON.parse(output);
        return JSON.stringify(json);
      } catch (e) {
        // Not valid JSON, return as is
        return output;
      }
    } catch (e) {
      const error = e as Error;
      return `Error processing template: ${error.message}`;
    }
  }

  /**
   * Add AWS API Gateway custom functions to the velocity context
   */
  private addApiGatewayFunctions(
    velocityContext: Record<string, any>,
    context: Record<string, any>,
    input: Record<string, any>,
    inputString: string
  ): void {
    // Create instances of custom function classes
    const inputFunctions = new InputFunctions(context, input, inputString);
    const utilFunctions = new UtilFunctions();
    const contextFunctions = new ContextFunctions(context);

    // For velocits to work properly, we need to expose methods and properties
    // in a way that VTL can access them

    // $input - Expose methods and properties
    velocityContext.input = this.createInputObject(inputFunctions);

    // $util - Expose methods directly
    velocityContext.util = utilFunctions;

    // $context - Convert getter methods to properties for VTL access
    velocityContext.context = this.createContextObject(contextFunctions);
  }

  /**
   * Create an input object that exposes both methods and properties
   * This allows VTL to access $input.body as a property and $input.json() as a method
   */
  private createInputObject(inputFunctions: InputFunctions): any {
    return {
      // Expose body as a property
      body: inputFunctions.body(),
      // Expose methods
      json: (path: string) => inputFunctions.json(path),
      path: (path: string) => inputFunctions.path(path),
      params: (paramName?: string) => inputFunctions.params(paramName as any),
      headers: (headerName: string) => inputFunctions.headers(headerName),
      size: () => inputFunctions.size(),
      getBody: () => inputFunctions.getBody(),
    };
  }

  /**
   * Convert a ContextFunctions object to a plain object with properties
   * This allows VTL to access $context.identity.sourceIp as a property path
   */
  private createContextObject(contextFunctions: ContextFunctions): any {
    const contextObj: any = {};

    // Basic properties - map getters to properties
    contextObj.accountId = contextFunctions.getAccountId();
    contextObj.apiId = contextFunctions.getApiId();
    contextObj.requestId = contextFunctions.getRequestId();
    contextObj.extendedRequestId = contextFunctions.getExtendedRequestId();
    contextObj.awsEndpointRequestId = contextFunctions.getAwsEndpointRequestId();
    contextObj.httpMethod = contextFunctions.getHttpMethod();
    contextObj.stage = contextFunctions.getStage();
    contextObj.deploymentId = contextFunctions.getDeploymentId();
    contextObj.domainName = contextFunctions.getDomainName();
    contextObj.domainPrefix = contextFunctions.getDomainPrefix();
    contextObj.path = contextFunctions.getPath();
    contextObj.protocol = contextFunctions.getProtocol();
    contextObj.resourceId = contextFunctions.getResourceId();
    contextObj.resourcePath = contextFunctions.getResourcePath();
    contextObj.requestTime = contextFunctions.getRequestTime();
    contextObj.requestTimeEpoch = contextFunctions.getRequestTimeEpoch();
    contextObj.isCanaryRequest = contextFunctions.getIsCanaryRequest();
    contextObj.wafResponseCode = contextFunctions.getWafResponseCode();
    contextObj.webaclArn = contextFunctions.getWebaclArn();

    // Nested objects - convert to plain objects
    const identity = contextFunctions.getIdentity();
    contextObj.identity = {
      accountId: identity.getAccountId(),
      apiKey: identity.getApiKey(),
      apiKeyId: identity.getApiKeyId(),
      caller: identity.getCaller(),
      cognitoAuthenticationProvider: identity.getCognitoAuthenticationProvider(),
      cognitoAuthenticationType: identity.getCognitoAuthenticationType(),
      cognitoIdentityId: identity.getCognitoIdentityId(),
      cognitoIdentityPoolId: identity.getCognitoIdentityPoolId(),
      principalOrgId: identity.getPrincipalOrgId(),
      sourceIp: identity.getSourceIp(),
      user: identity.getUser(),
      userAgent: identity.getUserAgent(),
      userArn: identity.getUserArn(),
      vpcId: identity.getVpcId(),
      vpceId: identity.getVpceId(),
      clientCert: (() => {
        const clientCert = identity.getClientCert();
        return {
          clientCertPem: clientCert.getClientCertPem(),
          subjectDN: clientCert.getSubjectDN(),
          issuerDN: clientCert.getIssuerDN(),
          serialNumber: clientCert.getSerialNumber(),
          validity: (() => {
            const validity = clientCert.getValidity();
            return {
              notBefore: validity.getNotBefore(),
              notAfter: validity.getNotAfter(),
            };
          })(),
        };
      })(),
    };

    const authorizer = contextFunctions.getAuthorizer();
    contextObj.authorizer = {
      principalId: authorizer.getPrincipalId(),
      claims: authorizer.getClaims(),
      // Dynamic property access
      get: (property: string) => authorizer.get(property),
    };

    const error = contextFunctions.getError();
    contextObj.error = {
      message: error.getMessage(),
      messageString: error.getMessageString(),
      responseType: error.getResponseType(),
      validationErrorString: error.getValidationErrorString(),
    };

    const requestOverride = contextFunctions.getRequestOverride();
    contextObj.requestOverride = {
      header: {
        get: (name: string) => requestOverride.getHeader().get(name),
      },
      path: {
        get: (name: string) => requestOverride.getPath().get(name),
      },
      querystring: {
        get: (name: string) => requestOverride.getQuerystring().get(name),
      },
    };

    const responseOverride = contextFunctions.getResponseOverride();
    contextObj.responseOverride = {
      status: responseOverride.getStatus(),
      header: {
        get: (name: string) => responseOverride.getHeader().get(name),
      },
    };

    return contextObj;
  }
}

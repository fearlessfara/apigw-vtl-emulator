/**
 * Vela VTL Processor Adapter
 * 
 * This adapter integrates the @fearlessfara/vela engine from npm
 * to provide VTL processing capabilities in the browser.
 */

class VelaAdapter extends VTLProcessorAdapter {
  constructor() {
    super();
    this.renderTemplate = null;
    this.usingFallback = false;
  }

  async init() {
    if (this.initializing) {
      return;
    }
    
    this.initializing = true;
    
    try {
      let velaModule;
      
        // Check for Vela in global scope (UMD build)
        if (typeof window !== 'undefined' && window.Vela) {
          velaModule = window.Vela;
        } else {
          velaModule = this.createFallbackVTL();
          this.usingFallback = true;
        }

        // Check if Vela has the VtlEngine class or renderTemplate method
        if (velaModule && (velaModule.VtlEngine || velaModule.renderTemplate)) {
          if (velaModule.VtlEngine) {
            this.VtlEngine = velaModule.VtlEngine;
          } else {
            this.renderTemplate = velaModule.renderTemplate;
          }
        } else {
          velaModule = this.createFallbackVTL();
          this.renderTemplate = velaModule.renderTemplate;
          this.usingFallback = true;
        }
      
      this.ready = true;
      
    } catch (error) {
      // Create a fallback implementation
      const fallback = this.createFallbackVTL();
      this.renderTemplate = fallback.renderTemplate;
      this.usingFallback = true;
      this.ready = true;
    } finally {
      this.initializing = false;
    }
  }

  async processTemplate(template, body, context) {
    if (!this.ready) {
      await this.init();
    }
    
    // Parse context and body for Vela
    let contextObj = {};
    let bodyObj = {};
    
    try {
      if (context && context.trim()) {
        contextObj = JSON.parse(context);
      }
    } catch (error) {
      // Ignore parsing errors, use empty object
    }
    
    try {
      if (body && body.trim()) {
        bodyObj = JSON.parse(body);
      }
    } catch (error) {
      // Ignore parsing errors, use empty object
    }

    try {
      if (this.renderTemplate && !this.usingFallback) {
        // Create proper API Gateway event structure
        const apiGatewayEvent = {
          requestContext: {
            requestId: contextObj.requestId || 'test-request-id',
            stage: contextObj.stage || 'dev',
            ...contextObj
          },
          body: body,
          headers: contextObj.headers || {},
          pathParameters: contextObj.pathParameters || {},
          queryStringParameters: contextObj.queryStringParameters || {},
          stageVariables: contextObj.stageVariables || {}
        };
        
        // Convert CheerpJ template syntax to Vela syntax
        let velaTemplate = template;
        velaTemplate = velaTemplate.replace(/\$input\.json\("\$"\)/g, '$input.body');
        
        let result;
        if (this.VtlEngine) {
          // Use VtlEngine class
          const engine = new this.VtlEngine();
          result = engine.renderTemplate({
            template: velaTemplate,
            event: apiGatewayEvent,
            flags: { APIGW_CONTEXT: 'ON' }
          });
        } else if (this.renderTemplate) {
          // Use renderTemplate method
          result = this.renderTemplate({
            template: velaTemplate,
            event: apiGatewayEvent,
            flags: { APIGW_CONTEXT: 'ON' }
          });
        } else {
          throw new Error('No Vela engine method available');
        }
        
        // Handle different result formats
        if (typeof result === 'string') {
          return result;
        } else if (result && typeof result === 'object') {
          // Handle Vela result format: {output: string, errors: Array}
          if (result.output !== undefined) {
            if (result.errors && result.errors.length > 0) {
              console.warn('Vela processing errors:', result.errors);
            }
            return result.output;
          } else {
            // Fallback for other object formats
            return JSON.stringify(result, null, 2);
          }
        } else {
          return String(result);
        }
      } else {
        // Use fallback implementation
        return this.createFallbackVTL().renderTemplate(template, {
          $input: {
            json: (path) => {
              if (path === '$' || path === '') return bodyObj;
              return this.getJsonPathValue(bodyObj, path);
            },
            params: (name) => contextObj[name] || '',
            body: body,
            path: (path) => contextObj[path] || ''
          },
          $context: contextObj,
          $util: {
            escapeJavaScript: (str) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"'),
            urlEncode: (str) => encodeURIComponent(str),
            urlDecode: (str) => decodeURIComponent(str)
          }
        });
      }
    } catch (error) {
      console.error('Vela VTL processing error:', error);
      return `Error processing template with Vela: ${error.message}`;
    }
  }

  getJsonPathValue(obj, path) {
    // Simple JSONPath implementation
    if (path.startsWith('$.')) {
      path = path.substring(2);
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return '';
      }
    }
    
    return current || '';
  }

  createFallbackVTL() {
    // Simple fallback VTL implementation
    return {
      renderTemplate: async (template, context) => {
        let result = template;
        
        // Simple variable substitution
        result = result.replace(/\$input\.json\("([^"]+)"\)/g, (match, path) => {
          const value = context.$input?.json?.(path) || '';
          return typeof value === 'object' ? JSON.stringify(value) : value;
        });
        
        result = result.replace(/\$input\.params\("([^"]+)"\)/g, (match, name) => {
          return context.$input?.params?.(name) || '';
        });
        
        result = result.replace(/\$input\.body/g, () => {
          return context.$input?.body || '';
        });
        
        result = result.replace(/\$context\.([a-zA-Z0-9_.]+)/g, (match, path) => {
          const keys = path.split('.');
          let current = context.$context;
          for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
              current = current[key];
            } else {
              return '';
            }
          }
          return current || '';
        });
        
        result = result.replace(/\$util\.escapeJavaScript\("([^"]+)"\)/g, (match, str) => {
          return context.$util?.escapeJavaScript?.(str) || str;
        });
        
        result = result.replace(/\$util\.urlEncode\("([^"]+)"\)/g, (match, str) => {
          return context.$util?.urlEncode?.(str) || str;
        });
        
        result = result.replace(/\$util\.urlDecode\("([^"]+)"\)/g, (match, str) => {
          return context.$util?.urlDecode?.(str) || str;
        });
        
        return result;
      }
    };
  }

  getBackendType() {
    return 'vela';
  }

  getDisplayName() {
    return this.usingFallback ? 'Vela (Fallback)' : 'Vela (JavaScript)';
  }

  getDescription() {
    return this.usingFallback ? 
      'Fallback VTL implementation (Vela engine not available)' : 
      'Pure JavaScript VTL processor with high performance';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: true,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: true,
      performance: 'fast',
      size: 'small',
      experimental: true,
      features: ['Pure JavaScript', 'Fast execution', 'Small bundle size', 'Modern ES6+', 'Experimental']
    };
  }
}

// Make the class available globally
if (typeof window !== 'undefined') {
  window.VelaAdapter = VelaAdapter;
}

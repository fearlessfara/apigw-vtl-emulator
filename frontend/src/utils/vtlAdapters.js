// Base adapter class
export class VTLProcessorAdapter {
  constructor() {
    this.ready = false;
    this.initializing = false;
  }

  async init() {
    throw new Error('init() method must be implemented by subclass');
  }

  async processTemplate(template, body, context) {
    throw new Error('processTemplate() method must be implemented by subclass');
  }

  getBackendType() {
    throw new Error('getBackendType() method must be implemented by subclass');
  }

  isReady() {
    return this.ready;
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: false,
      supportsVelocityDirectives: false,
      supportsApiGatewayFunctions: false,
      performance: 'unknown',
      size: 'unknown'
    };
  }

  getDisplayName() {
    return this.getBackendType();
  }
}

// CheerpJ Adapter
export class CheerpJAdapter extends VTLProcessorAdapter {
  constructor() {
    super();
    this.vtlProcessor = null;
    this.VTLProcessorClass = null;
    this.lib = null;
  }

  async init() {
    if (this.initializing) {
      return;
    }
    
    this.initializing = true;
    
    try {
      if (!window.cheerpjInitialized) {
        console.log('Initializing CheerpJ Java runtime...');
        await cheerpjInit({version: 17});
        window.cheerpjInitialized = true;
      }
      
      if (!this.lib) {
        // Try different paths for different deployment scenarios
        const possiblePaths = [
          '/vtl-processor.jar',
          '/assets/vtl-processor.jar',
          '/app/emulator/target/vtl-processor.jar'
        ];
        
        let lib = null;
        for (const jarPath of possiblePaths) {
          try {
            lib = await cheerpjRunLibrary(jarPath);
            break;
          } catch (error) {
            console.warn(`Failed to load JAR from ${jarPath}:`, error);
          }
        }
        
        if (!lib) {
          throw new Error('Could not load vtl-processor.jar from any known location');
        }
        
        this.lib = lib;
      }
      
      if (!this.VTLProcessorClass) {
        this.VTLProcessorClass = await this.lib.com.example.VTLProcessor;
      }
      
      if (!this.vtlProcessor) {
        this.vtlProcessor = await new this.VTLProcessorClass();
      }
      
      this.ready = true;
      console.log('CheerpJ VTL Adapter initialized successfully');
      
    } catch (error) {
      console.error('Error initializing CheerpJ Adapter:', error);
      this.ready = false;
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  async processTemplate(template, body, context) {
    if (!this.ready) {
      await this.init();
    }
    
    if (!this.vtlProcessor) {
      throw new Error('CheerpJ VTL processor not initialized');
    }
    
    const result = await this.vtlProcessor.process(template, body, context);
    return result;
  }

  getBackendType() {
    return 'cheerpj';
  }

  getDisplayName() {
    return 'CheerpJ (Java)';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: true,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: true,
      performance: 'medium',
      size: 'large',
      experimental: false
    };
  }
}

// Vela Adapter
export class VelaAdapter extends VTLProcessorAdapter {
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
      
      if (typeof window !== 'undefined' && window.Vela) {
        velaModule = window.Vela;
      } else {
        velaModule = this.createFallbackVTL();
        this.usingFallback = true;
      }

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
      const fallback = this.createFallbackVTL();
      this.renderTemplate = fallback.renderTemplate;
      this.usingFallback = true;
      this.ready = true;
    } finally {
      this.initializing = false;
    }
  }

  createFallbackVTL() {
    return {
      renderTemplate: (template, context) => {
        // Simple fallback - just return template as-is
        console.warn('Using fallback VTL processor');
        return template;
      }
    };
  }

  async processTemplate(template, body, context) {
    if (!this.ready) {
      await this.init();
    }
    
    let contextObj = {};
    let bodyObj = {};
    
    try {
      if (context && context.trim()) {
        contextObj = JSON.parse(context);
      }
    } catch (error) {
      // Ignore
    }
    
    try {
      if (body && body.trim()) {
        bodyObj = JSON.parse(body);
      }
    } catch (error) {
      // Ignore
    }

    try {
      if (this.renderTemplate && !this.usingFallback) {
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
        
        const result = await this.renderTemplate(template, apiGatewayEvent);
        return result;
      } else {
        return this.renderTemplate(template, {});
      }
    } catch (error) {
      throw new Error(`Vela processing error: ${error.message}`);
    }
  }

  getBackendType() {
    return 'vela';
  }

  getDisplayName() {
    return 'Vela (JavaScript)';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: false,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: false,
      performance: 'fast',
      size: 'small',
      experimental: true
    };
  }
}


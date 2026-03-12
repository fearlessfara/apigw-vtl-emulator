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

// Velocits Adapter (TypeScript/JavaScript implementation)
export class VelocitsAdapter extends VTLProcessorAdapter {
  constructor() {
    super();
    this.processor = null;
  }

  async init() {
    if (this.ready) {
      return;
    }

    if (this.initializing) {
      // Wait for existing initialization to complete
      await new Promise((resolve) => {
        const checkReady = () => {
          if (this.ready || !this.initializing) {
            resolve();
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
      });
      return;
    }

    this.initializing = true;

    try {
      // Dynamically import the TypeScript VTL processor
      const { VTLProcessor } = await import('apigw-vtl-emulator');
      this.processor = new VTLProcessor();
      this.ready = true;
      console.log('Velocits VTL Adapter initialized successfully');
    } catch (error) {
      console.error('Error initializing Velocits Adapter:', error);
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

    if (!this.processor) {
      throw new Error('Velocits VTL processor not initialized');
    }

    try {
      // The TypeScript processor expects: template, inputString, contextJson
      const result = this.processor.process(template, body, context);
      return result;
    } catch (error) {
      throw new Error(`Velocits processing error: ${error.message}`);
    }
  }

  getBackendType() {
    return 'velocits';
  }

  getDisplayName() {
    return 'Velocits (TypeScript)';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: true,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: true,
      performance: 'fast',
      size: 'medium',
      experimental: false
    };
  }
}


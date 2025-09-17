/**
 * CheerpJ VTL Processor Adapter
 * 
 * This adapter wraps the existing CheerpJ integration to provide
 * a consistent interface with other VTL engines.
 */

class CheerpJAdapter extends VTLProcessorAdapter {
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
        // Use the correct path for GitHub Pages deployment
        const jarPath = window.location.hostname === 'fearlessfara.github.io' 
          ? '/app/apigw-vtl-emulator/assets/vtl-processor.jar' 
          : '/app/emulator/target/vtl-processor.jar';
        this.lib = await cheerpjRunLibrary(jarPath);
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

  getDescription() {
    return 'Java-based VTL processor running in browser via CheerpJ';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: true,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: true,
      performance: 'medium',
      size: 'large',
      features: ['Full Java compatibility', 'AWS API Gateway functions', 'JSONPath support']
    };
  }
}

// Make the class available globally
if (typeof window !== 'undefined') {
  window.CheerpJAdapter = CheerpJAdapter;
}

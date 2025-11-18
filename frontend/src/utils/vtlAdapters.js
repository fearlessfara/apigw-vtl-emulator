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

// Global CheerpJ state to prevent multiple initializations
let cheerpjInitPromise = null;
let cheerpjLibraryPromise = null;
let globalCheerpjLib = null;
let globalVTLProcessorClass = null;

// CheerpJ Adapter
export class CheerpJAdapter extends VTLProcessorAdapter {
  constructor() {
    super();
    this.vtlProcessor = null;
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
      // Use a global promise to ensure cheerpjInit is only called once
      if (!cheerpjInitPromise) {
        if (!window.cheerpjInitialized) {
          console.log('Initializing CheerpJ Java runtime...');
          cheerpjInitPromise = cheerpjInit({version: 17}).then(() => {
            window.cheerpjInitialized = true;
          }).catch((error) => {
            cheerpjInitPromise = null;
            throw error;
          });
        } else {
          cheerpjInitPromise = Promise.resolve();
        }
      }
      
      await cheerpjInitPromise;
      
      // Load library if not already loaded (as in old code)
      // Use promise to prevent concurrent loading
      if (!cheerpjLibraryPromise) {
        if (!globalCheerpjLib) {
          cheerpjLibraryPromise = (async () => {
            // CheerpJ internally rewrites /app/ so we use /app/vtl-processor.jar
            const jarPath = '/app/vtl-processor.jar';
            globalCheerpjLib = await cheerpjRunLibrary(jarPath);
            console.log(`Successfully loaded JAR from ${jarPath}`);
            
            // Get the VTLProcessor class
            globalVTLProcessorClass = await globalCheerpjLib.dev.vtlemulator.engine.VTLProcessor;
          })();
        } else {
          cheerpjLibraryPromise = Promise.resolve();
        }
      }
      
      await cheerpjLibraryPromise;
      
      // Create a new processor instance for this adapter
      if (!this.vtlProcessor) {
        this.vtlProcessor = await new globalVTLProcessorClass();
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
      const { VTLProcessor } = await import('@apigw-vtl-emulator/typescript');
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



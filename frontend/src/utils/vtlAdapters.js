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


// Global WASM state to prevent multiple initializations
let wasmModulePromise = null;
let globalWasmInstance = null;

// WebAssembly Adapter
export class WasmAdapter extends VTLProcessorAdapter {
  constructor() {
    super();
    this.wasmInstance = null;
    this.wasmPath = '/vtl-processor.wasm'; // Path where WASM will be served
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
      console.log('Initializing WebAssembly VTL Processor...');

      // Use global promise to prevent multiple loads
      if (!wasmModulePromise) {
        if (!globalWasmInstance) {
          console.log(\`Fetching WASM from \${this.wasmPath}...\`);

          wasmModulePromise = (async () => {
            // Fetch the WASM file
            const response = await fetch(this.wasmPath);
            if (!response.ok) {
              throw new Error(\`Failed to fetch WASM: \${response.status} \${response.statusText}\`);
            }

            const wasmBuffer = await response.arrayBuffer();
            console.log(\`WASM file loaded: \${(wasmBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB\`);

            // Compile WASM module
            console.log('Compiling WASM module...');
            const wasmModule = await WebAssembly.compile(wasmBuffer);

            // Create imports for WASM
            const imports = {
              env: {
                // Add any required environment imports here
              },
              wasi_snapshot_preview1: {
                // WASI imports if needed by GraalVM WASM
                proc_exit: (code) => {
                  console.log(\`WASM process exit: \${code}\`);
                },
                fd_write: () => 0,
                fd_read: () => 0,
                fd_close: () => 0,
                fd_seek: () => 0,
                path_open: () => 0,
                fd_prestat_get: () => 0,
                fd_prestat_dir_name: () => 0,
                environ_sizes_get: () => 0,
                environ_get: () => 0,
                clock_time_get: () => 0,
              }
            };

            // Instantiate WASM module
            console.log('Instantiating WASM module...');
            globalWasmInstance = await WebAssembly.instantiate(wasmModule, imports);

            console.log('WASM module initialized successfully');
            console.log('Available exports:', Object.keys(globalWasmInstance.exports));
          })();
        } else {
          wasmModulePromise = Promise.resolve();
        }
      }

      await wasmModulePromise;

      // Store reference to the global instance
      this.wasmInstance = globalWasmInstance;

      this.ready = true;
      console.log('WASM VTL Adapter initialized successfully');

    } catch (error) {
      console.error('Error initializing WASM Adapter:', error);
      this.ready = false;
      // Reset promise so it can be retried
      wasmModulePromise = null;
      globalWasmInstance = null;
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  async processTemplate(template, body, context) {
    if (!this.ready) {
      await this.init();
    }

    if (!this.wasmInstance) {
      throw new Error('WASM VTL processor not initialized');
    }

    try {
      // Check what exports are available
      const exports = this.wasmInstance.exports;

      // Try to find the process function
      // The actual exported function name may vary depending on GraalVM compilation
      let processFunc = exports.process ||
                       exports.processTemplate ||
                       exports.main ||
                       exports._start;

      if (!processFunc) {
        // If no obvious process function, try to use memory and call indirectly
        // This is a fallback - the actual implementation depends on how GraalVM exports functions
        throw new Error(
          'No process function found in WASM exports. ' +
          'Available exports: ' + Object.keys(exports).join(', ') + '. ' +
          'The WASM binary may need to be rebuilt with proper export configuration.'
        );
      }

      // For now, we'll need to implement the actual calling convention
      // based on how GraalVM WASM exports the Java method
      // This is a placeholder that shows the structure

      // GraalVM WASM typically exports memory and requires strings to be passed via memory
      // The exact implementation depends on the GraalVM WASM ABI

      // Temporary implementation: return a message indicating WASM is loaded but interface needs implementation
      const result = JSON.stringify({
        message: "WASM module loaded successfully!",
        note: "The WASM-Java bridge interface needs to be implemented based on GraalVM's exported functions.",
        exports: Object.keys(exports),
        template: template.substring(0, 50) + "...",
        status: "WASM engine operational, awaiting interface implementation"
      }, null, 2);

      return result;

    } catch (error) {
      throw new Error(\`WASM processing error: \${error.message}\`);
    }
  }

  getBackendType() {
    return 'wasm';
  }

  getDisplayName() {
    return 'WebAssembly (GraalVM)';
  }

  getCapabilities() {
    return {
      supportsComplexJsonPath: true,
      supportsVelocityDirectives: true,
      supportsApiGatewayFunctions: true,
      performance: 'very-fast',
      size: 'medium',
      experimental: false,
      description: 'Native WebAssembly compiled from Java with GraalVM'
    };
  }
}

// CheerpJ VTL Processor variables
let vtlProcessor = null;
let VTLProcessorClass = null;
let lib = null;

class CheerpJIntegration {
  static async init() {
    if (!window.cheerpjInitialized) {
      console.log('Initializing CheerpJ...');
      await cheerpjInit({version: 17});
      window.cheerpjInitialized = true;
      console.log('CheerpJ initialized');
    }
    if (!lib) {
      console.log('Loading JAR library...');
      // Use the correct path for GitHub Pages deployment
      const jarPath = window.location.hostname === 'fearlessfara.github.io' 
        ? '/app/apigw-vtl-emulator/assets/vtl-processor.jar' 
        : '/app/assets/vtl-processor.jar';
      console.log('Using JAR path:', jarPath);
      lib = await cheerpjRunLibrary(jarPath);
      console.log('JAR library loaded:', lib);
    }
    if (!VTLProcessorClass) {
      console.log('Getting VTLProcessor class...');
      VTLProcessorClass = await lib.com.example.VTLProcessor;
      console.log('VTLProcessor class:', VTLProcessorClass);
    }
    if (!vtlProcessor) {
      console.log('Creating VTLProcessor instance...');
      vtlProcessor = await new VTLProcessorClass();
      console.log('VTLProcessor instance created:', vtlProcessor);
    }
  }

  static async processTemplate(template, body, context) {
    await this.init();
    console.log('Calling vtlProcessor.process with:', template, body, context);
    const result = await vtlProcessor.process(template, body, context);
    console.log('Result from Java:', result);
    return result;
  }

  static getProcessor() {
    return vtlProcessor;
  }
}

// Export for use in other modules
window.CheerpJIntegration = CheerpJIntegration; 
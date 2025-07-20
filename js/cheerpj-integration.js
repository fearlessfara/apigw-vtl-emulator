// CheerpJ VTL Processor variables
let vtlProcessor = null;
let VTLProcessorClass = null;
let lib = null;

class CheerpJIntegration {
  static async init() {
    // Only show loading overlay if this is the first initialization
    if (!window.cheerpjInitialized && !lib && !VTLProcessorClass && !vtlProcessor) {
      this.showLoadingOverlay();
    }
    
    try {
      if (!window.cheerpjInitialized) {
        console.log('Initializing CheerpJ Java runtime...');
        this.updateLoadingProgress(20, 'Initializing Java runtime...');
        await cheerpjInit({version: 17});
        window.cheerpjInitialized = true;
      }
      
      if (!lib) {
        this.updateLoadingProgress(40, 'Loading VTL processor library...');
        // Use the correct path for GitHub Pages deployment
        const jarPath = window.location.hostname === 'fearlessfara.github.io' 
          ? '/app/apigw-vtl-emulator/assets/vtl-processor.jar' 
          : '/app/emulator/target/vtl-processor.jar';
        lib = await cheerpjRunLibrary(jarPath);
      }
      
      if (!VTLProcessorClass) {
        this.updateLoadingProgress(60, 'Loading VTL processor class...');
        VTLProcessorClass = await lib.com.example.VTLProcessor;
      }
      
      if (!vtlProcessor) {
        this.updateLoadingProgress(80, 'Creating VTL processor instance...');
        vtlProcessor = await new VTLProcessorClass();
      }
      
      // Hide loading overlay after successful initialization
      this.updateLoadingProgress(100, 'VTL Engine ready!');
      setTimeout(() => {
        this.hideLoadingOverlay();
      }, 500);
      
    } catch (error) {
      console.error('Error initializing CheerpJ:', error);
      this.updateLoadingProgress(0, 'Error: ' + error.message);
      setTimeout(() => {
        this.hideLoadingOverlay();
      }, 2000);
      throw error;
    }
  }
  
  static showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }
  
  static hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }
  
  static updateLoadingProgress(percent, message) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      const progressBar = overlay.querySelector('.progress-bar');
      const messageEl = overlay.querySelector('p');
      
      if (progressBar) {
        progressBar.style.width = percent + '%';
      }
      
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
  }

  static async processTemplate(template, body, context) {
    // Only initialize once, don't show loading overlay for subsequent calls
    if (!vtlProcessor) {
      await this.init();
    }
    
    const result = await vtlProcessor.process(template, body, context);
    return result;
  }

  static getProcessor() {
    return vtlProcessor;
  }
}

// Export for use in other modules
window.CheerpJIntegration = CheerpJIntegration; 
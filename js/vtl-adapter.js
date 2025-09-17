/**
 * VTL Processor Adapter - Base class for all VTL engines
 * 
 * This provides a common interface for different VTL processing engines
 * (CheerpJ, Vela, etc.) so they can be easily switched in the UI.
 */

class VTLProcessorAdapter {
  constructor() {
    this.ready = false;
    this.initializing = false;
  }

  /**
   * Initialize the engine
   * @returns {Promise<void>}
   */
  async init() {
    throw new Error('init() method must be implemented by subclass');
  }

  /**
   * Process a VTL template
   * @param {string} template - The VTL template
   * @param {string} body - The request body (JSON string)
   * @param {string} context - The context data (JSON string)
   * @returns {Promise<string>} - The processed result
   */
  async processTemplate(template, body, context) {
    throw new Error('processTemplate() method must be implemented by subclass');
  }

  /**
   * Get the engine type identifier
   * @returns {string}
   */
  getBackendType() {
    throw new Error('getBackendType() method must be implemented by subclass');
  }

  /**
   * Check if the engine is ready to process templates
   * @returns {boolean}
   */
  isReady() {
    return this.ready;
  }

  /**
   * Get engine capabilities and information
   * @returns {Object}
   */
  getCapabilities() {
    return {
      supportsComplexJsonPath: false,
      supportsVelocityDirectives: false,
      supportsApiGatewayFunctions: false,
      performance: 'unknown',
      size: 'unknown'
    };
  }

  /**
   * Get engine display name
   * @returns {string}
   */
  getDisplayName() {
    return this.getBackendType();
  }

  /**
   * Get engine description
   * @returns {string}
   */
  getDescription() {
    return 'VTL Processing Engine';
  }
}

// Make the class available globally
if (typeof window !== 'undefined') {
  window.VTLProcessorAdapter = VTLProcessorAdapter;
}

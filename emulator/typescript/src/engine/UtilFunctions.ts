/**
 * Utility functions for AWS API Gateway VTL templates ($util.*)
 * Matches the behavior of the Java implementation
 */
export class UtilFunctions {
  /**
   * Escapes a string for use in JavaScript
   * Handles Map/List objects by converting them to JSON first
   */
  escapeJavaScript(input: any): string {
    if (input === null || input === undefined) return '';

    let str: string;
    try {
      // If input is an object or array, serialize to JSON first
      if (typeof input === 'object') {
        str = JSON.stringify(input);
      } else {
        str = String(input);
      }
    } catch (e) {
      str = String(input);
    }

    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Base64 encode a string
   */
  base64Encode(input: string): string {
    if (input === null || input === undefined) return '';

    // Use Buffer for Node.js environments, btoa for browsers
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'utf8').toString('base64');
    } else if (typeof btoa !== 'undefined') {
      return btoa(input);
    }
    return input;
  }

  /**
   * Base64 decode a string
   */
  base64Decode(input: string): string {
    if (input === null || input === undefined) return '';

    try {
      // Use Buffer for Node.js environments, atob for browsers
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(input, 'base64').toString('utf8');
      } else if (typeof atob !== 'undefined') {
        return atob(input);
      }
    } catch (e) {
      return input;
    }
    return input;
  }

  /**
   * Parse a JSON string into an object
   * Returns the original string if parsing fails
   */
  parseJson(jsonString: string): any {
    if (jsonString === null || jsonString === undefined || jsonString.trim() === '') {
      return null;
    }

    try {
      return JSON.parse(jsonString);
    } catch (e) {
      // If parsing fails, return the original string
      return jsonString;
    }
  }

  /**
   * URL encode a string
   */
  urlEncode(input: string): string {
    if (input === null || input === undefined) return '';

    try {
      return encodeURIComponent(input);
    } catch (e) {
      return input;
    }
  }

  /**
   * URL decode a string
   */
  urlDecode(input: string): string {
    if (input === null || input === undefined) return '';

    try {
      return decodeURIComponent(input);
    } catch (e) {
      return input;
    }
  }
}

/**
 * Input functions for AWS API Gateway VTL templates ($input.*)
 * Matches the behavior of the Java implementation
 */
export class InputFunctions {
  private context: Record<string, any>;
  private input: Record<string, any>;
  private inputString: string;

  constructor(
    context: Record<string, any>,
    input: Record<string, any> = {},
    inputString: string = ''
  ) {
    this.context = context;
    this.input = input;
    this.inputString = inputString;
  }

  /**
   * $input.path(x) - Returns a JSON object representation that allows native VTL manipulation
   * This allows you to access and manipulate elements of the payload natively in VTL
   */
  path(jsonPath: string): any {
    if (!jsonPath) return null;

    // Remove leading $ if present
    if (jsonPath.startsWith('$')) {
      jsonPath = jsonPath.substring(1);
    }

    // If path is empty after removing $, return the entire input
    if (jsonPath === '') {
      return this.input;
    }

    // Simple path navigation
    const parts = jsonPath.split('.');
    let current: any = this.input;

    for (const part of parts) {
      // Skip empty parts
      if (part === '') continue;

      // Array access: part may be like 'hobbies[0]' or just '0'
      const bracketIdx = part.indexOf('[');
      if (bracketIdx !== -1 && part.endsWith(']')) {
        const key = part.substring(0, bracketIdx);
        const idx = parseInt(part.substring(bracketIdx + 1, part.length - 1), 10);

        if (key !== '') {
          if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
            current = current[key];
          } else {
            return null;
          }
        }

        if (Array.isArray(current)) {
          if (idx < 0 || idx >= current.length) return null;
          current = current[idx];
        } else {
          return null;
        }
      } else if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current = current[part];
      } else if (Array.isArray(current)) {
        // Support .0 .1 notation for lists
        const idx = parseInt(part, 10);
        if (isNaN(idx) || idx < 0 || idx >= current.length) return null;
        current = current[idx];
      } else {
        return null;
      }

      // If we get null/undefined, return null
      if (current === null || current === undefined) {
        return null;
      }
    }

    // Return the object directly for native VTL manipulation
    return current;
  }

  /**
   * $input.json(x) - Evaluates a JSONPath expression and returns the results as a JSON string
   * For example, $input.json('$.pets') returns a JSON string representing the pets structure
   */
  json(jsonPath: string): string {
    if (!jsonPath) return 'null';

    // Remove leading $ if present
    if (jsonPath.startsWith('$')) {
      jsonPath = jsonPath.substring(1);
    }

    // If jsonPath is just "", return the entire input as JSON string
    if (jsonPath === '') {
      try {
        return JSON.stringify(this.input);
      } catch (e) {
        return 'null';
      }
    }

    // Simple path navigation on input
    const parts = jsonPath.split('.');
    let current: any = this.input;

    for (const part of parts) {
      if (part === '') continue;

      const bracketIdx = part.indexOf('[');
      if (bracketIdx !== -1 && part.endsWith(']')) {
        const key = part.substring(0, bracketIdx);
        const idx = parseInt(part.substring(bracketIdx + 1, part.length - 1), 10);

        if (key !== '') {
          if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
            current = current[key];
          } else {
            return 'null';
          }
        }

        if (Array.isArray(current)) {
          if (idx < 0 || idx >= current.length) return 'null';
          current = current[idx];
        } else {
          return 'null';
        }
      } else if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current = current[part];
      } else if (Array.isArray(current)) {
        const idx = parseInt(part, 10);
        if (isNaN(idx) || idx < 0 || idx >= current.length) return 'null';
        current = current[idx];
      } else {
        return 'null';
      }

      if (current === null || current === undefined) return 'null';
    }

    // Return as JSON string
    try {
      return JSON.stringify(current);
    } catch (e) {
      return 'null';
    }
  }

  /**
   * $input.body - Returns the raw request payload as a string
   * You can use $input.body to preserve entire floating point numbers, such as 10.00
   */
  body(): string {
    return this.inputString;
  }

  /**
   * Alias for body()
   */
  getBody(): string {
    return this.body();
  }

  /**
   * $input.params() - Returns all parameters (path, querystring, header)
   */
  params(): Record<string, any>;
  params(paramName: string): string | null;
  params(paramName?: string): Record<string, any> | string | null {
    if (paramName === undefined) {
      const params = this.context.params;
      if (typeof params === 'object' && params !== null) {
        return params as Record<string, any>;
      }
      return {};
    }

    if (!paramName) return null;

    const allParams = this.params() as Record<string, any>;

    // AWS API Gateway behavior: search in order - path, querystring, header
    // According to AWS docs: "Returns the value of a method request parameter from the path,
    // query string, or header value (searched in that order)"
    const groups = ['path', 'querystring', 'header'];
    for (const group of groups) {
      const groupParams = allParams[group];
      if (typeof groupParams === 'object' && groupParams !== null) {
        const groupValue = groupParams[paramName];
        if (groupValue !== undefined && groupValue !== null) {
          return String(groupValue);
        }
      }
    }

    return null;
  }

  /**
   * $input.headers(name) - Get a specific header value
   */
  headers(headerName: string): string | null {
    const headers = this.context.headers;
    if (typeof headers === 'object' && headers !== null) {
      const value = headers[headerName];
      return value !== undefined && value !== null ? String(value) : null;
    }
    return null;
  }

  /**
   * $input.size() - Returns the size of the input array or object
   */
  size(): number {
    if (Array.isArray(this.input)) {
      return this.input.length;
    } else if (typeof this.input === 'object' && this.input !== null) {
      return Object.keys(this.input).length;
    }
    return 0;
  }
}

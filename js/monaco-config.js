class MonacoConfig {
  static setupVelocityLanguage() {
    // Register the Velocity language
    monaco.languages.register({id: 'velocity'});

    // Set up syntax highlighting
    monaco.languages.setMonarchTokensProvider('velocity', {
      tokenizer: {
        root: [
          // Velocity variables (e.g., $variable, $object.method())
          [/\$[a-zA-Z_][\w\.]*(\([^)]*\))?/, 'variable'],

          // Velocity directives (e.g., #if, #foreach, #set)
          [/#[a-zA-Z]+/, 'keyword'],

          // Multi-line comments
          [/#\*[\s\S]*?\*#/, 'comment'],

          // Single-line comments
          [/##.*/, 'comment'],

          // Double-quoted strings
          [/"([^"\\]|\\.)*"/, 'string'],

          // Single-quoted strings
          [/'([^'\\]|\\.)*'/, 'string'],

          // Delimiters
          [/[{}()\[\]]/, 'delimiter'],

          // Comparison operators
          [/[<>]=?/, 'operator'],
          [/[!=]=/, 'operator'],

          // Logical operators
          [/&&|\|\|/, 'operator'],

          // Arithmetic operators
          [/[+\-*\/]/, 'operator'],

          // Numbers
          [/\d+(\.\d+)?/, 'number']
        ]
      }
    });

    // Set up autocompletion
    monaco.languages.registerCompletionItemProvider('velocity', {
      triggerCharacters: ['$', '.', '#'],
      provideCompletionItems: (model, position) => {
        const suggestions = [
          // Input utilities
          {
            label: '$input.json',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$input.json("${1:path}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Parse JSON from input body using JSONPath'
          },
          {
            label: '$input.params',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$input.params("${1:paramName}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get parameter from request'
          },
          {
            label: '$input.body',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$input.body',
            documentation: 'Raw request body as string'
          },
          {
            label: '$input.path',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$input.path("${1:pathParam}")',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get path parameter'
          },

          // Utility functions
          {
            label: '$util.escapeJavaScript',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.escapeJavaScript(${1:string})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Escape string for JavaScript'
          },
          {
            label: '$util.urlEncode',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.urlEncode(${1:string})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'URL encode string'
          },
          {
            label: '$util.urlDecode',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.urlDecode(${1:string})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'URL decode string'
          },
          {
            label: '$util.base64Encode',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.base64Encode(${1:string})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Base64 encode string'
          },
          {
            label: '$util.base64Decode',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.base64Decode(${1:string})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Base64 decode string'
          },
          {
            label: '$util.parseJson',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.parseJson(${1:jsonString})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Parse JSON string'
          },
          {
            label: '$util.toJson',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: '$util.toJson(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert object to JSON string'
          },

          // Context properties
          {
            label: '$context.requestId',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.requestId',
            documentation: 'Unique request identifier'
          },
          {
            label: '$context.accountId',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.accountId',
            documentation: 'AWS account ID'
          },
          {
            label: '$context.apiId',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.apiId',
            documentation: 'API Gateway ID'
          },
          {
            label: '$context.stage',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.stage',
            documentation: 'API Gateway stage'
          },
          {
            label: '$context.requestTime',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.requestTime',
            documentation: 'Request timestamp'
          },
          {
            label: '$context.requestTimeEpoch',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.requestTimeEpoch',
            documentation: 'Request timestamp in epoch format'
          },
          {
            label: '$context.httpMethod',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.httpMethod',
            documentation: 'HTTP method (GET, POST, etc.)'
          },
          {
            label: '$context.resourcePath',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.resourcePath',
            documentation: 'Resource path'
          },
          {
            label: '$context.authorizer.claims',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.authorizer.claims',
            documentation: 'Cognito JWT claims object'
          },
          {
            label: '$context.identity.sourceIp',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.identity.sourceIp',
            documentation: 'Client source IP address'
          },
          {
            label: '$context.identity.userAgent',
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: '$context.identity.userAgent',
            documentation: 'Client user agent'
          },

          // Control structures
          {
            label: '#if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#if(${1:condition})\n\t${2:content}\n#end',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Conditional block'
          },
          {
            label: '#elseif',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#elseif(${1:condition})\n\t${2:content}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Else if condition'
          },
          {
            label: '#else',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#else\n\t${1:content}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Else block'
          },
          {
            label: '#foreach',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#foreach(${1:item} in ${2:collection})\n\t${3:content}\n#end',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Loop over collection'
          },
          {
            label: '#set',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#set(${1:$variable} = ${2:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Set variable'
          },
          {
            label: '#end',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#end',
            documentation: 'End block'
          },
          {
            label: '#break',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#break',
            documentation: 'Break from loop'
          },
          {
            label: '#stop',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: '#stop',
            documentation: 'Stop template processing'
          }
        ];

        return {suggestions};
      }
    });
  }

  static getEditorOptions(settings) {
    return {
      fontSize: settings.fontSize,
      lineNumbers: settings.lineNumbers ? 'on' : 'off',
      minimap: {enabled: settings.minimap},
      wordWrap: settings.wordWrap ? 'on' : 'off',
      theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'boundary'
    };
  }
}

// Export for use in other modules
window.MonacoConfig = MonacoConfig; 
export const setupVelocityLanguage = (monaco) => {
  if (!monaco) return;
  
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
      // Get the text before the cursor on the current line
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });

      // Get the last few characters to determine context
      const trimmed = textUntilPosition.trimEnd();
      const lastChar = trimmed[trimmed.length - 1];
      
      // Check if we're after a $ or #
      const isAfterDollar = lastChar === '$' || trimmed.endsWith('$');
      const isAfterHash = lastChar === '#' || trimmed.endsWith('#');
      const isAfterDot = lastChar === '.' && trimmed.match(/\$[\w]+\.$/);
      
      // Check if we're typing inside a $variable (e.g., $inp...)
      const dollarMatch = trimmed.match(/\$([\w]*)$/);
      const hashMatch = trimmed.match(/#([\w]*)$/);
      
      // Calculate the correct range to replace
      // If we just typed $ or #, include it in the range
      let range;
      if (isAfterDollar && (!dollarMatch || !dollarMatch[1])) {
        // Just typed $, replace it
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - 1,
          endColumn: position.column
        };
      } else if (isAfterHash && (!hashMatch || !hashMatch[1])) {
        // Just typed #, replace it
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - 1,
          endColumn: position.column
        };
      } else if (dollarMatch) {
        // Typing after $, include the $ and what's been typed
        const matchStart = textUntilPosition.lastIndexOf('$');
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: matchStart + 1,
          endColumn: position.column
        };
      } else if (hashMatch) {
        // Typing after #, include the # and what's been typed
        const matchStart = textUntilPosition.lastIndexOf('#');
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: matchStart + 1,
          endColumn: position.column
        };
      } else {
        // Default: use word boundaries
        const word = model.getWordUntilPosition(position);
        range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
      }
      
      // All possible suggestions
      const allSuggestions = [
        // Input utilities
        {
          label: '$input.json',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$input.json("${1:path}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Parse JSON from input body using JSONPath',
          range
        },
        {
          label: '$input.params',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$input.params("${1:paramName}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Get parameter from request',
          range
        },
        {
          label: '$input.body',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '$input.body',
          documentation: 'Raw request body as string',
          range
        },
        {
          label: '$input.path',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$input.path("${1:pathParam}")',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Get path parameter',
          range
        },

        // Utility functions
        {
          label: '$util.escapeJavaScript',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$util.escapeJavaScript(${1:string})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Escape string for JavaScript',
          range
        },
        {
          label: '$util.urlEncode',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$util.urlEncode(${1:string})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'URL encode string',
          range
        },
        {
          label: '$util.base64Encode',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '$util.base64Encode(${1:string})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Base64 encode string',
          range
        },

        // Context properties
        {
          label: '$context.requestId',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '$context.requestId',
          documentation: 'Unique request identifier',
          range
        },
        {
          label: '$context.authorizer.claims',
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: '$context.authorizer.claims',
          documentation: 'Cognito JWT claims object',
          range
        },

        // Control structures
        {
          label: '#if',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '#if(${1:condition})\n\t${2:content}\n#end',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Conditional block',
          range
        },
        {
          label: '#foreach',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '#foreach(${1:item} in ${2:collection})\n\t${3:content}\n#end',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Loop over collection',
          range
        },
        {
          label: '#set',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: '#set(${1:$variable} = ${2:value})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Set variable',
          range
        }
      ];

      // Filter suggestions based on context
      let filteredSuggestions = [];

      if (isAfterDot) {
        // Show property/method suggestions after a dot (e.g., $input.)
        const beforeDot = trimmed.match(/\$([\w]+)\.$/);
        if (beforeDot) {
          const prefix = beforeDot[1];
          if (prefix === 'input') {
            filteredSuggestions = allSuggestions.filter(s => 
              s.label.startsWith('$input.') && s.label !== '$input.'
            );
          } else if (prefix === 'util') {
            filteredSuggestions = allSuggestions.filter(s => 
              s.label.startsWith('$util.')
            );
          } else if (prefix === 'context') {
            filteredSuggestions = allSuggestions.filter(s => 
              s.label.startsWith('$context.')
            );
          }
        }
      } else if (dollarMatch) {
        // Typing after $ (e.g., $in, $inp, $input)
        const typed = dollarMatch[1].toLowerCase();
        filteredSuggestions = allSuggestions
          .filter(s => s.label.startsWith('$'))
          .filter(s => {
            const labelWithoutDollar = s.label.substring(1).toLowerCase();
            return labelWithoutDollar.startsWith(typed);
          });
      } else if (hashMatch) {
        // Typing after # (e.g., #i, #if)
        const typed = hashMatch[1].toLowerCase();
        filteredSuggestions = allSuggestions
          .filter(s => s.label.startsWith('#'))
          .filter(s => {
            const labelWithoutHash = s.label.substring(1).toLowerCase();
            return labelWithoutHash.startsWith(typed);
          });
      } else if (isAfterDollar) {
        // Just typed $, show all $ suggestions
        filteredSuggestions = allSuggestions.filter(s => s.label.startsWith('$'));
      } else if (isAfterHash) {
        // Just typed #, show all # suggestions
        filteredSuggestions = allSuggestions.filter(s => s.label.startsWith('#'));
      } else {
        // General typing - show all but prioritize by what's typed
        const wordText = word.word.toLowerCase();
        if (wordText) {
          filteredSuggestions = allSuggestions.filter(s => 
            s.label.toLowerCase().includes(wordText)
          );
        } else {
          // No filter, show all (but this shouldn't happen often)
          filteredSuggestions = allSuggestions;
        }
      }

      return {suggestions: filteredSuggestions};
    }
  });
};

export const getEditorOptions = (settings) => {
  return {
    // Font and appearance
    fontSize: settings.fontSize || 14,
    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace",
    fontLigatures: false,
    
    // Line numbers and minimap
    lineNumbers: settings.lineNumbers ? 'on' : 'off',
    lineNumbersMinChars: 3,
    minimap: {
      enabled: settings.minimap !== false,
      side: 'right',
      size: 'proportional',
      showSlider: 'mouseover'
    },
    
    // Word wrap and scrolling
    wordWrap: settings.wordWrap ? 'on' : 'off',
    wordWrapColumn: 80,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    
    // Whitespace and indentation
    renderWhitespace: 'boundary',
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: false,
    
    // Editor behavior
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    
    // Code features
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    
    // Bracket matching
    matchBrackets: 'always',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    
    // Folding
    folding: true,
    foldingStrategy: 'auto',
    showFoldingControls: 'mouseover',
    
    // Selection
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    
    // Cursor
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    
    // Theme (will be set via setTheme, but included for consistency)
    theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
    
    // Accessibility
    accessibilitySupport: 'auto',
    
    // Performance
    renderLineHighlight: 'all',
    renderValidationDecorations: 'on',
    
    // Multi-cursor
    multiCursorModifier: 'ctrlCmd',
    
    // Find
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'always'
    }
  };
};


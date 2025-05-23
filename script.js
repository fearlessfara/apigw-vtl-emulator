class VTLEmulatorPro {
    constructor() {
      this.editors = {};
      this.templates = [{id: 0, name: 'Template 1', content: '$input.json("$")\n$util.escapeJavaScript($input.body)'}];
      this.currentTemplate = 0;
      this.autoRender = false;
      this.autoRenderTimeout = null;
      this.debugMode = false;
      this.settings = {
        autoRenderDelay: 1000,
        fontSize: 14,
        lineNumbers: true,
        minimap: false,
        wordWrap: true,
        theme: 'light'
      };

      this.snippets = [
        {
          name: 'Basic Input JSON',
          description: 'Parse input as JSON',
          code: '$input.json("$")'
        },
        {
          name: 'Escape JavaScript',
          description: 'Escape string for JavaScript',
          code: '$util.escapeJavaScript($input.body)'
        },
        {
          name: 'URL Encode',
          description: 'URL encode a string',
          code: '$util.urlEncode($input.params("param"))'
        },
        {
          name: 'Base64 Encode',
          description: 'Base64 encode a string',
          code: '$util.base64Encode($input.body)'
        },
        {
          name: 'Get Query Parameter',
          description: 'Get a query string parameter',
          code: '$input.params("paramName")'
        },
        {
          name: 'Get Path Parameter',
          description: 'Get a path parameter',
          code: '$input.params("path.paramName")'
        },
        {
          name: 'Get Header',
          description: 'Get a request header',
          code: '$input.params("header.headerName")'
        },
        {
          name: 'Context Request ID',
          description: 'Get the request ID from context',
          code: '$context.requestId'
        },
        {
          name: 'Context User ID',
          description: 'Get user ID from Cognito claims',
          code: '$context.authorizer.claims.sub'
        },
        {
          name: 'Conditional Block',
          description: 'Simple if-else condition',
          code: '#if($input.params("param"))\n  "paramExists": true\n#else\n  "paramExists": false\n#end'
        },
        {
          name: 'Loop Through Array',
          description: 'Iterate over an array',
          code: '#foreach($item in $input.json("$.items"))\n  "$item.id": "$item.name"#if($foreach.hasNext),#end\n#end'
        },
        {
          name: 'Set Variable',
          description: 'Set a template variable',
          code: '#set($myVar = $input.json("$.someValue"))\n$myVar'
        },
        {
          name: 'Error Response',
          description: 'Standard error response format',
          code: '{\n  "error": {\n    "code": "$input.params(\'status\')",\n    "message": "$util.escapeJavaScript($input.body)",\n    "requestId": "$context.requestId"\n  }\n}'
        },
        {
          name: 'Success Response',
          description: 'Standard success response format',
          code: '{\n  "success": true,\n  "data": $input.json("$"),\n  "timestamp": "$context.requestTime",\n  "requestId": "$context.requestId"\n}'
        }
      ];

      this.loadSettings();
      this.init();
    }

    async init() {
      await this.initMonaco();
      this.initEventListeners();
      this.initTheme();
      this.initSnippets();
      this.updatePerformanceStats();
    }

    loadSettings() {
      try {
        const saved = JSON.parse(window.localStorage?.getItem('vtl-emulator-settings') || '{}');
        this.settings = {...this.settings, ...saved};
      } catch (e) {
        console.warn('Could not load settings:', e);
      }
    }

    saveSettings() {
      try {
        window.localStorage?.setItem('vtl-emulator-settings', JSON.stringify(this.settings));
      } catch (e) {
        console.warn('Could not save settings:', e);
      }
    }

    async initMonaco() {
      return new Promise((resolve) => {
        require.config({paths: {vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'}});
        require(['vs/editor/editor.main'], () => {
          this.setupVelocityLanguage();
          this.createEditors();
          resolve();
        });
      });
    }

    setupVelocityLanguage() {
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

    createEditors() {
      const editorOptions = {
        fontSize: this.settings.fontSize,
        lineNumbers: this.settings.lineNumbers ? 'on' : 'off',
        minimap: {enabled: this.settings.minimap},
        wordWrap: this.settings.wordWrap ? 'on' : 'off',
        theme: this.settings.theme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'boundary'
      };

      // Create a model for each template
      this.templates.forEach(template => {
        template.model = monaco.editor.createModel(template.content, 'velocity');
      });

      // Template Editor (attach to current template's model)
      this.editors.template = monaco.editor.create(
          document.getElementById('templateEditor'),
          {
            ...editorOptions,
            model: this.templates[this.currentTemplate].model
          }
      );

      // Body Editor
      this.editors.body = monaco.editor.create(
          document.getElementById('bodyEditor'),
          {
            ...editorOptions,
            value: '{\n  "message": "Hello, World!",\n  "timestamp": "2025-05-23T10:30:00Z",\n  "items": [\n    {"id": 1, "name": "Item 1"},\n    {"id": 2, "name": "Item 2"}\n  ]\n}',
            language: 'json'
          }
      );

      // Context Editor
      this.editors.context = monaco.editor.create(
          document.getElementById('contextEditor'),
          {
            ...editorOptions,
            value: this.getDefaultContext(),
            language: 'json'
          }
      );

      // Setup change listeners for auto-render and validation
      Object.keys(this.editors).forEach(key => {
        this.editors[key].onDidChangeModelContent(() => {
          this.validateEditor(key);
          if (this.autoRender) {
            this.scheduleAutoRender();
          }
          this.updatePerformanceStats();
        });
      });

      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'Enter':
              e.preventDefault();
              this.render();
              break;
            case 's':
              e.preventDefault();
              this.exportConfiguration();
              break;
          }
        }
        if (e.key === 'F11') {
          e.preventDefault();
          this.toggleFullscreen();
        }
      });
    }

    initEventListeners() {
      // Tab switching
      document.getElementById('editorTabs').addEventListener('click', (e) => {
        if (e.target.dataset.target) {
          e.preventDefault();
          this.switchTab(e.target.dataset.target);
        }
      });

      // Template tabs
      document.getElementById('templateTabs').addEventListener('click', (e) => {
        if (e.target.dataset.template !== undefined) {
          e.preventDefault();
          this.switchTemplate(parseInt(e.target.dataset.template));
        }
        if (e.target.classList.contains('close-btn')) {
          e.preventDefault();
          e.stopPropagation();
          this.closeTemplate(parseInt(e.target.dataset.template));
        }
      });

      // Toolbar buttons
      document.getElementById('renderBtn').addEventListener('click', () => this.render());
      document.getElementById('autoRenderToggle').addEventListener('click', () => this.toggleAutoRender());
      document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
      document.getElementById('importBtn').addEventListener('click', () => this.importConfiguration());
      document.getElementById('exportBtn').addEventListener('click', () => this.exportConfiguration());
      document.getElementById('shareBtn').addEventListener('click', () => this.shareConfiguration());
      document.getElementById('debugToggle').addEventListener('click', () => this.toggleDebug());
      document.getElementById('compareBtn').addEventListener('click', () => this.openComparison());
      document.getElementById('addTemplateTab').addEventListener('click', () => this.addTemplate());

      // Variable management
      document.getElementById('addVariable').addEventListener('click', () => this.addVariable());
      document.getElementById('importVariables').addEventListener('click', () => this.importVariables());
      document.getElementById('clearVariables').addEventListener('click', () => this.clearVariables());

      // Variable group buttons
      document.querySelectorAll('[data-group]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const group = e.target.closest('[data-group]').dataset.group;
          this.addVariableToGroup(group);
        });
      });

      // Format buttons
      document.getElementById('formatTemplate').addEventListener('click', () => this.formatEditor('template'));
      document.getElementById('validateTemplate').addEventListener('click', () => this.validateTemplate());
      document.getElementById('formatBody').addEventListener('click', () => this.formatEditor('body'));
      document.getElementById('minifyBody').addEventListener('click', () => this.minifyBody());
      document.getElementById('formatContext').addEventListener('click', () => this.formatEditor('context'));
      document.getElementById('loadSampleContext').addEventListener('click', () => this.loadSampleContext());

      // Result actions
      document.getElementById('copyResult').addEventListener('click', () => this.copyResult());
      document.getElementById('downloadResult').addEventListener('click', () => this.downloadResult());
      document.getElementById('clearResult').addEventListener('click', () => this.clearResult());

      // Modal buttons
      document.getElementById('helpBtn').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('helpModal')).show();
      });
      document.getElementById('settingsBtn').addEventListener('click', () => {
        this.openSettings();
      });
      document.getElementById('saveSettings').addEventListener('click', () => this.saveSettingsFromModal());

      // Snippet search
      document.getElementById('snippetSearch').addEventListener('input', (e) => {
        this.filterSnippets(e.target.value);
      });
    }

    initTheme() {
      if (this.settings.theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun"></i>';
      }
    }

    initSnippets() {
      const container = document.getElementById('snippetLibrary');
      this.snippets.forEach(snippet => {
        const item = document.createElement('div');
        item.className = 'snippet-item';
        item.innerHTML = `
                <div class="fw-bold">${snippet.name}</div>
                <div class="small text-muted">${snippet.description}</div>
            `;
        item.addEventListener('click', () => {
          this.insertSnippet(snippet.code);
        });
        container.appendChild(item);
      });
    }

    switchTab(target) {
      document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
      document.querySelector(`[data-target="${target}"]`).classList.add('active');

      document.querySelectorAll('.tab-pane').forEach(el => {
        el.classList.remove('show', 'active');
      });
      document.getElementById(target).classList.add('show', 'active');

      // Layout editor if it exists
      if (this.editors[target]) {
        setTimeout(() => this.editors[target].layout(), 0);
      }
    }

    switchTemplate(templateId) {
      const current = this.templates[this.currentTemplate];
      const next = this.templates.find(t => t.id === templateId);

      if (!next || !next.model) return;

      if (this.editors.template && current?.model) {
        // Save current editor content to current model
        current.model.setValue(this.editors.template.getValue());
      }

      this.currentTemplate = templateId;

      // Switch to the new model
      this.editors.template.setModel(next.model);

      // Update tab UI
      document.querySelectorAll('.template-tab .nav-link').forEach(el => el.classList.remove('active'));
      const newTab = document.querySelector(`.template-tab .nav-link[data-template="${templateId}"]`);
      if (newTab) newTab.classList.add('active');
    }


    addTemplate() {
      const newId = Math.max(...this.templates.map(t => t.id)) + 1;

      const content = '// New template\n$input.json("$")';
      const model = monaco.editor.createModel(content, 'velocity');

      const template = {
        id: newId,
        name: `Template ${newId + 1}`,
        content,
        model
      };

      this.templates.push(template);
      this.addTemplateTab(template);
      this.switchTemplate(newId);
    }


    addTemplateTab(template) {
      const tabsContainer = document.getElementById('templateTabs');
      const addButton = tabsContainer.querySelector('.nav-item:last-child');

      const newTab = document.createElement('li');
      newTab.className = 'nav-item template-tab';
      newTab.innerHTML = `
    <a class="nav-link" href="#" data-template="${template.id}">
      ${template.name}
      <button class="close-btn" data-template="${template.id}">&times;</button>
    </a>
  `;

      tabsContainer.insertBefore(newTab, addButton);

      // Attach click listeners
      const link = newTab.querySelector('.nav-link');
      const closeBtn = newTab.querySelector('.close-btn');

      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTemplate(template.id);
      });

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeTemplate(template.id);
      });
    }


    closeTemplate(templateId) {
      if (this.templates.length <= 1) {
        alert('Cannot close the last template');
        return;
      }

      const templateIndex = this.templates.findIndex(t => t.id === templateId);
      this.templates.splice(templateIndex, 1);

      // Remove tab
      document.querySelector(`[data-template="${templateId}"]`).closest('.template-tab').remove();

      // Switch to first template if current was closed
      if (this.currentTemplate === templateId) {
        this.switchTemplate(this.templates[0].id);
      }
    }

    addVariableToGroup(group) {
      const container = document.getElementById(`${group}Variables`);
      this.createVariableRow(container, group);
    }

    addVariable() {
      this.addVariableToGroup('query');
      this.switchTab('variables');
    }

    createVariableRow(container, group, key = '', value = '') {
      const row = document.createElement('div');
      row.className = 'variable-row slide-in';
      row.draggable = true;
      row.innerHTML = `
            <i class="bi bi-grip-vertical drag-handle"></i>
            <input class="form-control var-key" placeholder="Key" value="${key}" />
            <input class="form-control var-value" placeholder="Value" value="${value}" />
            <button class="btn btn-outline-danger btn-sm remove-btn" title="Remove">
                <i class="bi bi-trash"></i>
            </button>
        `;

      // Remove button handler
      row.querySelector('.remove-btn').addEventListener('click', () => {
        row.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => row.remove(), 300);
      });

      // Drag and drop handlers
      row.addEventListener('dragstart', (e) => {
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', row.outerHTML);
      });

      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
      });

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement && e.target.closest('.variable-row') !== draggedElement) {
          const targetRow = e.target.closest('.variable-row');
          if (targetRow) {
            container.insertBefore(draggedElement, targetRow.nextSibling);
          }
        }
      });

      container.appendChild(row);
      row.querySelector('.var-key').focus();
    }

    importVariables() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            if (file.name.endsWith('.json')) {
              const data = JSON.parse(event.target.result);
              this.importVariablesFromJSON(data);
            } else if (file.name.endsWith('.csv')) {
              this.importVariablesFromCSV(event.target.result);
            }
          } catch (error) {
            alert('Error importing variables: ' + error.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    importVariablesFromJSON(data) {
      Object.keys(data).forEach(group => {
        if (data[group] && typeof data[group] === 'object') {
          const container = document.getElementById(`${group}Variables`);
          if (container) {
            Object.keys(data[group]).forEach(key => {
              this.createVariableRow(container, group, key, data[group][key]);
            });
          }
        }
      });
    }

    importVariablesFromCSV(csvText) {
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      if (headers.length < 3 || !['group', 'key', 'value'].every(h => headers.includes(h))) {
        alert('CSV must have columns: group, key, value');
        return;
      }

      const groupIdx = headers.indexOf('group');
      const keyIdx = headers.indexOf('key');
      const valueIdx = headers.indexOf('value');

      lines.slice(1).forEach(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const group = values[groupIdx];
        const key = values[keyIdx];
        const value = values[valueIdx];

        const container = document.getElementById(`${group}Variables`);
        if (container) {
          this.createVariableRow(container, group, key, value);
        }
      });
    }

    clearVariables() {
      if (confirm('Are you sure you want to clear all variables?')) {
        ['query', 'path', 'header', 'stage'].forEach(group => {
          document.getElementById(`${group}Variables`).innerHTML = '';
        });
      }
    }

    validateEditor(editorKey) {
      const editor = this.editors[editorKey];
      const container = document.getElementById(`${editorKey}EditorContainer`);
      const status = document.getElementById(`${editorKey}Status`);

      if (!editor || !container || !status) return;

      try {
        const value = editor.getValue();

        if (editorKey === 'body' || editorKey === 'context') {
          if (value.trim()) {
            JSON.parse(value);
          }
        }

        container.classList.remove('invalid', 'loading');
        container.classList.add('valid');
        status.classList.remove('error', 'warning');
        status.title = 'Valid';
      } catch (error) {
        container.classList.remove('valid', 'loading');
        container.classList.add('invalid');
        status.classList.add('error');
        status.title = error.message;
      }
    }

    validateTemplate() {
      // Basic VTL syntax validation
      const template = this.editors.template.getValue();
      const issues = [];

      // Check for unclosed blocks
      const blockStarts = (template.match(/#(if|foreach|macro)\b/g) || []).length;
      const blockEnds = (template.match(/#end\b/g) || []).length;
      if (blockStarts !== blockEnds) {
        issues.push(`Unmatched #if/#foreach/#macro blocks (${blockStarts} starts, ${blockEnds} ends)`);
      }

      // Check for unclosed quotes
      const quotes = template.match(/"/g) || [];
      if (quotes.length % 2 !== 0) {
        issues.push('Unclosed quote detected');
      }

      // Check for unclosed parentheses
      const openParens = (template.match(/\(/g) || []).length;
      const closeParens = (template.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(`Unmatched parentheses (${openParens} open, ${closeParens} close)`);
      }

      if (issues.length > 0) {
        this.showError('Template Validation Issues', issues.join('\n'));
      } else {
        this.showSuccess('Template validation passed!');
      }
    }

    formatEditor(editorKey) {
      const editor = this.editors[editorKey];
      if (!editor) return;

      if (editorKey === 'body' || editorKey === 'context') {
        try {
          const value = editor.getValue();
          const formatted = JSON.stringify(JSON.parse(value), null, 2);
          editor.setValue(formatted);
        } catch (error) {
          this.showError('Format Error', 'Invalid JSON cannot be formatted');
        }
      } else {
        editor.getAction('editor.action.formatDocument').run();
      }
    }

    minifyBody() {
      try {
        const value = this.editors.body.getValue();
        const minified = JSON.stringify(JSON.parse(value));
        this.editors.body.setValue(minified);
      } catch (error) {
        this.showError('Minify Error', 'Invalid JSON cannot be minified');
      }
    }

    loadSampleContext() {
      this.editors.context.setValue(this.getDefaultContext());
    }

    getDefaultContext() {
      return `{
  "accountId": "112233445566",
  "apiId": "a1b2c3d4e5",
  "domainPrefix": "a1b2c3d4e5",
  "domainName": "a1b2c3d4e5.execute-api.us-east-1.amazonaws.com",
  "extendedRequestId": "ABCdEFGhIJKLMnO=",
  "httpMethod": "POST",
  "stage": "prod",
  "path": "/api/users",
  "protocol": "HTTP/1.1",
  "requestId": "7b776519-78de-4539-8e04-ff300f5c2528",
  "requestTime": "23/May/2025:10:30:00 +0000",
  "requestTimeEpoch": 1716458200000,
  "resourceId": "1a2b3c4d5e",
  "resourcePath": "/users",
  "authorizer": {
    "claims": {
      "sub": "4bf08bda-88a3-47b8-90b0-f08291a9e7af",
      "aud": "tfcrxvwog56v9sxpcbcesams65",
      "email_verified": true,
      "token_use": "id",
      "auth_time": 1716458000,
      "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_example",
      "cognito:username": "john.doe",
      "exp": 1716461800,
      "iat": 1716458200,
      "email": "john.doe@example.com"
    },
    "principalId": "4bf08bda-88a3-47b8-90b0-f08291a9e7af"
  },
  "identity": {
    "accountId": "112233445566",
    "apiKey": "DM8ua1AIkO292b9gAwRst87qNc296DyNEU3y8Ll4",
    "apiKeyId": "2zmu863a9k",
    "caller": "4bf08bda-88a3-47b8-90b0-f08291a9e7af",
    "cognitoAuthenticationType": "authenticated",
    "cognitoIdentityId": "us-east-1:4bf08bda-88a3-47b8-90b0-f08291a9e7af",
    "cognitoIdentityPoolId": "us-east-1:5f658b59-d1fb-4499-8b24-92246a5c2a05",
    "sourceIp": "203.0.113.1",
    "user": "john.doe",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "userArn": "arn:aws:iam::112233445566:role/CognitoAuthorizedRole"
  }
}`;
    }

    async render() {
      const startTime = performance.now();

      try {
        this.showLoading(true);
        this.clearErrors();// Get template and input data
        const template = this.editors.template.getValue();
        const body = this.editors.body.getValue();
        const contextData = this.editors.context.getValue();

        // Collect variables
        const variables = this.collectVariables();

        // Parse context
        let context = {};
        try {
          if (contextData.trim()) {
            context = JSON.parse(contextData);
          }
        } catch (error) {
          throw new Error('Invalid context JSON: ' + error.message);
        }

        // Parse body
        let inputData = {};
        try {
          if (body.trim()) {
            inputData = JSON.parse(body);
          }
        } catch (error) {
          throw new Error('Invalid body JSON: ' + error.message);
        }

        // Create VTL context
        // Build full event structure expected by renderVTL
        const vtlContext = {
          body,
          headers: variables.header,
          queryStringParameters: variables.query,
          pathParameters: variables.path,
          stageVariables: variables.stage,
          context: context
        }

        // Debug mode
        if (this.debugMode) {
          this.debugSteps = [];
          this.addDebugStep('Starting VTL rendering');
          this.addDebugStep('Template: ' + template.substring(0, 100) + '...');
          this.addDebugStep('Variables: ' + JSON.stringify(variables, null, 2));
        }

        // Use the VTL emulator library if available, otherwise basic processing
        let result;
        result = await window.renderVTLClient(template, vtlContext);
        console.log(result)

        // Update result
        document.getElementById('result').textContent = result;

        const endTime = performance.now();
        const renderTime = Math.round(endTime - startTime);
        document.getElementById('renderTime').textContent = `Render: ${renderTime}ms`;

        if (this.debugMode) {
          this.addDebugStep(`Rendering completed in ${renderTime}ms`);
          this.updateDebugPanel();
        }

        this.showSuccess('Template rendered successfully!');

      } catch (error) {
        this.showError('Render Error', error.message);
        console.error('VTL Render Error:', error);
      } finally {
        this.showLoading(false);
      }
    }

    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    }

    evaluateCondition(condition, context) {
      // Very basic condition evaluation
      const varMatch = condition.match(/\$([a-zA-Z_][\w\.]*)/);
      if (varMatch) {
        const value = this.getNestedValue(context, varMatch[1]);
        return Boolean(value);
      }
      return false;
    }

    collectVariables() {
      const variables = {
        query: {},
        path: {},
        header: {},
        stage: {}
      };

      ['query', 'path', 'header', 'stage'].forEach(group => {
        const container = document.getElementById(`${group}Variables`);
        if (container) {
          container.querySelectorAll('.variable-row').forEach(row => {
            const key = row.querySelector('.var-key').value.trim();
            const value = row.querySelector('.var-value').value.trim();
            if (key) {
              variables[group][key] = value;
            }
          });
        }
      });

      return variables;
    }

    addDebugStep(message) {
      if (this.debugSteps) {
        this.debugSteps.push({
          timestamp: new Date().toISOString(),
          message: message
        });
      }
    }

    updateDebugPanel() {
      const panel = document.getElementById('debugSteps');
      if (panel && this.debugSteps) {
        panel.innerHTML = this.debugSteps.map(step =>
            `<div class="debug-step">[${step.timestamp.substring(11, 19)}] ${step.message}</div>`
        ).join('');
      }
    }

    scheduleAutoRender() {
      if (this.autoRenderTimeout) {
        clearTimeout(this.autoRenderTimeout);
      }
      this.autoRenderTimeout = setTimeout(() => {
        this.render();
      }, this.settings.autoRenderDelay);
    }

    toggleAutoRender() {
      this.autoRender = !this.autoRender;
      const btn = document.getElementById('autoRenderToggle');
      if (this.autoRender) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Auto ON';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Auto';
        if (this.autoRenderTimeout) {
          clearTimeout(this.autoRenderTimeout);
        }
      }
    }

    toggleTheme() {
      const isDark = document.body.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.body.removeAttribute('data-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="bi bi-moon"></i>';
        this.settings.theme = 'light';
      } else {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun"></i>';
        this.settings.theme = 'dark';
      }

      // Update editor themes
      Object.values(this.editors).forEach(editor => {
        if (editor) {
          monaco.editor.setTheme(this.settings.theme === 'dark' ? 'vs-dark' : 'vs');
        }
      });

      this.saveSettings();
    }

    toggleDebug() {
      this.debugMode = !this.debugMode;
      const panel = document.getElementById('debugPanel');
      const btn = document.getElementById('debugToggle');

      if (this.debugMode) {
        panel.style.display = 'block';
        btn.classList.add('active');
      } else {
        panel.style.display = 'none';
        btn.classList.remove('active');
      }
    }

    toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }

    insertSnippet(code) {
      const editor = this.editors.template;
      if (editor) {
        const position = editor.getPosition();
        editor.executeEdits('snippet-insert', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: code
        }]);
        editor.focus();
      }
    }

    filterSnippets(searchTerm) {
      const items = document.querySelectorAll('.snippet-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(searchTerm.toLowerCase());
        item.style.display = matches ? 'block' : 'none';
      });
    }

    copyResult() {
      const result = document.getElementById('result').textContent;
      navigator.clipboard.writeText(result).then(() => {
        this.showSuccess('Result copied to clipboard!');
      }).catch(() => {
        this.showError('Copy Error', 'Failed to copy to clipboard');
      });
    }

    downloadResult() {
      const result = document.getElementById('result').textContent;
      const blob = new Blob([result], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vtl-result.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    clearResult() {
      document.getElementById('result').textContent = 'Click "Render" to see the VTL output here...';
    }

    importConfiguration() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target.result);
            this.loadConfiguration(config);
            this.showSuccess('Configuration imported successfully!');
          } catch (error) {
            this.showError('Import Error', 'Invalid configuration file: ' + error.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    exportConfiguration() {
      const config = {
        templates: this.templates.map(t => ({
          id: t.id,
          name: t.name,
          content: t.model ? t.model.getValue() : t.content || ''
        })),
        currentTemplate: this.currentTemplate,
        body: this.editors.body?.getValue() || '',
        context: this.editors.context?.getValue() || '',
        variables: this.collectVariables(),
        settings: this.settings,
        timestamp: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vtl-config-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }


    loadConfiguration(config) {
      if (config.templates) {
        this.templates = config.templates;
        this.currentTemplate = config.currentTemplate || 0;

        // Rebuild template tabs
        document.getElementById('templateTabs').innerHTML = `
          <li class="nav-item">
            <button class="btn btn-sm btn-outline-secondary" id="addTemplateTab">
              <i class="bi bi-plus"></i>
            </button>
          </li>
        `;

        this.templates.forEach(template => {
          this.addTemplateTab(template);
        });

        this.switchTemplate(this.currentTemplate);
      }

      if (config.body && this.editors.body) {
        this.editors.body.setValue(config.body);
      }

      if (config.context && this.editors.context) {
        this.editors.context.setValue(config.context);
      }

      if (config.variables) {
        this.loadVariables(config.variables);
      }

      if (config.settings) {
        this.settings = {...this.settings, ...config.settings};
        this.saveSettings();
      }
    }

    loadVariables(variables) {
      // Clear existing variables
      ['query', 'path', 'header', 'stage'].forEach(group => {
        document.getElementById(`${group}Variables`).innerHTML = '';
      });

      // Load new variables
      Object.keys(variables).forEach(group => {
        const container = document.getElementById(`${group}Variables`);
        if (container && variables[group]) {
          Object.keys(variables[group]).forEach(key => {
            this.createVariableRow(container, group, key, variables[group][key]);
          });
        }
      });
    }

    shareConfiguration() {
      const config = {
        templates: this.templates.map(t => ({
          id: t.id,
          name: t.name,
          content: t.model ? t.model.getValue() : t.content || ''
        })),
        currentTemplate: this.currentTemplate,
        body: this.editors.body?.getValue() || '',
        context: this.editors.context?.getValue() || '',
        variables: this.collectVariables()
      };

      try {
        const encodedConfig = btoa(JSON.stringify(config));
        const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
          this.showSuccess('Share URL copied to clipboard!');
        }).catch(() => {
          prompt('Copy this URL to share your configuration:', shareUrl);
        });
      } catch (e) {
        this.showError('Share Error', 'Failed to generate share URL: ' + e.message);
      }
    }


    openComparison() {
      // Create a comparison view
      const modal = document.createElement('div');
      modal.className = 'floating-panel';
      modal.style.width = '80vw';
      modal.style.height = '80vh';
      modal.innerHTML = `
        <div class="p-3">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5><i class="bi bi-files me-2"></i>Template Comparison</h5>
            <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('.floating-panel').remove()">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="split-view">
            <div>
              <h6>Template A</h6>
              <div id="compareEditorA" style="height: 300px; border: 1px solid var(--border-color);"></div>
            </div>
            <div>
              <h6>Template B</h6>
              <div id="compareEditorB" style="height: 300px; border: 1px solid var(--border-color);"></div>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary" onclick="this.compareTemplates()">Compare</button>
          </div>
          <div id="comparisonResult" class="mt-3"></div>
        </div>
      `;

      document.body.appendChild(modal);

      // Initialize comparison editors
      setTimeout(() => {
        const editorA = monaco.editor.create(document.getElementById('compareEditorA'), {
          value: this.templates[this.currentTemplate].content,
          language: 'velocity',
          theme: this.settings.theme === 'dark' ? 'vs-dark' : 'vs'
        });

        const editorB = monaco.editor.create(document.getElementById('compareEditorB'), {
          value: '',
          language: 'velocity',
          theme: this.settings.theme === 'dark' ? 'vs-dark' : 'vs'
        });
      }, 100);
    }

    openSettings() {
      const modal = new bootstrap.Modal(document.getElementById('settingsModal'));

      // Populate current settings
      document.getElementById('autoRenderDelay').value = this.settings.autoRenderDelay;
      document.getElementById('editorFontSize').value = this.settings.fontSize;
      document.getElementById('enableLineNumbers').checked = this.settings.lineNumbers;
      document.getElementById('enableMinimap').checked = this.settings.minimap;
      document.getElementById('enableWordWrap').checked = this.settings.wordWrap;

      modal.show();
    }

    saveSettingsFromModal() {
      this.settings.autoRenderDelay = parseInt(document.getElementById('autoRenderDelay').value);
      this.settings.fontSize = parseInt(document.getElementById('editorFontSize').value);
      this.settings.lineNumbers = document.getElementById('enableLineNumbers').checked;
      this.settings.minimap = document.getElementById('enableMinimap').checked;
      this.settings.wordWrap = document.getElementById('enableWordWrap').checked;

      // Apply settings to editors
      Object.values(this.editors).forEach(editor => {
        if (editor) {
          editor.updateOptions({
            fontSize: this.settings.fontSize,
            lineNumbers: this.settings.lineNumbers ? 'on' : 'off',
            minimap: {enabled: this.settings.minimap},
            wordWrap: this.settings.wordWrap ? 'on' : 'off'
          });
        }
      });

      this.saveSettings();
      bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
      this.showSuccess('Settings saved successfully!');
    }

    updatePerformanceStats() {
      const template = this.editors.template?.getValue() || '';
      document.getElementById('templateSize').textContent = `Size: ${template.length} chars`;
    }

    showLoading(show) {
      const overlay = document.getElementById('loadingOverlay');
      overlay.style.display = show ? 'flex' : 'none';
    }

    showSuccess(message) {
      this.showToast(message, 'success');
    }

    showError(title, message) {
      const errorPanel = document.getElementById('errorPanel');
      const errorDetails = document.getElementById('errorDetails');
      errorDetails.innerHTML = `<strong>${title}:</strong> ${message}`;
      errorPanel.style.display = 'block';

      setTimeout(() => {
        errorPanel.style.display = 'none';
      }, 5000);
    }

    clearErrors() {
      document.getElementById('errorPanel').style.display = 'none';
    }

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `alert alert-${type} position-fixed`;
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.zIndex = '9999';
      toast.textContent = message;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-in');
      }, 10);

      setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    // Load shared configuration from URL
    loadSharedConfig() {
      const urlParams = new URLSearchParams(window.location.search);
      const configParam = urlParams.get('config');

      if (configParam) {
        try {
          const config = JSON.parse(atob(configParam));
          this.loadConfiguration(config);
          this.showSuccess('Shared configuration loaded!');
        } catch (error) {
          this.showError('Share Error', 'Invalid shared configuration');
        }
      }
    }
  }

  // Initialize the application
  document.addEventListener('DOMContentLoaded', () => {
    window.vtlEmulator = new VTLEmulatorPro();

    // Load shared config if present
    window.vtlEmulator.loadSharedConfig();
  });
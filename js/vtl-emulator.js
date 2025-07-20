class VTLEmulator {
  constructor() {
    this.editors = {};
    this.templates = [{id: 0, name: 'Template 1', content: '$input.json("$")'}];
    this.currentTemplate = 0;
    this.autoRender = false;
    this.autoRenderTimeout = null;
    this.debugMode = false;
    this.debugSteps = [];

    this.init();
  }

  async init() {
    // Load settings first
    SettingsManager.loadSettings();
    
    // Initialize Monaco editor
    await this.initMonaco();
    
    // Initialize CheerpJ
    await CheerpJIntegration.init();
    
    // Initialize UI components
    this.initEventListeners();
    this.initTheme();
    SnippetManager.initSnippets();
    this.updatePerformanceStats();
  }

  async initMonaco() {
    return new Promise((resolve) => {
      require.config({paths: {vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs'}});
      require(['vs/editor/editor.main'], () => {
        MonacoConfig.setupVelocityLanguage();
        this.createEditors();
        resolve();
      });
    });
  }

  createEditors() {
    const editorOptions = MonacoConfig.getEditorOptions(SettingsManager.getSettings());

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
          value: SettingsManager.getDefaultContext(),
          language: 'json'
        }
    );

    // Setup change listeners for auto-render and validation
    Object.keys(this.editors).forEach(key => {
      this.editors[key].onDidChangeModelContent(() => {
        UIUtils.validateEditor(key, this.editors[key]);
        if (this.autoRender) {
          this.scheduleAutoRender();
        }
        this.updatePerformanceStats();
      });
    });

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  async render() {
    const startTime = performance.now();
    let showedLoading = false;

    try {
      // Only show loading if CheerpJ hasn't been initialized yet
      if (!window.cheerpjInitialized) {
        UIUtils.showLoading(true);
        showedLoading = true;
      }
      UIUtils.clearErrors();
      
      // Get template and input data
      const template = this.editors.template.getValue();
      const body = this.editors.body.getValue();
      const contextData = this.editors.context.getValue();

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

      // Debug mode
      if (this.debugMode) {
        this.debugSteps = [];
        this.addDebugStep('Starting VTL rendering');
        this.addDebugStep('Template: ' + template.substring(0, 100) + '...');
      }

      // Use the CheerpJ VTL processor
      const result = await CheerpJIntegration.processTemplate(template, body, contextData);

      // Update result
      UIUtils.setResult(result);

      const endTime = performance.now();
      const renderTime = Math.round(endTime - startTime);
      UIUtils.updateRenderTime(renderTime);

      if (this.debugMode) {
        this.addDebugStep(`Rendering completed in ${renderTime}ms`);
        this.updateDebugPanel();
      }

      UIUtils.showSuccess('Template rendered successfully!');

    } catch (error) {
      UIUtils.showError('Render Error', error.message);
      console.error('VTL Render Error:', error);
    } finally {
      // Only hide loading if we showed it
      if (showedLoading) {
        UIUtils.showLoading(false);
      }
    }
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
    document.getElementById('formatTemplate').addEventListener('click', () => UIUtils.formatEditor('template', this.editors.template));
    document.getElementById('validateTemplate').addEventListener('click', () => UIUtils.validateTemplate(this.editors.template));
    document.getElementById('formatBody').addEventListener('click', () => UIUtils.formatEditor('body', this.editors.body));
    document.getElementById('minifyBody').addEventListener('click', () => UIUtils.minifyBody(this.editors.body));
    document.getElementById('formatContext').addEventListener('click', () => UIUtils.formatEditor('context', this.editors.context));
    document.getElementById('loadSampleContext').addEventListener('click', () => this.loadSampleContext());

    // Result actions
    document.getElementById('copyResult').addEventListener('click', () => this.copyResult());
    document.getElementById('downloadResult').addEventListener('click', () => this.downloadResult());
    document.getElementById('clearResult').addEventListener('click', () => UIUtils.clearResult());

    // Modal buttons
    document.getElementById('helpBtn').addEventListener('click', () => {
      new bootstrap.Modal(document.getElementById('helpModal')).show();
    });
    document.getElementById('settingsBtn').addEventListener('click', () => {
      SettingsManager.openSettingsModal();
    });
    document.getElementById('saveSettings').addEventListener('click', () => SettingsManager.saveSettingsFromModal());

    // Snippet search
    document.getElementById('snippetSearch').addEventListener('input', (e) => {
      SnippetManager.filterSnippets(e.target.value);
    });
  }

  initTheme() {
    const settings = SettingsManager.getSettings();
    if (settings.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun"></i>';
    }
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
    }, SettingsManager.getSetting('autoRenderDelay'));
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
    const newTheme = UIUtils.toggleTheme();
    SettingsManager.setSetting('theme', newTheme);

    // Update editor themes
    Object.values(this.editors).forEach(editor => {
      if (editor) {
        monaco.editor.setTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
      }
    });
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
    const newId = Math.max(...this.templates.map(t => t.id)) + 1;
    const model = monaco.editor.createModel(code, 'velocity');

    const template = {
      id: newId,
      name: `Snippet ${newId + 1}`,
      content: code,
      model
    };

    this.templates.push(template);
    this.addTemplateTab(template);
    this.switchTemplate(newId);
    this.switchTab('template'); // Ensure the editor tab is active
  }

  copyResult() {
    const result = document.getElementById('result').textContent;
    UIUtils.copyToClipboard(result);
  }

  downloadResult() {
    const result = document.getElementById('result').textContent;
    UIUtils.downloadFile(result, 'vtl-result.txt');
  }

  loadSampleContext() {
    this.editors.context.setValue(SettingsManager.getDefaultContext());
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
          UIUtils.showSuccess('Configuration imported successfully!');
        } catch (error) {
          UIUtils.showError('Import Error', 'Invalid configuration file: ' + error.message);
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
      settings: SettingsManager.getSettings(),
      timestamp: new Date().toISOString()
    };

    UIUtils.downloadFile(JSON.stringify(config, null, 2), `vtl-config-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
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
      SettingsManager.updateSettings(config.settings);
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
        UIUtils.showSuccess('Share URL copied to clipboard!');
      }).catch(() => {
        prompt('Copy this URL to share your configuration:', shareUrl);
      });
    } catch (e) {
      UIUtils.showError('Share Error', 'Failed to generate share URL: ' + e.message);
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
        <button class="btn btn-primary" id="compareTemplatesBtn">Compare</button>
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
        theme: SettingsManager.getSetting('theme') === 'dark' ? 'vs-dark' : 'vs'
      });

      const editorB = monaco.editor.create(document.getElementById('compareEditorB'), {
        value: '',
        language: 'velocity',
        theme: SettingsManager.getSetting('theme') === 'dark' ? 'vs-dark' : 'vs'
      });

      document.getElementById('compareTemplatesBtn').addEventListener('click', () => {
        const contentA = editorA.getValue();
        const contentB = editorB.getValue();

        const diff = contentA === contentB
            ? '<div class="text-success">Templates are identical.</div>'
            : '<div class="text-warning">Templates differ.</div>';

        document.getElementById('comparisonResult').innerHTML = diff;
      });
    }, 100);
  }

  updatePerformanceStats() {
    UIUtils.updatePerformanceStats(this.editors.template);
  }

  onSettingsChanged() {
    // Update editor options when settings change
    const editorOptions = MonacoConfig.getEditorOptions(SettingsManager.getSettings());
    Object.values(this.editors).forEach(editor => {
      if (editor) {
        editor.updateOptions({
          fontSize: editorOptions.fontSize,
          lineNumbers: editorOptions.lineNumbers,
          minimap: editorOptions.minimap,
          wordWrap: editorOptions.wordWrap
        });
      }
    });
  }

  // Load shared configuration from URL
  loadSharedConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');

    if (configParam) {
      try {
        const config = JSON.parse(atob(configParam));
        this.loadConfiguration(config);
        UIUtils.showSuccess('Shared configuration loaded!');
      } catch (error) {
        UIUtils.showError('Share Error', 'Invalid shared configuration');
      }
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.vtlEmulator = new VTLEmulator();

  // Load shared config if present
  window.vtlEmulator.loadSharedConfig();
}); 
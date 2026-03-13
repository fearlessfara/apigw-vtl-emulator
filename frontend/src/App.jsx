import { useState, useEffect, useCallback, useRef } from 'react';
import './components/ui/Layout.css';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import EditorTabs from './components/EditorTabs';
import ResultPanel from './components/ResultPanel';
import LoadingOverlay from './components/LoadingOverlay';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import ToastStack from './components/ToastStack';
import { loadSettings, saveSettings } from './utils/settings';
import { VelocitsAdapter } from './utils/vtlAdapters';
import { setupVelocityLanguage } from './utils/monacoConfig';
import { loader } from '@monaco-editor/react';

function App() {
  const [settings, setSettings] = useState(loadSettings());
  const [template, setTemplate] = useState('$input.json("$")');
  const [currentTab, setCurrentTab] = useState('template');
  const [body, setBody] = useState('{\n  "message": "Hello, World!",\n  "timestamp": "2025-05-23T10:30:00Z",\n  "items": [\n    {"id": 1, "name": "Item 1"},\n    {"id": 2, "name": "Item 2"}\n  ]\n}');
  const [context, setContext] = useState('');
  const [variables, setVariables] = useState({
    querystring: {},
    path: {},
    header: {},
    stage: {}
  });
  const [result, setResult] = useState('Click "Render" to see the VTL output here...');
  const [renderTime, setRenderTime] = useState(0);
  const [autoRender, setAutoRender] = useState(false);
  const [autoRenderTimeout, setAutoRenderTimeout] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugSteps, setDebugSteps] = useState([]);
  const currentEngine = 'velocits';
  const [engines, setEngines] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState([]);
  const monacoInstanceRef = useRef(null);

  const addToast = useCallback((message, tone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  // Initialize Monaco and engines
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setLoadingMessage('Initializing VTL Engine...');
      
      try {
        // Setup Monaco
        const monaco = await loader.init();
        monacoInstanceRef.current = monaco;
        setupVelocityLanguage(monaco);
        
        // Initialize default engine (Velocits is faster and lighter)
        await initializeEngine('velocits');
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Load shared config from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get('config');
    
    if (configParam) {
      try {
        const config = JSON.parse(atob(configParam));
        loadConfiguration(config);
      } catch (error) {
          console.error('Failed to load shared config:', error);
          addToast('Failed to load shared config from URL.', 'error');
        }
      }
  }, [addToast]);

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
    
    // Update Monaco theme efficiently
    const updateTheme = async () => {
      const monaco = monacoInstanceRef.current || await loader.init();
      if (monaco) {
        monaco.editor.setTheme(settings.theme === 'dark' ? 'vs-dark' : 'vs');
        if (!monacoInstanceRef.current) {
          monacoInstanceRef.current = monaco;
        }
      }
    };
    
    updateTheme();
  }, [settings.theme]);

  const initializeEngine = async (engineType) => {
    if (engines[engineType]) {
      return engines[engineType];
    }

    setLoading(true);
    const engineNames = {
      'velocits': 'Velocits (TypeScript)'
    };
    setLoadingMessage(`Loading ${engineNames[engineType] || engineType} engine...`);

    try {
      if (engineType !== 'velocits') {
        throw new Error(`Unknown engine type: ${engineType}`);
      }

      const engine = new VelocitsAdapter();
      await engine.init();

      setEngines(prev => ({ ...prev, [engineType]: engine }));
      return engine;
    } catch (error) {
      console.error(`Error initializing ${engineType} engine:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const collectVariables = useCallback(() => {
    return variables;
  }, [variables]);

  const render = useCallback(async () => {
    const startTime = performance.now();
    let currentEngineInstance = engines[currentEngine];
    
    if (!currentEngineInstance || !currentEngineInstance.isReady()) {
      setLoading(true);
      setLoadingMessage('Initializing engine...');
      try {
        currentEngineInstance = await initializeEngine(currentEngine);
      } catch (error) {
        setError(`Engine initialization failed: ${error.message}`);
        addToast(`Engine initialization failed: ${error.message}`, 'error');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    setError(null);
    
    if (debugMode) {
      setDebugSteps([{
        timestamp: new Date().toISOString(),
        message: 'Starting VTL rendering'
      }]);
    }

    try {
      // Merge variables into context
      let contextObj = {};
      try {
        if (context.trim()) {
          contextObj = JSON.parse(context);
        }
      } catch (error) {
        throw new Error('Invalid context JSON: ' + error.message);
      }

      if (!contextObj.params) {
        contextObj.params = {};
      }

      ['querystring', 'path', 'header', 'stage'].forEach(group => {
        if (variables[group] && Object.keys(variables[group]).length > 0) {
          if (!contextObj.params[group]) {
            contextObj.params[group] = {};
          }
          Object.assign(contextObj.params[group], variables[group]);
        }
      });

      const contextWithVariables = JSON.stringify(contextObj);
      const result = await currentEngineInstance.processTemplate(template, body, contextWithVariables);
      
      setResult(result);
      
      const endTime = performance.now();
      const time = Math.round(endTime - startTime);
      setRenderTime(time);

      if (debugMode) {
        setDebugSteps(prev => [...prev, {
          timestamp: new Date().toISOString(),
          message: `Rendering completed in ${time}ms using ${currentEngineInstance.getDisplayName()}`
        }]);
      }
    } catch (error) {
      setError(error.message);
      addToast(error.message, 'error');
      console.error('VTL Render Error:', error);
    }
  }, [template, body, context, variables, currentEngine, engines, debugMode, addToast]);

  // Auto-render when content changes
  useEffect(() => {
    if (!autoRender) return;
    
    if (autoRenderTimeout) {
      clearTimeout(autoRenderTimeout);
    }
    
    const timeout = setTimeout(() => {
      render();
    }, settings.autoRenderDelay);
    
    setAutoRenderTimeout(timeout);
    
    return () => {
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, body, context, variables, autoRender, settings.autoRenderDelay]);

  const updateSettings = useCallback((newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  }, [settings]);

  const loadConfiguration = useCallback((config) => {
    if (config.template) {
      setTemplate(config.template);
    } else if (config.templates && config.templates.length > 0) {
      // Support legacy format with templates array
      setTemplate(config.templates[0].content || '');
    }
    if (config.body) setBody(config.body);
    if (config.context) setContext(config.context);
    if (config.variables) setVariables(config.variables);
    if (config.settings) updateSettings(config.settings);
  }, [updateSettings]);

  const exportConfiguration = useCallback(() => {
    const config = {
      template,
      body,
      context,
      variables,
      settings,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vtl-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Configuration exported.', 'success');
  }, [template, body, context, variables, settings, addToast]);

  const shareConfiguration = useCallback(() => {
    const config = {
      template,
      body,
      context,
      variables
    };

    try {
      const encodedConfig = btoa(JSON.stringify(config));
      const shareUrl = `${window.location.origin}${window.location.pathname}?config=${encodedConfig}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        addToast('Share URL copied to clipboard.', 'success');
      }).catch(() => {
        prompt('Copy this URL to share your configuration:', shareUrl);
        addToast('Clipboard unavailable. Share URL shown in prompt.', 'info');
      });
    } catch (e) {
      setError('Failed to generate share URL: ' + e.message);
      addToast('Failed to generate share URL.', 'error');
    }
  }, [template, body, context, variables, addToast]);

  useEffect(() => {
    const handleKeyboardShortcuts = (event) => {
      const isPrimary = event.metaKey || event.ctrlKey;
      if (!isPrimary) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        render();
        return;
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (event.shiftKey) {
          shareConfiguration();
        } else {
          exportConfiguration();
        }
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [render, exportConfiguration, shareConfiguration]);

  const getCurrentEngineInstance = () => {
    return engines[currentEngine];
  };

  return (
    <div className="app-shell">
      <LoadingOverlay show={loading} message={loadingMessage} />
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))}
      />
      
      <Header 
        onThemeToggle={() => {
          const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
          updateSettings({ theme: newTheme });
        }}
        theme={settings.theme}
        onHelpClick={() => setShowHelp(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="custom-container-fluid app-main-shell">
        <Toolbar
          onRender={render}
          autoRender={autoRender}
          onAutoRenderToggle={() => {
            const newValue = !autoRender;
            setAutoRender(newValue);
            if (!newValue && autoRenderTimeout) {
              clearTimeout(autoRenderTimeout);
              setAutoRenderTimeout(null);
            }
          }}
          onImport={() => {
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
                  loadConfiguration(config);
                  addToast('Configuration imported.', 'success');
                } catch (error) {
                  setError('Invalid configuration file: ' + error.message);
                  addToast('Invalid configuration file.', 'error');
                }
              };
              reader.readAsText(file);
            };
            input.click();
          }}
          onExport={exportConfiguration}
          onShare={shareConfiguration}
          debugMode={debugMode}
          onDebugToggle={() => setDebugMode(!debugMode)}
          renderTime={renderTime}
          templateSize={template.length}
          engineInfo={getCurrentEngineInstance()?.getDisplayName() || 'Not initialized'}
        />

        <div className="custom-row app-workspace-row">
          <div className="custom-col custom-col-lg-8 workspace-column">
            <EditorTabs
              template={template}
              onTemplateChange={setTemplate}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              body={body}
              onBodyChange={setBody}
              context={context}
              onContextChange={setContext}
              variables={variables}
              onVariablesChange={setVariables}
              settings={settings}
              onSnippetInsert={(code) => {
                setTemplate(code);
                setCurrentTab('template');
              }}
            />
          </div>
          
          <div className="custom-col custom-col-lg-4 workspace-column">
            <ResultPanel
              result={result}
              onCopy={(content) => {
                navigator.clipboard.writeText(content ?? result);
                addToast('Output copied.', 'success');
              }}
              onDownload={(content) => {
                const blob = new Blob([content ?? result], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vtl-result.txt';
                a.click();
                URL.revokeObjectURL(url);
                addToast('Output downloaded.', 'success');
              }}
              onClear={() => {
                setResult('Click "Render" to see the VTL output here...');
                addToast('Output cleared.', 'info');
              }}
              debugMode={debugMode}
              debugSteps={debugSteps}
              error={error}
              onErrorDismiss={() => setError(null)}
            />
          </div>
        </div>
      </div>

      <HelpModal show={showHelp} onHide={() => setShowHelp(false)} />
      <SettingsModal 
        show={showSettings} 
        onHide={() => setShowSettings(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}

export default App;

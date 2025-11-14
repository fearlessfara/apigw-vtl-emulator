import { useState, useEffect, useCallback, useRef } from 'react';
import './components/ui/Layout.css';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import EditorTabs from './components/EditorTabs';
import ResultPanel from './components/ResultPanel';
import LoadingOverlay from './components/LoadingOverlay';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import { loadSettings, saveSettings } from './utils/settings';
import { CheerpJAdapter, VelaAdapter } from './utils/vtlAdapters';
import { setupVelocityLanguage, getEditorOptions } from './utils/monacoConfig';
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
  const [currentEngine, setCurrentEngine] = useState('cheerpj');
  const [engines, setEngines] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const monacoInstanceRef = useRef(null);

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
        
        // Initialize default engine
        await initializeEngine('cheerpj');
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
      }
    }
  }, []);

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
    setLoadingMessage(`Loading ${engineType === 'cheerpj' ? 'CheerpJ (Java)' : 'Vela (JavaScript)'} engine...`);

    try {
      const AdapterClass = engineType === 'cheerpj' ? CheerpJAdapter : VelaAdapter;
      const engine = new AdapterClass();
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

  const switchEngine = async (engineType) => {
    if (engineType === currentEngine) return;

    try {
      await initializeEngine(engineType);
      setCurrentEngine(engineType);
    } catch (error) {
      setError(`Failed to switch engine: ${error.message}`);
    }
  };

  const collectVariables = useCallback(() => {
    return variables;
  }, [variables]);

  const render = useCallback(async () => {
    const startTime = performance.now();
    let engine = engines[currentEngine];
    
    if (!engine || !engine.isReady()) {
      setLoading(true);
      setLoadingMessage('Initializing engine...');
      try {
        await initializeEngine(currentEngine);
      } catch (error) {
        setError(`Engine initialization failed: ${error.message}`);
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
      const currentEngineInstance = engines[currentEngine];
      
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
      console.error('VTL Render Error:', error);
    }
  }, [template, body, context, variables, currentEngine, engines, debugMode]);

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

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  const loadConfiguration = (config) => {
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
  };

  const exportConfiguration = () => {
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
  };

  const shareConfiguration = () => {
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
        // Show success toast
      }).catch(() => {
        prompt('Copy this URL to share your configuration:', shareUrl);
      });
    } catch (e) {
      setError('Failed to generate share URL: ' + e.message);
    }
  };

  const getCurrentEngineInstance = () => {
    return engines[currentEngine];
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column'}}>
      <LoadingOverlay show={loading} message={loadingMessage} />
      
      <Header 
        onThemeToggle={() => {
          const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
          updateSettings({ theme: newTheme });
        }}
        theme={settings.theme}
        onHelpClick={() => setShowHelp(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="custom-container-fluid" style={{maxWidth: '1800px', flex: 1, display: 'flex', flexDirection: 'column'}}>
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
          currentEngine={currentEngine}
          onEngineChange={switchEngine}
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
                } catch (error) {
                  setError('Invalid configuration file: ' + error.message);
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

        <div className="custom-row" style={{flex: 1, margin: 0, alignItems: 'stretch', minHeight: 0}}>
          <div className="custom-col custom-col-lg-8" style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
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
          
          <div className="custom-col custom-col-lg-4" style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
            <ResultPanel
              result={result}
              onCopy={() => {
                navigator.clipboard.writeText(result);
              }}
              onDownload={() => {
                const blob = new Blob([result], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vtl-result.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}
              onClear={() => setResult('Click "Render" to see the VTL output here...')}
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

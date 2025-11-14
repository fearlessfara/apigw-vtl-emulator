import { useState, useRef } from 'react';
import { Button, Tabs, Tab } from './ui';
import Editor from '@monaco-editor/react';
import VariablesTab from './VariablesTab';
import SnippetsTab from './SnippetsTab';
import { getEditorOptions } from '../utils/monacoConfig';
import { formatJSON, minifyJSON, validateJSON } from '../utils/uiUtils';
import { getDefaultContext } from '../utils/settings';

function EditorTabs({
  template,
  onTemplateChange,
  currentTab,
  onTabChange,
  body,
  onBodyChange,
  context,
  onContextChange,
  variables,
  onVariablesChange,
  settings,
  onSnippetInsert
}) {
  const [templateValid, setTemplateValid] = useState(true);
  const [bodyValid, setBodyValid] = useState(true);
  const [contextValid, setContextValid] = useState(true);
  const templateEditorRef = useRef(null);
  const bodyEditorRef = useRef(null);
  const contextEditorRef = useRef(null);

  const handleTemplateEditorDidMount = (editor) => {
    templateEditorRef.current = editor;
  };

  const handleBodyEditorDidMount = (editor) => {
    bodyEditorRef.current = editor;
  };

  const handleContextEditorDidMount = (editor) => {
    contextEditorRef.current = editor;
  };

  const handleTemplateChange = (value) => {
    onTemplateChange(value);
    const blockStarts = (value.match(/#(if|foreach|macro)\b/g) || []).length;
    const blockEnds = (value.match(/#end\b/g) || []).length;
    setTemplateValid(blockStarts === blockEnds);
  };

  const handleBodyChange = (value) => {
    onBodyChange(value);
    const validation = validateJSON(value);
    setBodyValid(validation.valid);
  };

  const handleContextChange = (value) => {
    onContextChange(value);
    const validation = validateJSON(value);
    setContextValid(validation.valid);
  };

  const handleFormatTemplate = async () => {
    if (templateEditorRef.current) {
      try {
        await templateEditorRef.current.getAction('editor.action.formatDocument').run();
      } catch (error) {
        console.warn('Format action not available:', error);
      }
    }
  };

  const handleValidateTemplate = () => {
    const issues = [];

    const blockStarts = (template.match(/#(if|foreach|macro)\b/g) || []).length;
    const blockEnds = (template.match(/#end\b/g) || []).length;
    if (blockStarts !== blockEnds) {
      issues.push(`Unmatched #if/#foreach/#macro blocks (${blockStarts} starts, ${blockEnds} ends)`);
    }

    const quotes = template.match(/"/g) || [];
    if (quotes.length % 2 !== 0) {
      issues.push('Unclosed quote detected');
    }

    if (issues.length > 0) {
      alert('Template Validation Issues:\n' + issues.join('\n'));
    } else {
      alert('Template validation passed!');
    }
  };

  const handleFormatBody = () => {
    try {
      const formatted = formatJSON(body);
      onBodyChange(formatted);
    } catch (error) {
      alert('Invalid JSON cannot be formatted');
    }
  };

  const handleMinifyBody = () => {
    try {
      const minified = minifyJSON(body);
      onBodyChange(minified);
    } catch (error) {
      alert('Invalid JSON cannot be minified');
    }
  };

  const handleFormatContext = () => {
    try {
      const formatted = formatJSON(context);
      onContextChange(formatted);
    } catch (error) {
      alert('Invalid JSON cannot be formatted');
    }
  };

  const handleLoadSampleContext = () => {
    onContextChange(getDefaultContext());
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0}}>
      <Tabs id="editorTabs" className="modern-tabs">
        <Tab 
          active={currentTab === 'template'} 
          onClick={() => onTabChange('template')}
        >
          <i className="bi bi-file-code"></i>Template
        </Tab>
        <Tab 
          active={currentTab === 'body'} 
          onClick={() => onTabChange('body')}
        >
          <i className="bi bi-file-text"></i>Body
        </Tab>
        <Tab 
          active={currentTab === 'variables'} 
          onClick={() => onTabChange('variables')}
        >
          <i className="bi bi-list-ul"></i>Variables
        </Tab>
        <Tab 
          active={currentTab === 'context'} 
          onClick={() => onTabChange('context')}
        >
          <i className="bi bi-gear"></i>Context
        </Tab>
        <Tab 
          active={currentTab === 'snippets'} 
          onClick={() => onTabChange('snippets')}
        >
          <i className="bi bi-collection"></i>Snippets
        </Tab>
      </Tabs>

      <div className="modern-tab-content" style={{flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
        {currentTab === 'template' && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
            <div className={`modern-editor-container ${templateValid ? 'valid' : 'invalid'}`} style={{flex: 1, minHeight: 0, marginBottom: '1rem'}}>
              <Editor
                height="100%"
                language="velocity"
                value={template}
                onChange={handleTemplateChange}
                onMount={handleTemplateEditorDidMount}
                theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
                options={getEditorOptions(settings)}
              />
              <div className={`status-indicator ${templateValid ? '' : 'error'}`}></div>
            </div>
            <div className="d-flex justify-content-between align-items-center" style={{flexWrap: 'wrap', gap: '0.5rem', flexShrink: 0, marginTop: '0.5rem'}}>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={handleFormatTemplate}>
                  <i className="bi bi-code me-1"></i>Format
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleValidateTemplate}>
                  <i className="bi bi-check-circle me-1"></i>Validate
                </Button>
              </div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'}}>
                <kbd style={{padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontWeight: 500, display: 'inline-block'}}>Ctrl+Space</kbd>
                <span style={{color: 'var(--text-secondary)'}}>for autocomplete</span>
                <span style={{color: 'var(--text-secondary)'}}>|</span>
                <kbd style={{padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontWeight: 500, display: 'inline-block'}}>Ctrl+F</kbd>
                <span style={{color: 'var(--text-secondary)'}}>to find</span>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'body' && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
            <div className={`modern-editor-container ${bodyValid ? 'valid' : 'invalid'}`} style={{flex: 1, minHeight: 0, marginBottom: '1rem'}}>
              <Editor
                height="100%"
                language="json"
                value={body}
                onChange={handleBodyChange}
                onMount={handleBodyEditorDidMount}
                theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
                options={getEditorOptions(settings)}
              />
              <div className={`status-indicator ${bodyValid ? '' : 'error'}`}></div>
            </div>
            <div className="d-flex gap-2" style={{flexShrink: 0, marginTop: '0.5rem'}}>
              <Button variant="outline-secondary" size="sm" onClick={handleFormatBody}>
                <i className="bi bi-braces me-1"></i>Format JSON
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleMinifyBody}>
                <i className="bi bi-dash-square me-1"></i>Minify
              </Button>
            </div>
          </div>
        )}

        {currentTab === 'variables' && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'auto'}}>
            <VariablesTab
              variables={variables}
              onVariablesChange={onVariablesChange}
            />
          </div>
        )}

        {currentTab === 'context' && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
            <div className={`modern-editor-container ${contextValid ? 'valid' : 'invalid'}`} style={{flex: 1, minHeight: 0, marginBottom: '1rem'}}>
              <Editor
                height="100%"
                language="json"
                value={context}
                onChange={handleContextChange}
                onMount={handleContextEditorDidMount}
                theme={settings.theme === 'dark' ? 'vs-dark' : 'vs'}
                options={getEditorOptions(settings)}
              />
              <div className={`status-indicator ${contextValid ? '' : 'error'}`}></div>
            </div>
            <div className="d-flex gap-2" style={{flexShrink: 0, marginTop: '0.5rem'}}>
              <Button variant="outline-secondary" size="sm" onClick={handleLoadSampleContext}>
                <i className="bi bi-file-code me-1"></i>Load Sample
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleFormatContext}>
                <i className="bi bi-braces me-1"></i>Format JSON
              </Button>
            </div>
          </div>
        )}

        {currentTab === 'snippets' && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
            <SnippetsTab onSnippetInsert={onSnippetInsert} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorTabs;

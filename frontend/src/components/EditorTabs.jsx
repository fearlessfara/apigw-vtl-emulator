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
  const [templateNotice, setTemplateNotice] = useState(null);
  const [bodyNotice, setBodyNotice] = useState(null);
  const [contextNotice, setContextNotice] = useState(null);
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
    setTemplateNotice(null);
  };

  const handleBodyChange = (value) => {
    onBodyChange(value);
    const validation = validateJSON(value);
    setBodyValid(validation.valid);
    setBodyNotice(null);
  };

  const handleContextChange = (value) => {
    onContextChange(value);
    const validation = validateJSON(value);
    setContextValid(validation.valid);
    setContextNotice(null);
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
      setTemplateNotice({ tone: 'error', message: issues.join(' ') });
    } else {
      setTemplateNotice({ tone: 'success', message: 'Template structure looks valid.' });
    }
  };

  const handleFormatBody = () => {
    try {
      const formatted = formatJSON(body);
      onBodyChange(formatted);
      setBodyNotice({ tone: 'success', message: 'Body JSON formatted.' });
    } catch (error) {
      setBodyNotice({ tone: 'error', message: 'Body JSON is invalid and cannot be formatted.' });
    }
  };

  const handleMinifyBody = () => {
    try {
      const minified = minifyJSON(body);
      onBodyChange(minified);
      setBodyNotice({ tone: 'success', message: 'Body JSON minified.' });
    } catch (error) {
      setBodyNotice({ tone: 'error', message: 'Body JSON is invalid and cannot be minified.' });
    }
  };

  const handleFormatContext = () => {
    try {
      const formatted = formatJSON(context);
      onContextChange(formatted);
      setContextNotice({ tone: 'success', message: 'Context JSON formatted.' });
    } catch (error) {
      setContextNotice({ tone: 'error', message: 'Context JSON is invalid and cannot be formatted.' });
    }
  };

  const handleLoadSampleContext = () => {
    onContextChange(getDefaultContext());
    setContextNotice({ tone: 'success', message: 'Sample context loaded.' });
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

      <div className="modern-tab-content editor-content-shell">
        {currentTab === 'template' && (
          <div className="tab-panel-shell">
            <div className={`modern-editor-container ${templateValid ? 'valid' : 'invalid'}`}>
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
            <div className="editor-footer-row d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2 editor-footer-actions">
                <Button variant="outline-secondary" size="sm" onClick={handleFormatTemplate}>
                  <i className="bi bi-code me-1"></i>Format
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleValidateTemplate}>
                  <i className="bi bi-check-circle me-1"></i>Validate
                </Button>
              </div>
              <div className="editor-shortcuts-hint">
                <kbd>Ctrl+Space</kbd>
                <span>for autocomplete</span>
                <span>|</span>
                <kbd>Ctrl+F</kbd>
                <span>to find</span>
              </div>
            </div>
            {templateNotice && <div className={`editor-notice editor-notice-${templateNotice.tone}`}>{templateNotice.message}</div>}
          </div>
        )}

        {currentTab === 'body' && (
          <div className="tab-panel-shell">
            <div className={`modern-editor-container ${bodyValid ? 'valid' : 'invalid'}`}>
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
            <div className="d-flex gap-2 editor-footer-actions">
              <Button variant="outline-secondary" size="sm" onClick={handleFormatBody}>
                <i className="bi bi-braces me-1"></i>Format JSON
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleMinifyBody}>
                <i className="bi bi-dash-square me-1"></i>Minify
              </Button>
            </div>
            {bodyNotice && <div className={`editor-notice editor-notice-${bodyNotice.tone}`}>{bodyNotice.message}</div>}
          </div>
        )}

        {currentTab === 'variables' && (
          <div className="tab-panel-shell tab-panel-scrollable">
            <VariablesTab
              variables={variables}
              onVariablesChange={onVariablesChange}
            />
          </div>
        )}

        {currentTab === 'context' && (
          <div className="tab-panel-shell">
            <div className={`modern-editor-container ${contextValid ? 'valid' : 'invalid'}`}>
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
            <div className="d-flex gap-2 editor-footer-actions">
              <Button variant="outline-secondary" size="sm" onClick={handleLoadSampleContext}>
                <i className="bi bi-file-code me-1"></i>Load Sample
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleFormatContext}>
                <i className="bi bi-braces me-1"></i>Format JSON
              </Button>
            </div>
            {contextNotice && <div className={`editor-notice editor-notice-${contextNotice.tone}`}>{contextNotice.message}</div>}
          </div>
        )}

        {currentTab === 'snippets' && (
          <div className="tab-panel-shell">
            <SnippetsTab onSnippetInsert={onSnippetInsert} />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorTabs;

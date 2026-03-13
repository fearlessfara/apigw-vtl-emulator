import { useState, useEffect, useRef } from 'react';
import { Button } from './ui';
import './ui/Layout.css';

function VariablesTab({ variables, onVariablesChange }) {
  // Track stable IDs for each entry - key is the variable key, value is a unique ID
  const entryIdMapRef = useRef({});
  const [notice, setNotice] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  
  // Initialize entry IDs
  useEffect(() => {
    Object.keys(variables).forEach(group => {
      if (!entryIdMapRef.current[group]) {
        entryIdMapRef.current[group] = {};
      }
      Object.keys(variables[group] || {}).forEach(key => {
        if (!entryIdMapRef.current[group][key]) {
          entryIdMapRef.current[group][key] = `id-${Date.now()}-${Math.random()}`;
        }
      });
    });
  }, []);

  const addVariableToGroup = (group) => {
    const newKey = `key${Date.now()}`;
    const newId = `id-${Date.now()}-${Math.random()}`;
    
    if (!entryIdMapRef.current[group]) {
      entryIdMapRef.current[group] = {};
    }
    entryIdMapRef.current[group][newKey] = newId;
    
    onVariablesChange({
      ...variables,
      [group]: {
        ...variables[group],
        [newKey]: ''
      }
    });
    setNotice({ tone: 'success', message: `Added a new ${group} variable.` });
  };

  const updateVariable = (group, oldKey, newKey, newValue) => {
    const newVars = { ...(variables[group] || {}) };
    
    // Preserve the entry ID when key changes
    if (oldKey !== newKey && oldKey in newVars) {
      const entryId = entryIdMapRef.current[group]?.[oldKey];
      if (entryId) {
        if (!entryIdMapRef.current[group]) {
          entryIdMapRef.current[group] = {};
        }
        entryIdMapRef.current[group][newKey] = entryId;
        delete entryIdMapRef.current[group][oldKey];
      }
      delete newVars[oldKey];
    }
    
    if (newKey) {
      newVars[newKey] = newValue;
    }
    
    onVariablesChange({
      ...variables,
      [group]: newVars
    });
    setNotice(null);
  };

  const removeVariable = (group, key) => {
    const newVars = { ...variables[group] };
    delete newVars[key];
    if (entryIdMapRef.current[group]) {
      delete entryIdMapRef.current[group][key];
    }
    onVariablesChange({
      ...variables,
      [group]: newVars
    });
    setNotice({ tone: 'success', message: `Removed ${group} variable "${key}".` });
  };

  const clearAll = () => {
    entryIdMapRef.current = {
      querystring: {},
      path: {},
      header: {},
      stage: {}
    };
    onVariablesChange({
      querystring: {},
      path: {},
      header: {},
      stage: {}
    });
    setConfirmClear(false);
    setNotice({ tone: 'success', message: 'Cleared all variable groups.' });
  };

  const importVariables = () => {
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
            onVariablesChange({
              ...variables,
              ...data
            });
            setNotice({ tone: 'success', message: 'Variables imported successfully.' });
          }
        } catch (error) {
          setNotice({ tone: 'error', message: `Error importing variables: ${error.message}` });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const VariableGroup = ({ group, label, icon }) => {
    const groupVars = variables[group] || {};
    
    return (
      <div className="modern-variable-group">
        <div className="modern-variable-group-header">
          <span><i className={`bi ${icon} me-2`}></i>{label}</span>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => addVariableToGroup(group)}
          >
            <i className="bi bi-plus"></i>
          </Button>
        </div>
        <div>
          {Object.entries(groupVars).map(([key, value]) => {
            // Get stable ID for this entry
            const entryId = entryIdMapRef.current[group]?.[key] || `fallback-${group}-${key}`;
            
            return (
              <div key={entryId} className="modern-variable-row">
                <input
                  className="form-control var-key"
                  placeholder="Key"
                  defaultValue={key}
                  onBlur={(e) => {
                    const newKey = e.target.value;
                    if (newKey !== key) {
                      updateVariable(group, key, newKey, value);
                    }
                  }}
                />
                <input
                  className="form-control var-value"
                  placeholder="Value"
                  defaultValue={value}
                  onBlur={(e) => {
                    const newValue = e.target.value;
                    if (newValue !== value) {
                      updateVariable(group, key, key, newValue);
                    }
                  }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeVariable(group, key)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="variables-shell">
      <div className="panel-header panel-header-spaced variables-header">
        <div>
          <h6 className="panel-title">Variable Groups</h6>
          <p className="panel-subtitle">Manage headers, query params, stage values, and path inputs.</p>
        </div>
        <div className="d-flex gap-1 variables-actions">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => addVariableToGroup('querystring')}
          >
            <i className="bi bi-plus"></i>Add Variable
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={importVariables}>
            <i className="bi bi-upload"></i>Import
          </Button>
          {confirmClear ? (
            <>
              <Button variant="outline-danger" size="sm" onClick={clearAll}>
                <i className="bi bi-trash"></i>Confirm Clear
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline-secondary" size="sm" onClick={() => setConfirmClear(true)}>
              <i className="bi bi-trash"></i>Clear All
            </Button>
          )}
        </div>
      </div>
      {notice && <div className={`editor-notice editor-notice-${notice.tone}`}>{notice.message}</div>}
      <div id="variableGroups">
        <VariableGroup group="querystring" label="Query String Parameters" icon="bi-link-45deg" />
        <VariableGroup group="path" label="Path Parameters" icon="bi-signpost" />
        <VariableGroup group="header" label="Headers" icon="bi-card-heading" />
        <VariableGroup group="stage" label="Stage Variables" icon="bi-layers" />
      </div>
    </div>
  );
}

export default VariablesTab;

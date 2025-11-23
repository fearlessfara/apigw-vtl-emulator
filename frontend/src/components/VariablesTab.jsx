import { useState, useEffect, useRef } from 'react';
import { Button } from './ui';
import './ui/Layout.css';

function VariablesTab({ variables, onVariablesChange }) {
  // Track stable IDs for each entry - key is the variable key, value is a unique ID
  const entryIdMapRef = useRef({});
  
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
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all variables?')) {
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
    }
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
          }
        } catch (error) {
          alert('Error importing variables: ' + error.message);
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
                <i className="bi bi-grip-vertical drag-handle"></i>
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
    <div>
      <div className="d-flex justify-content-between align-items-center" style={{marginBottom: '1rem'}}>
        <h6 style={{margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)'}}>Variable Groups</h6>
        <div className="d-flex gap-1">
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
          <Button variant="outline-secondary" size="sm" onClick={clearAll}>
            <i className="bi bi-trash"></i>Clear All
          </Button>
        </div>
      </div>
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

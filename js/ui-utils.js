class UIUtils {
  static showLoading(show, message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
      if (show) {
        const messageElement = overlay.querySelector('p');
        if (messageElement) {
          messageElement.textContent = message;
        }
      }
    }
  }

  static showSuccess(message) {
    this.showToast(message, 'success');
  }

  static showError(title, message) {
    const errorPanel = document.getElementById('errorPanel');
    const errorDetails = document.getElementById('errorDetails');
    if (errorPanel && errorDetails) {
      errorDetails.innerHTML = `<strong>${title}:</strong> ${message}`;
      errorPanel.style.display = 'block';

      setTimeout(() => {
        errorPanel.style.display = 'none';
      }, 5000);
    }
  }

  static clearErrors() {
    const errorPanel = document.getElementById('errorPanel');
    if (errorPanel) {
      errorPanel.style.display = 'none';
    }
  }

  static showToast(message, type = 'info') {
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

  static validateEditor(editorKey, editor) {
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

  static validateTemplate(editor) {
    if (!editor) return;

    const template = editor.getValue();
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

  static formatEditor(editorKey, editor) {
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

  static minifyBody(editor) {
    try {
      const value = editor.getValue();
      const minified = JSON.stringify(JSON.parse(value));
      editor.setValue(minified);
    } catch (error) {
      this.showError('Minify Error', 'Invalid JSON cannot be minified');
    }
  }

  static copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess('Copied to clipboard!');
    }).catch(() => {
      this.showError('Copy Error', 'Failed to copy to clipboard');
    });
  }

  static downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  static toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      document.getElementById('themeToggle').innerHTML = '<i class="bi bi-moon"></i>';
      return 'light';
    } else {
      document.body.setAttribute('data-theme', 'dark');
      document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun"></i>';
      return 'dark';
    }
  }

  static updatePerformanceStats(templateEditor) {
    const template = templateEditor?.getValue() || '';
    const templateSizeElement = document.getElementById('templateSize');
    if (templateSizeElement) {
      templateSizeElement.textContent = `Size: ${template.length} chars`;
    }
  }

  static updateRenderTime(renderTime) {
    const renderTimeElement = document.getElementById('renderTime');
    if (renderTimeElement) {
      renderTimeElement.textContent = `Render: ${renderTime}ms`;
    }
  }

  static clearResult() {
    const resultElement = document.getElementById('result');
    if (resultElement) {
      resultElement.textContent = 'Click "Render" to see the VTL output here...';
    }
  }

  static setResult(content) {
    const resultElement = document.getElementById('result');
    if (resultElement) {
      resultElement.textContent = content;
    }
  }
}

// Export for use in other modules
window.UIUtils = UIUtils; 
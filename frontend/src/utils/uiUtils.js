export const showToast = (message, type = 'info') => {
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
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'danger');
  });
};

export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const validateJSON = (value) => {
  try {
    if (value.trim()) {
      JSON.parse(value);
    }
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const formatJSON = (value) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch (error) {
    throw new Error('Invalid JSON cannot be formatted');
  }
};

export const minifyJSON = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (error) {
    throw new Error('Invalid JSON cannot be minified');
  }
};


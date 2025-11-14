import { useState } from 'react';
import { snippets } from '../utils/snippets';

function SnippetsTab({ onSnippetInsert }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSnippets = snippets.filter(snippet =>
    snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-3">
        <h6 style={{fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem'}}>VTL Snippet Library</h6>
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem'
          }}
        />
      </div>
      <div className="modern-snippet-library">
        {filteredSnippets.map((snippet, idx) => (
          <div
            key={idx}
            className="modern-snippet-item"
            onClick={() => onSnippetInsert(snippet.code)}
          >
            <div className="snippet-name">{snippet.name}</div>
            <div className="snippet-desc">{snippet.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SnippetsTab;


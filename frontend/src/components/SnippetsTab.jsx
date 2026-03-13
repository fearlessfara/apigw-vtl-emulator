import { useState } from 'react';
import { snippets } from '../utils/snippets';

function SnippetsTab({ onSnippetInsert }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSnippets = snippets.filter(snippet =>
    snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="snippets-shell">
      <div className="panel-header panel-header-spaced">
        <h6 className="panel-title">VTL Snippet Library</h6>
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control snippets-search"
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

import React, { useState } from 'react';
import './BlobSearch.css';

function BlobSearch() {
  const [blobId, setBlobId] = useState('');
  const [blobInfo, setBlobInfo] = useState(null);
  const [error, setError] = useState('');

  // Helper function to extract everything after the first "::" in 'type'
  const parseType = (typeString) => {
    if (!typeString) return '';
    const parts = typeString.split('::');
    return parts.slice(1).join('::');
  };

  const handleSearch = async () => {
    setError('');
    setBlobInfo(null);

    try {
      const response = await fetch('https://walrus-stats.brightlystake.com/api2/get_blob_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blobId }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setBlobInfo(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="blob-search-container">
      <h2>Blob Info Search</h2>
      <div className="blob-search-input-group">
        <input
          type="text"
          value={blobId}
          onChange={(e) => setBlobId(e.target.value)}
          placeholder="Enter Blob ID"
          className="blob-search-input"
        />
        <button onClick={handleSearch} className="blob-search-button">
          Search
        </button>
      </div>

      {error && <p className="blob-search-error">{error}</p>}

      {blobInfo && blobInfo.parsedJson && (
        <div className="blob-search-cards">
          {/* Deletable */}
          <div className="blob-search-card">
            <h4>Deletable</h4>
            <div
              className={
                blobInfo.parsedJson.deletable
                  ? 'blob-search-deletable-true'
                  : 'blob-search-deletable-false'
              }
            >
              {String(blobInfo.parsedJson.deletable)}
            </div>
          </div>

          {/* Epoch */}
          <div className="blob-search-card">
            <h4>Epoch</h4>
            <div>{blobInfo.parsedJson.epoch}</div>
          </div>

          {/* End Epoch */}
          <div className="blob-search-card">
            <h4>End Epoch</h4>
            <div>{blobInfo.parsedJson.end_epoch}</div>
          </div>

          {/* Size */}
          <div className="blob-search-card">
            <h4>Size</h4>
            <div>{blobInfo.parsedJson.size}</div>
          </div>

          {/* Sender */}
          <div className="blob-search-card">
            <h4>Sender</h4>
            <div className="blob-search-sender">{blobInfo.sender}</div>
          </div>

          {/* Type (parsed) */}
          <div className="blob-search-card">
            <h4>Type</h4>
            <div>{parseType(blobInfo.type)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlobSearch;

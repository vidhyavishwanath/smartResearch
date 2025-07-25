import React, { useRef, useState } from 'react';
import './Workspace.css';

const Workspace: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      e.target.value = '';
    }
  };

  return (
    <div className="workspace-content">
      <div className="file-squares-column">
        <button className="add-file-square" onClick={handleAddFileClick} type="button">
          + Add File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {uploadedFiles.map((file, idx) => (
          <div className="file-square" key={idx}>
            <div className="file-icon">📄</div>
            <div className="file-name">{file.name}</div>
            <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workspace; 
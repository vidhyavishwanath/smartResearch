import React from 'react';

interface UploadedFileProps {
    file: File;
    summary: string;
  }
  
  const UploadedFile: React.FC<UploadedFileProps> = ({ file, summary }) => {
    // Add null checks to prevent errors
    if (!file) {
      return (
        <div className="uploaded-file error">
          <h3>Error</h3>
          <p>File data unavailable</p>
        </div>
      );
    }
  
    return (
      <div className="uploaded-file">
        <h3>{file.name}</h3>
        <p className="file-size">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="summary">{summary}</p>
      </div>
    );
  };
  
  export default UploadedFile;
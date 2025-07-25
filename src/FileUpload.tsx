import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onFileUpload: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            onFileUpload(selectedFile);
        } else {
            setFile(null);
            onFileUpload(null);
        }
    };
      
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="file-upload-container">
            <button 
                onClick={handleButtonClick}
                className="file-upload-button"
                type="button"
            >
                {file ? `Selected: ${file.name}` : 'Select File'}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".txt,.pdf,.doc,.docx,.csv,.json"
            />
            {file && (
                <div className="file-info">
                    <p>File: {file.name}</p>
                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
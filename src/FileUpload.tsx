import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
    onFileUpload: (file: File | null) => void;
    onUploadComplete?: (fileId: string) => void;
    onUploadError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileUpload, 
    onUploadComplete, 
    onUploadError 
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            
            // Validate file type
            const allowedTypes = ['.pdf', '.txt', '.doc', '.docx'];
            const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
            
            if (allowedTypes.indexOf(fileExtension) === -1) {
                onUploadError?.('Please select a valid file type (PDF, TXT, DOC, DOCX)');
                return;
            }
            
            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                onUploadError?.('File size must be less than 10MB');
                return;
            }
            
            setFile(selectedFile);
            await uploadFile(selectedFile);
        } else {
            setFile(null);
            onFileUpload(null);
        }
    };
    
    const uploadFile = async (fileToUpload: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);
            
            // Upload to your backend
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            });
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            onFileUpload(fileToUpload);
            onUploadComplete?.(result.fileId);
            
            // Reset after successful upload
            setTimeout(() => {
                setFile(null);
                setUploadProgress(0);
                setIsUploading(false);
            }, 1000);
            
        } catch (error) {
            setIsUploading(false);
            setUploadProgress(0);
            onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
        }
    };
      
    const handleButtonClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="file-upload-container">
            <button 
                onClick={handleButtonClick}
                className="file-upload-button"
                type="button"
                disabled={isUploading}
            >
                {isUploading ? (
                    <div className="upload-progress">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <span>{uploadProgress}%</span>
                    </div>
                ) : file ? (
                    `Selected: ${file.name}`
                ) : (
                    'Select File'
                )}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".txt,.pdf,.doc,.docx,.csv,.json"
                disabled={isUploading}
            />
            {file && !isUploading && (
                <div className="file-info">
                    <p>File: {file.name}</p>
                    <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
            )}
            {isUploading && (
                <div className="upload-status">
                    <p>Uploading...</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
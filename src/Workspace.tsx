import React, { useRef, useState } from 'react';
import './Workspace.css';
import UploadedFile from './UploadedFile';
import SearchBar from './SearchBar';
import ResearchMap from './ResearchMap';

interface UploadedFileType {
  file: File;
  summary: string;
}

const Workspace: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://127.0.0.1:5000/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        let summary = 'Summary unavailable.';
        if (response.ok) {
          const result = await response.json();
          console.log('Backend response:', result); // Debug log
          summary = result.processing_result?.summary || 'Processing completed but no summary available.';
        } else {
          console.error('Upload failed:', response.status, response.statusText);
          summary = `Upload failed: ${response.status} ${response.statusText}`;
        }
        
        setUploadedFiles(prev => [...prev, { file, summary }]);
        
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => [...prev, { 
          file, 
          summary: 'Network error: Could not connect to server. Make sure backend is running and CORS is configured.' 
        }]);
      } finally {
        setIsLoading(false);
        e.target.value = ''; 
      }
    }
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Add your search logic here
    // You can filter uploadedFiles based on the query
  };

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    // Handle node clicks - could show details, open file, etc.
  };

  const handleMapReduce = (operation: 'cluster' | 'summarize' | 'filter') => {
    console.log('Map reduce operation:', operation);
    // Implement map reduce operations on uploaded files
    // This could call your backend semantic embeddings API
  };

  // Convert uploaded files to ResearchMap format
  const documentsForMap = uploadedFiles.map((file, index) => ({
    id: `doc-${index}`,
    title: file.file.name,
    summary: file.summary,
    sections: [] // Don't create duplicate sections for now
  }));

  return (
    <div className="workspace-content">
      <div className="map-container">
        <ResearchMap 
          documents={documentsForMap}
          onNodeClick={handleNodeClick}
          onMapReduce={handleMapReduce}
        />
      </div>
      <div className="search-section">

        <SearchBar 
          placeholder="Ask a question about your documents" 
          onSearch={handleSearch}
        />
      </div>
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
        {isLoading && <div className="loading">Uploading and processing...</div>}
        {uploadedFiles.map((uploadedFile, idx) => (
          <UploadedFile key={idx} file={uploadedFile.file} summary={uploadedFile.summary} />
        ))}
      </div>
  </div>
  );
}

export default Workspace; 
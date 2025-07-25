import React, { useState, ChangeEvent } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Call onSearch callback if provided
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`search-bar-container ${className}`}>
      <div className="search-bar">
        <svg 
          className="search-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
        />
        
        {searchQuery && (
          <button 
            onClick={handleClear}
            className="clear-button"
            type="button"
            aria-label="Clear search"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

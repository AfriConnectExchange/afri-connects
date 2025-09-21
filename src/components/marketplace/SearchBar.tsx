import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search products or sellers...",
  className = ""
}: SearchBarProps) {
  const [error, setError] = useState<string>('');

  const handleSearch = () => {
    // US014-AC03 - Invalid Search Input validation
    if (value.length < 3) {
      setError("Please enter at least 3 letters or numbers.");
      return;
    }

    // Check if input contains at least 3 alphanumeric characters
    const alphanumericCount = value.replace(/[^a-zA-Z0-9]/g, '').length;
    if (alphanumericCount < 3) {
      setError("Please enter at least 3 letters or numbers.");
      return;
    }

    setError('');
    onSearch(value);
  };

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    
    // Clear error when user starts typing a valid query
    if (newValue.length >= 3 && newValue.replace(/[^a-zA-Z0-9]/g, '').length >= 3) {
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearSearch = () => {
    onChange('');
    onSearch('');
    setError('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="product-search" className="block">Search Products</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="product-search"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`pl-10 pr-20 ${error ? 'border-destructive' : ''}`}
        />
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-7 w-7 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSearch}
            disabled={value.length === 0}
            className="h-7 px-2 text-xs"
          >
            Search
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
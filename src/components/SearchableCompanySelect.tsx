import React, { useState, useRef, useEffect } from 'react';
import { Search, Building, ChevronDown, Check, Plus } from 'lucide-react';

interface SearchableCompanySelectProps {
  companies: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchableCompanySelect: React.FC<SearchableCompanySelectProps> = ({
  companies,
  value,
  onChange,
  placeholder = 'Search or select client company...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search query with value when value changes
  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (companyName: string) => {
    onChange(companyName);
    setSearchQuery(companyName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val); // allow custom company on the fly
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1 text-xs animate-fadeIn">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((comp) => {
              const isSelected = comp.toUpperCase() === value.toUpperCase();
              return (
                <div
                  key={comp}
                  onClick={() => handleSelect(comp)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate uppercase">{comp}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                </div>
              );
            })
          ) : (
            <div className="p-2">
              <div
                onClick={() => handleSelect(searchQuery)}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg cursor-pointer flex items-center gap-2 font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Use Custom: "{searchQuery.toUpperCase()}"</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

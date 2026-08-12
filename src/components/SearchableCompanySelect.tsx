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
  companies = [],
  value,
  onChange,
  placeholder = 'Search or select client company...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default fallback companies if array is empty
  const defaultList = [
    'SOHONI METALS PVT LTD',
    'A1 FENCE PVT LTD',
    'TPACK PACKING INDIA PVT LTD',
    'WESTERN REFRIGERATION PVT LTD',
    'INTERIOR AND MORE LTD',
    'COPTEC',
    'COPTEC PRIVATE LIMITED',
    'UMBER CELL PVT LTD',
    'ALKON PLASTICS PVT LTD',
    'SRINI LINK PVT LTD',
    'STERLING GENERATORS PVT LTD',
    'ALKEM LABORATORIES LTD',
  ];

  const allCompaniesList = Array.from(
    new Set([...(companies.length > 0 ? companies : defaultList)])
  );

  // Sync internal search query with value prop
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

  // Filter companies: If search query is empty OR matches the selected value exactly, show ALL companies.
  // Otherwise, filter companies that include the search query string.
  const isSearchActive =
    searchQuery.trim().length > 0 &&
    searchQuery.trim().toUpperCase() !== (value || '').trim().toUpperCase();

  const filteredCompanies = isSearchActive
    ? allCompaniesList.filter((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCompaniesList;

  const handleSelect = (companyName: string) => {
    onChange(companyName);
    setSearchQuery(companyName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val); // allow typing a custom company
    setIsOpen(true);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select(); // Highlight text so user can immediately type or pick
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1 text-xs animate-fadeIn">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((comp) => {
              const isSelected = comp.toUpperCase() === (value || '').toUpperCase();
              return (
                <div
                  key={comp}
                  onClick={() => handleSelect(comp)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
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

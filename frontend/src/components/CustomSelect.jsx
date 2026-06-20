import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ options, value, onChange, placeholder = 'Select option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Selection Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-xl transition duration-150 outline-none text-sm cursor-pointer select-none"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <selectedOption.icon className={`w-4 h-4 ${selectedOption.color || 'text-zinc-400'}`} />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-h-60 overflow-y-auto outline-none animate-in fade-in slide-in-from-top-1 duration-100">
          <div className="py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition duration-150 select-none cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600/20 text-indigo-400 font-bold' 
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  }`}
                >
                  {opt.icon && (
                    <opt.icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : (opt.color || 'text-zinc-500')}`} />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

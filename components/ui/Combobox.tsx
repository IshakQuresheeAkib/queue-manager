'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

interface ComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  label,
  value,
  onChange,
  suggestions,
  placeholder = 'Type or select...',
  error,
  required,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Sync inputValue with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [inputValue, suggestions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Commit the current input value when closing
        if (inputValue.trim() !== '') {
          onChange(inputValue.trim());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Clear any existing blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Small delay to allow click on suggestion
    blurTimeoutRef.current = setTimeout(() => {
      if (inputValue.trim() !== '') {
        onChange(inputValue.trim());
      }
    }, 150);
  }, [inputValue, onChange]);

  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() !== '') {
        onChange(inputValue.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }, [inputValue, onChange]);

  const showAddNew = inputValue.trim() !== '' && 
    !suggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase());

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative"
    >
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2 pr-16
            border rounded-lg text-gray-200 bg-green-950/10 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-900 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-white hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }}
            disabled={disabled}
            className="p-1 text-white hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (filteredSuggestions.length > 0 || showAddNew) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {showAddNew && (
              <button
                type="button"
                onClick={() => handleSelectSuggestion(inputValue.trim())}
                className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium border-b border-gray-100 flex items-center gap-2"
              >
                <span className="text-blue-500">+</span>
                Add &quot;{inputValue.trim()}&quot;
              </button>
            )}
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                  ${suggestion.toLowerCase() === inputValue.toLowerCase() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                `}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

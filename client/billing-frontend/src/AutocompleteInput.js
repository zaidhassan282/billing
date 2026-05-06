import React, { useState, useRef, useEffect } from "react";
import "./AutocompleteInput.css";

function AutocompleteInput({ value, onChange, suggestions = [], onSelect = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, isAbove: false });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const wrapperRef = useRef(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (value && value.trim()) {
      const matches = suggestions.filter(suggestion =>
        (suggestion.nameOfParty || suggestion).toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(matches);
      setHighlightedIndex(-1);
      if (matches.length > 0) {
        setIsOpen(true);
      }
    } else {
      setFiltered([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value, suggestions]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const dropdownHeight = 250;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let positionObj = {
        width: rect.width,
        left: rect.left,
      };

      // Check if there's enough space below
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Position above
        positionObj.top = rect.top - dropdownHeight;
        positionObj.isAbove = true;
      } else {
        // Position below (default)
        positionObj.top = rect.bottom;
        positionObj.isAbove = false;
      }

      setDropdownPosition(positionObj);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filtered.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filtered.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (suggestion) => {
    const selectedName = suggestion.nameOfParty || suggestion;
    onChange(selectedName);
    if (onSelect && typeof suggestion === 'object') {
      onSelect(suggestion);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const getSuggestionName = (suggestion) => {
    return suggestion.nameOfParty || suggestion;
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        className="autocomplete-input"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type to search..."
      />

      {isOpen && filtered.length > 0 && (
        <div
          ref={dropdownRef}
          className={`autocomplete-dropdown-fixed ${dropdownPosition.isAbove ? 'above' : 'below'}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          {filtered.map((suggestion, index) => {
            const displayName = getSuggestionName(suggestion);
            return (
              <div
                key={index}
                className={`autocomplete-option ${highlightedIndex === index ? 'highlighted' : ''}`}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="option-text">{displayName}</span>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && value && filtered.length === 0 && (
        <div
          ref={dropdownRef}
          className={`autocomplete-dropdown-fixed ${dropdownPosition.isAbove ? 'above' : 'below'}`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div className="autocomplete-no-results">
            No matches found
          </div>
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;

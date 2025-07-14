import React, { useRef, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { InputGroup } from 'react-bootstrap';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './CustomTypeahead.css';

/**
 * CustomTypeahead component that wraps the react-bootstrap-typeahead component
 * with additional styling to fix the double X icon issue
 */
const CustomTypeahead = ({ id, labelKey, onChange, options, placeholder, selected, renderMenuItemChildren, ...props }) => {
  const typeaheadRef = useRef(null);

  // Function to manually clear the input
  const handleClear = () => {
    if (selected && selected.length > 0) {
      onChange([]);
    }
  };

  // Effect to modify the DOM directly to remove the browser's default X button
  useEffect(() => {
    if (typeaheadRef.current) {
      const inputElement = typeaheadRef.current.querySelector('input');
      if (inputElement) {
        // Apply styles to hide the browser's default clear button
        inputElement.style.cssText = `
          &::-webkit-search-cancel-button,
          &::-webkit-search-decoration,
          &::-webkit-search-results-button,
          &::-webkit-search-results-decoration {
            -webkit-appearance: none !important;
            display: none !important;
          }
        `;
      }
    }
  }, [typeaheadRef]);

  return (
    <div className="custom-typeahead-wrapper" ref={typeaheadRef}>
      <div className="search-icon-wrapper">
        <i className="bi bi-search search-icon"></i>
        <Typeahead
          id={id}
          labelKey={labelKey}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          selected={selected}
          renderMenuItemChildren={renderMenuItemChildren}
          clearButton
          inputProps={{
            className: "typeahead-input",
            autoComplete: "off",
            type: "text", // Use text instead of search to avoid browser's clear button
            spellCheck: false
          }}
          {...props}
        />
        {selected && selected.length > 0 && (
          <button 
            type="button" 
            className="custom-clear-button" 
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomTypeahead;

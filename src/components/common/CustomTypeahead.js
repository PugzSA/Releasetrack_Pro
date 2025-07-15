import React, { useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './CustomTypeahead.css';

const CustomTypeahead = React.forwardRef(
  ({ id, labelKey, onChange, options, placeholder, selected, renderMenuItemChildren, ...props }, ref) => {
    const handleClear = () => {
      if (selected && selected.length > 0) {
        onChange([]);
      }
      if (ref && ref.current) {
        ref.current.clear();
        ref.current.focus();
      }
    };

    useEffect(() => {
      if (ref && ref.current) {
        const rbtClearButton = ref.current.inputNode.closest('.rbt')?.querySelector('.rbt-input-hint-container + .rbt-close');
        if (rbtClearButton) {
          rbtClearButton.style.display = 'none';
        }
      }
    }, [ref]);

    return (
      <div className="custom-typeahead-wrapper">
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
            ref={ref}
            inputProps={{
              className: "typeahead-input",
              autoComplete: "off",
              type: "text",
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
  }
);

export default CustomTypeahead;

import { useState, useEffect, useRef } from "react";

export default function CustomSelect({ value, onChange, options, placeholder, isFormInput = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef(null);

  const closeDropdown = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 190);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(o => String(o.value) === String(value));

  return (
    <div ref={dropdownRef} className="custom-select-container dashboard-select-container">
      <div 
        className={`custom-select-trigger ${isFormInput ? "dashboard-select-trigger-form" : "dashboard-select-trigger-filter"} ${isOpen ? "open" : ""} ${selectedOption && selectedOption.value !== "" ? "has-value" : ""}`}
        onClick={() => {
          if (isOpen) {
            closeDropdown();
          } else {
            setIsOpen(true);
          }
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
          className={`dashboard-select-icon ${isOpen ? "open" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {isOpen && (
        <div className={`custom-select-options dashboard-select-options ${isClosing ? "closing" : ""}`}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option dashboard-select-option ${String(value) === String(option.value) ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                closeDropdown();
              }}
            >
              <span>{option.label}</span>
              {String(value) === String(option.value) && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

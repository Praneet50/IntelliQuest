import { useState, useRef, useEffect } from "react";

const CustomSelect = ({ value, onChange, options, label, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find the label for the current value
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || value;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-base-content/80 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg bg-gradient-to-b from-base-100 to-base-200 border-2 border-base-300 hover:border-primary/60 px-3 py-2.5 text-sm font-semibold text-base-content text-left flex items-center justify-between shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <span>{selectedLabel}</span>
          <svg
            aria-hidden="true"
            className={`h-4 w-4 text-base-content/50 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 mt-2 bg-base-100 border-2 border-base-300 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-sm"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
                    value === option.value
                      ? "bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;

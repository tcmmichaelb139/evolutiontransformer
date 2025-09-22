import { useState, useRef, useEffect } from "react";

const Dropdown = ({
  label,
  selectedValue,
  onSelect,
  options = [],
  placeholder = "Select an option...",
  disabled = false,
  loading = false,
  icon = null,
  className = "",
  dropdownClassName = "",
  optionClassName = "",
  showSearch = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No options available",
  loadingMessage = "Loading...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label
      ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
      : option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = selectedValue?.label || selectedValue || placeholder;
  const isSelected = selectedValue && selectedValue !== placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-secondary-300 hover:bg-primary-50 hover:shadow-lg ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-lg">{icon}</div>}
            <span
              className={`${
                isSelected
                  ? "text-secondary-800 font-medium"
                  : "text-secondary-500"
              } ${loading ? "text-secondary-400" : ""}`}
            >
              {loading ? loadingMessage : displayValue}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {loading && (
              <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
            )}
            <svg
              className={`w-5 h-5 text-primary-600 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              } ${disabled ? "text-secondary-400" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full mt-2 rounded-xl max-h-60 overflow-hidden bg-white border-2 border-primary-200 shadow-lg ${dropdownClassName}`}
        >
          {showSearch && (
            <div className="p-3 border-b border-secondary-100">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-primary-300 transition-colors text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-secondary-500">
                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                {loadingMessage}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-secondary-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option;
                const optionIcon = option.icon;
                const optionDescription = option.description;
                const isOptionSelected =
                  selectedValue === optionValue ||
                  (selectedValue?.value && selectedValue.value === optionValue);
                return (
                  <button
                    key={optionValue}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full p-3 text-left rounded-lg transition-all duration-200 hover:bg-blue-100 hover:text-blue-900 ${
                      isOptionSelected
                        ? "bg-gradient-to-r from-primary-200 to-accent-200 text-primary-800 font-medium"
                        : "text-secondary-700 hover:bg-blue-50"
                    } ${optionClassName}`}
                  >
                    <div className="flex items-center space-x-3">
                      {optionIcon && (
                        <div className="text-lg">{optionIcon}</div>
                      )}
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          isOptionSelected
                            ? "bg-primary-600"
                            : "bg-secondary-300"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {optionLabel}
                        </div>
                        {optionDescription && (
                          <div className="text-xs text-secondary-500 truncate mt-1">
                            {optionDescription}
                          </div>
                        )}
                      </div>
                      {isOptionSelected && (
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;

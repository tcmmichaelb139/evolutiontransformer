import { useState, useEffect, useRef } from "react";

const NumberInput = ({
  label,
  value,
  onChange,
  min = 1,
  max = 48,
  step = 1,
  allowDecimals = false,
  className = "",
  compact = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "");
  const prevDisabledRef = useRef(disabled);

  useEffect(() => {
    setInputValue(value?.toString() || "");
  }, [value]);

  useEffect(() => {
    if (disabled && !prevDisabledRef.current && allowDecimals) {
      const numValue = parseFloat(inputValue);
      if (
        inputValue === "" ||
        inputValue === "." ||
        isNaN(numValue) ||
        numValue < min ||
        numValue > max
      ) {
        const clampedValue = isNaN(numValue)
          ? min
          : Math.max(min, Math.min(max, numValue));
        setInputValue(clampedValue.toString());
        onChange(clampedValue);
      }
    }
    prevDisabledRef.current = disabled;
  }, [disabled, allowDecimals, inputValue, min, max, onChange]);

  const handleChange = (e) => {
    const inputVal = e.target.value;

    if (allowDecimals) {
      if (inputVal === ".") return;

      setInputValue(inputVal);

      if (inputVal !== "" && !inputVal.endsWith(".")) {
        const numValue = parseFloat(inputVal);
        if (!isNaN(numValue)) {
          onChange(numValue);
        }
      }
    } else {
      const cleanedInput = inputVal.includes(".")
        ? inputVal.split(".")[0]
        : inputVal;
      setInputValue(cleanedInput);

      if (cleanedInput === "") return;
      const numValue = parseInt(cleanedInput);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(min, Math.min(max, numValue));
        onChange(clampedValue);
        if (clampedValue !== numValue) {
          setInputValue(clampedValue.toString());
        }
      }
    }
  };

  const handleBlur = () => {
    if (
      inputValue === "" ||
      isNaN(allowDecimals ? parseFloat(inputValue) : parseInt(inputValue))
    ) {
      onChange(min);
      setInputValue(min.toString());
    } else if (allowDecimals) {
      const numValue = parseFloat(inputValue);
      const clampedValue = Math.max(min, Math.min(max, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  return (
    <div className={className}>
      {label && (
        <label
          className={`block font-medium text-secondary-700 ${
            compact ? "text-xs mb-1" : "text-sm mb-2"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          step={step}
          disabled={disabled}
          className={`w-full bg-white border-2 border-secondary-300 hover:bg-primary-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 text-secondary-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
            compact ? "p-2 rounded-lg text-sm" : "p-4 rounded-xl"
          }`}
          min={min}
          max={max}
        />
        <div
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
            compact ? "right-1" : "right-3"
          }`}
        >
          <div
            className={`text-secondary-500 bg-white px-1 py-0.5 rounded border border-secondary-200 ${
              compact ? "text-xs px-1" : "text-xs px-2 py-1"
            }`}
          >
            {min}-{max}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberInput;

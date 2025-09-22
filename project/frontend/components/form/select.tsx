import React, { ChangeEvent } from "react";

interface SelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  className = "",
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id}>
        {name.charAt(0).toUpperCase() + name.slice(1, name.length)}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`mt-1 w-full h-12 bg-darkGray px-4 transition-all duration-100 border border-white text-white ${
          error ? "border-2 border-red-500" : ""
        }  ${className}`}
      >
        {options.map((option) => (
          <option
            className="text-black"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Select;

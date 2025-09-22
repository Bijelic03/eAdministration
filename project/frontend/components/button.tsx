import React, {
  ReactNode,
  MouseEventHandler,
  ButtonHTMLAttributes,
} from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  tooltip?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "button",
  className = "",
  onClick,
  tooltip,
  ...rest
}) => {
  return (
    <div className="relative inline-block group">
      <button
        type={type}
        className={`hover:cursor-pointer p-2 max-w-64 font-bold transition duration-300 hover:text-yellow-300 rounded-sm ${className}`}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>

      {tooltip && (
        <span className="absolute bottom-full border-1 left-1/2 mb-2 -translate-x-1/2 bg-gray-800 text-white text-md rounded px-3 py-2 whitespace-nowrap hidden group-hover:block z-50 font-bold">
          {tooltip}
        </span>
      )}
    </div>
  );
};

export default Button;

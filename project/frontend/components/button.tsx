import React, { ReactNode, MouseEventHandler, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) => {
  return (
    <button type={type} className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default Button;

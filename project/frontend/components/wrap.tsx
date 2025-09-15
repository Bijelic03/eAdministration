import React, { ReactNode } from 'react';

interface WrapProps {
  children: ReactNode;
  className?: string;
}

const Wrap: React.FC<WrapProps> = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto max-w-[1350px] w-full px-4 ${className}`}>
      {children}
    </div>
  );
};

export default Wrap;

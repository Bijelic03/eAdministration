'use client'
import React, { ReactNode } from 'react';
import GoBack from './go-back';

interface WrapProps {
  children: ReactNode;
  className?: string;
  withGoBack?: boolean;
}

const Wrap: React.FC<WrapProps> = ({ children, className = '', withGoBack = true }) => {
  return (
    <div className={`mx-auto max-w-[1350px] w-full p-20 ${className}`}>
      {withGoBack && <GoBack />}
      {children}
    </div>
  );
};

export default Wrap;

'use client';

import { FC, ReactNode } from 'react';

interface ToasterProps {
  children?: ReactNode;
}

export const Toaster: FC<ToasterProps> = ({ children }) => {
  return (
    <div id="toaster-container" className="fixed top-4 right-4 z-50">
      {children}
    </div>
  );
};

export default Toaster;
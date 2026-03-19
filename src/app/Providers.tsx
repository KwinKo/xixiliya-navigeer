'use client';

import React, { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
};

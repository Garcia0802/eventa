import React, { createContext, useContext, useMemo, useState } from 'react';

const DemoProfileContext = createContext(null);

export function DemoProfileProvider({ children }) {
  const [selectedProfile, setSelectedProfile] = useState('PARTICIPANT');

  const value = useMemo(
    () => ({ selectedProfile, setSelectedProfile }),
    [selectedProfile]
  );

  return (
    <DemoProfileContext.Provider value={value}>{children}</DemoProfileContext.Provider>
  );
}

export function useDemoProfile() {
  const context = useContext(DemoProfileContext);

  if (!context) {
    throw new Error('useDemoProfile must be used within DemoProfileProvider');
  }

  return context;
}

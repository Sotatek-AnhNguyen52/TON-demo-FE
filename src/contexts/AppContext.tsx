import React, { PropsWithChildren, useEffect, useState, createContext, useContext, useRef } from 'react';

interface AppContextModel {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const AppContext = createContext<AppContextModel | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface PropsFC extends PropsWithChildren {}

export const AppProvider: React.FC<PropsFC> = ({ children }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  const value = {
    count,
    increment,
    decrement
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
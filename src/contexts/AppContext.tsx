import React, { PropsWithChildren, useEffect, useState, createContext, useContext, useRef } from 'react';
import { UserInfo } from '../types/common';
import { parseTGHashData } from '../helper';
import { loginUser } from '../service/game-service';
import { JWT, LOGGED_USER, TWA_HASH } from '../constant';

interface AppContextModel {
  count: number;
  increment: () => void;
  decrement: () => void;
  userInfo: UserInfo | null;
  authToken: string | null;
}

const AppContext = createContext<AppContextModel | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface PropsFC extends PropsWithChildren { }

export const AppProvider: React.FC<PropsFC> = ({ children }) => {
  const [count, setCount] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (!window.location.hash.includes(TWA_HASH)) {
      return;
    }
    const hash = window.location.hash.substring(1);
    const parsedData = parseTGHashData(hash);
    if (parsedData) {
      const loggedUser = Number(localStorage.getItem(LOGGED_USER));
      if (loggedUser && loggedUser === parsedData.id) {
        return;
      }
      setUserInfo(parsedData);
      loginUser(parsedData).then((data) => {
        if (data) {
          setAuthToken(data.sync_data.auth_token);
          localStorage.setItem(LOGGED_USER, parsedData.id.toString());
          localStorage.setItem(JWT, data.sync_data.auth_token);
          console.log('Logged in successfully:', data);
        }
      });
    }
  }, [window.location.hash]);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  const value = {
    count,
    increment,
    decrement,
    userInfo,
    authToken
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

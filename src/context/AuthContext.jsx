import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getStoredUser());

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem('authUser', JSON.stringify(userData));
    } else {
      localStorage.removeItem('authUser');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

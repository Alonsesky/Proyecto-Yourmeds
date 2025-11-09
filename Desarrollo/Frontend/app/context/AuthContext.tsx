import React, { createContext, useEffect, useMemo, useState } from "react";
import { isJwtExpired } from "../services/jwt"; // opcional
import { clearToken, getToken, saveToken } from "../services/storage";

type AuthContextType = {
  hasSession: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  hasSession: false, loading: true, signIn: async () => {}, signOut: async () => {}
});

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const token = await getToken();
    if (token && !isJwtExpired(token)) setHasSession(true); // o solo: if (token) setHasSession(true)
    setLoading(false);
  })(); }, []);

  const value = useMemo(() => ({
    hasSession,
    loading,
    signIn: async (token: string) => {
      await saveToken(token);
      // (opcional) verificar exp aquí también
      setHasSession(true);
    },
    signOut: async () => {
      await clearToken();
      setHasSession(false);
    }
  }), [hasSession, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useEffect, useMemo, useState } from "react";
import { isJwtExpired } from "../services/jwt";
import { clearSession, getToken, saveToken } from "../services/storage";

type AuthContextType = {
  hasSession: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  hasSession: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token && !isJwtExpired(token)) {
          setHasSession(true);
        } else {
          await clearSession();
          setHasSession(false);
        }
      } catch (e) {
        console.warn("[AuthProvider] Error leyendo token", e);
        setHasSession(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      hasSession,
      loading,
      signIn: async (token: string) => {
        if (!token) {
          await clearSession();
          setHasSession(false);
          return;
        }
        await saveToken(token);
        setHasSession(true);
      },
      signOut: async () => {
        await clearSession();
        setHasSession(false);
      },
    }),
    [hasSession, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

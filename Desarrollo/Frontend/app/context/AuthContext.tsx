import React, { createContext, useContext, useState } from 'react';

export type Me = { id: number; email: string; fullName: string };

type AuthCtx = {
  user: Me | null;
  setUser: (u: Me | null) => void;
};

const Ctx = createContext<AuthCtx>({ user: null, setUser: () => {} });

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Estado global del usuario
  const [user, setUser] = useState<Me | null>(null);

  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;
};

// Hook de ayuda para consumir el contexto
export const useAuth = () => useContext(Ctx);

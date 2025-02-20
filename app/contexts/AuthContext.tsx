import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type User = {
  loginId: string;
  role: string;
};

type AuthContextType = {
  me: User | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  me,
}: {
  children: ReactNode;
  me: User;
}) {
  return <AuthContext.Provider value={{ me }}>{children}</AuthContext.Provider>;
}

export function useMe() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useMe must be used within an AuthProvider");
  }
  return context.me;
}

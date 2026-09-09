// import React, { createContext, useContext, useEffect } from "react";
// import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
// import { useLocation } from "wouter";
// import type { Officer } from "@workspace/api-client-react";

// interface AuthContextType {
//   officer: Officer | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType>({
//   officer: null,
//   isLoading: true,
//   isAuthenticated: false,
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [location, setLocation] = useLocation();

//   const { data: officer, isLoading } = useGetMe(undefined, {
//     query: {
//       enabled: true,
//       queryKey: getGetMeQueryKey(),
//       retry: false,
//     },
//   });

//   const isAuthenticated = !!officer;

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated && location !== "/login") {
//       setLocation("/login");
//     }
//   }, [isLoading, isAuthenticated, location, setLocation]);

//   return (
//     <AuthContext.Provider
//       value={{ officer: officer ?? null, isLoading, isAuthenticated }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }

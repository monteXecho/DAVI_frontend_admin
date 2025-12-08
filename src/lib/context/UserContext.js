// "use client";

// import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useKeycloak } from "@react-keycloak/web";
// import { useApi } from "@/lib/useApi";

// const UserContext = createContext(null);

// export function UserProvider({ children }) {
//   const router = useRouter();
//   const { keycloak, initialized } = useKeycloak();
//   const { getUser } = useApi();

//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const hasRedirectedRef = useRef(false);

//   const isAuthenticated = useMemo(
//     () => initialized && !!keycloak?.authenticated,
//     [initialized, keycloak?.authenticated]
//   );

//   useEffect(() => {
//     if (!isAuthenticated) {
//       setUser(null);
//       setLoading(false);
//       hasRedirectedRef.current = false; 
//       return;
//     }

//     let mounted = true;
//     const load = async () => {
//       setLoading(true);
//       try {
//         const u = await getUser();
//         if (!mounted) return;
//         setUser(u ?? null);
//       } catch (err) {
//         console.error("User fetch failed:", err);
//         if (mounted) setUser(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     load();

//     return () => {
//       mounted = false;
//     };
//   }, [isAuthenticated, getUser]);

//   useEffect(() => {
//     if (loading || !user || !isAuthenticated) return;

//     try {
//       const isTeam = !!user?.is_teamlid;
      
//       const roleSelected = typeof window !== "undefined" && localStorage.getItem("roleSelected");
      
//       const alreadyRedirected = typeof window !== "undefined" && 
//         sessionStorage.getItem("teamlidRedirected") === "true";

//       console.log("Redirect check:", {
//         isTeam,
//         roleSelected,
//         alreadyRedirected,
//         hasRedirectedRef: hasRedirectedRef.current
//       });

//       if (isTeam && !roleSelected && !alreadyRedirected && !hasRedirectedRef.current) {
//         console.log("Redirecting to /userswitch");
        
//         hasRedirectedRef.current = true;
        
//         if (typeof window !== "undefined") {
//           sessionStorage.setItem("teamlidRedirected", "true");
//         }
        
//         setTimeout(() => {
//           router.push("/userswitch");
//         }, 10);
//       }
      
//       if (roleSelected && typeof window !== "undefined") {
//         sessionStorage.removeItem("teamlidRedirected");
//         hasRedirectedRef.current = false;
//       }
//     } catch (e) {
//       console.warn("Teamlid redirect check failed:", e);
//     }
//   }, [loading, user, isAuthenticated, router]);

//   const roles = useMemo(() => {
//     if (!isAuthenticated) {
//       return {
//         isSuperAdmin: false,
//         isCompanyAdmin: false,
//         isCompanyUser: false,
//       };
//     }
//     const r = keycloak?.tokenParsed?.realm_access?.roles || [];
//     return {
//       isSuperAdmin: r.includes("super_admin"),
//       isCompanyAdmin: r.includes("company_admin"),
//       isCompanyUser: r.includes("company_user"),
//     };
//   }, [isAuthenticated, keycloak?.tokenParsed]);

//   const logout = useCallback(() => {
//     try {
//       hasRedirectedRef.current = false;
      
//       if (typeof window !== "undefined") {
//         try {
//           localStorage.removeItem("roleSelected");
//           sessionStorage.removeItem("teamlidRedirected");
//         } catch (e) {
//           console.warn("Failed to clear storage:", e);
//         }
//       }

//       const redirectUri = (typeof window !== "undefined" && window.location?.origin) || "/";

//       if (keycloak) {
//         setTimeout(() => {
//           try {
//             keycloak.logout({ redirectUri });
//           } catch (err) {
//             console.warn("keycloak.logout threw:", err);
//             router.push("/");
//           }
//         }, 25);
//         return;
//       }

//       router.push("/");
//     } catch (err) {
//       console.error("Logout error:", err);
//       router.push("/");
//     }
//   }, [keycloak, router]);

//   const value = useMemo(() => ({
//     user,
//     setUser,
//     roles,
//     loading,
//     isAuthenticated,
//     logout
//   }), [user, roles, loading, isAuthenticated, logout]);

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// }

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };

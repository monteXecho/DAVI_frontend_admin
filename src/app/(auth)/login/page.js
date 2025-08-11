// 'use client'

// import { useKeycloak } from '@react-keycloak/web'

// export default function Login() {
//   const { keycloak, initialized } = useKeycloak()

//   if (!initialized) return <p>Loading...</p>

//   return (
//     <div className="flex h-screen items-center justify-center">
//       <div className="p-6 bg-white shadow rounded text-center">
//         <h1 className="text-xl font-bold mb-4">Sign In</h1>
//         {!keycloak.authenticated ? (
//           <button
//             onClick={() => keycloak.login()}
//             className="rounded bg-blue-600 text-white px-4 py-2"
//           >
//             Sign In with Keycloak
//           </button>
//         ) : (
//           <div>
//             <p>Welcome, {keycloak.tokenParsed?.preferred_username}</p>
//             <button
//               onClick={() => keycloak.logout()}
//               className="mt-2 text-sm text-red-500"
//             >
//               Logout
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

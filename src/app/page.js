import MainLayout from "@/components/layout/mainLayout"
import DocumentClient from "./(protected)/documentchat/DocumentClient";
import ProtectedRoute from "@/components/ProtectedRoute";
// import { UserProvider } from "@/lib/context/UserContext";

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

export default function Home() {
  return (
    <ProtectedRoute>
      {/* <UserProvider> */}
        <MainLayout>
          <DocumentClient />
        </MainLayout>
      {/* </UserProvider> */}
    </ProtectedRoute>
  );
}

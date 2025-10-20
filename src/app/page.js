import Landing from "./(protected)/landing/page";
import MainLayout from "@/components/layout/mainLayout"
import DocumentClient from "./(protected)/documentchat/DocumentClient";

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

export default function Home() {
  return (
    <MainLayout>
      {/* <Landing /> */}
      <DocumentClient />
    </MainLayout>
  );
}

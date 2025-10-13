import Landing from "./landing/page";
import MainLayout from "@/components/layout/mainLayout"

export const metadata = {
  title: 'DAVI',
  description: 'RAG_DAVI',
}

export default function Home() {
  return (
    <MainLayout>
      <Landing />
    </MainLayout>
  );
}

import PublicChatPage from "./PublicChatPage";

export default async function Page({ params }) {
  const p = await params;
  return <PublicChatPage params={p} />;
}


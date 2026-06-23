import PublicChat from "./PublicChat";

export default function PublicChatPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <PublicChat />
      </div>
    </div>
  );
}

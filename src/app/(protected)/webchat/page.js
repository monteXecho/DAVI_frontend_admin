import WebChat from "./WebChat"

export default function WebChatPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <WebChat />
            </div>
        </div>
    )
}


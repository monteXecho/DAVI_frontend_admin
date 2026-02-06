import React from "react";

const Message = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-lg px-3 md:px-4 py-2 md:py-3 shadow-sm ${
          isUser
            ? "bg-[#23BD92] text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm md:text-base leading-relaxed">{message}</div>
      </div>
    </div>
  );
};

export default Message;

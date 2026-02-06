import React, { useState, useRef, useEffect } from "react";
import Message from "./Message";
import TaskSelector from "./TaskSelector";
import { useI18n, useTaskLabel } from "../i18nContext.jsx";

const Chat = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [taskType, setTaskType] = useState("draft");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    const newUserMessage = { text: userMessage, isUser: true };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Get API base URL from environment variable, fallback to relative path
      const apiBaseUrl = "https://demo.daviapp.nl/llm";
      const apiUrl = `${apiBaseUrl}/api/chat`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          task_type: taskType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to get response");
      }

      const data = await response.json();
      const aiMessage = { text: data.response, isUser: false };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        text: t("error.generic", { message: error.message }),
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">{t("app.title")}</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{t("app.subtitle")}</p>
      </div>

      {/* Task Selector */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 shrink-0">
        <TaskSelector taskType={taskType} onTaskChange={setTaskType} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-gray-500 px-4">
              <p className="text-base md:text-lg mb-2">{t("chat.welcomeTitle")}</p>
              <p className="text-xs md:text-sm">{t("chat.welcomeBody")}</p>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg.text} isUser={msg.isUser} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-3 rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.placeholder", {
              task: useTaskLabel(taskType),
            })}
            className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23BD92] resize-none text-sm md:text-base"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#23BD92] text-white rounded-lg font-medium hover:bg-[#1a9d7a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm md:text-base whitespace-nowrap"
          >
            {t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

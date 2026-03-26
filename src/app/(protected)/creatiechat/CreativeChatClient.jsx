"use client";

import { useState, useRef, useEffect } from "react";
import { useCreativeChatI18n } from "./contexts/CreativeChatI18nContext";
import CreativeChatInput from "./components/CreativeChatInput";
import FormattedResponse from "./components/FormattedResponse";

const TONE_TO_TASK_TYPE = {
  Schrijven: "draft",
  Herschrijven: "rewrite",
  Brainstormen: "brainstorm",
  SMART: "smart",
};

export default function CreativeChatClient() {
  const { t, language } = useCreativeChatI18n();
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const smartSessionIdRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const [loading, setLoading] = useState(false);
  const hasHistory = messages.length > 0;
  const abortControllerRef = useRef(null);
  const cancelledRef = useRef(false);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      cancelledRef.current = true;
      abortControllerRef.current.abort();
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", contentKey: "creativeChat.cancelledMessage" },
      ]);
    }
  };

  const handleSubmit = async (content, tone) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);
    cancelledRef.current = false;
    abortControllerRef.current = new AbortController();

    const taskType = TONE_TO_TASK_TYPE[tone] ?? "draft";

    if (taskType !== "smart") {
      smartSessionIdRef.current = null;
    } else if (!smartSessionIdRef.current) {
      smartSessionIdRef.current =
        (typeof crypto !== "undefined" && crypto.randomUUID?.()) ??
        "smart-" + Date.now();
    }

    try {
      // Get API base URL from environment variable, fallback to default
      const apiBaseUrl = process.env.NEXT_PUBLIC_LLM_API_BASE_URL || "https://demo.daviapp.nl/llm";
      const apiUrl = `${apiBaseUrl}/api/chat`;

      const body = {
        message: content,
        task_type: taskType,
        lang: language
      };
      if (taskType === "smart" && smartSessionIdRef.current) {
        body.session_id = smartSessionIdRef.current;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Failed to get response" }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.response ?? "";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, responseType: data.response_type },
      ]);
    } catch (err) {
      if (cancelledRef.current || err.name === "AbortError") {
        return;
      }
      const detail =
        err.message ||
        t("creativeChat.errorGeneric");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: detail },
      ]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div
      className="w-full flex flex-col min-h-[calc(100dvh-220px)] lg:min-h-0 h-full px-[25px] py-3 pb-4 lg:px-[97px] lg:py-[81px] scrollbar-hide">
      <div className={`flex flex-col min-h-0 flex-1 w-full mx-auto`}>
        <div className="mb-2 lg:mb-4 shrink-0">
          <h1 className="text-2xl lg:text-4xl font-bold font-montserrat mb-1 lg:mb-2">CreatieChat</h1>
          <p className="text-gray-600 font-montserrat text-sm lg:text-base">
            Schrijf, herschrijf en brainstorm met hulp van AI.
          </p>
        </div>
        {hasHistory && (
          <div className="w-full flex-1 min-h-0 overflow-y-auto space-y-6 mb-4 lg:mb-6 pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`w-full max-w-2xl ${
                  msg.role === "user" ? "ml-auto" : ""
                }`}
              >
                <div
                  className={`w-fit max-w-[85%] rounded-xl px-4 py-3 font-montserrat text-[16px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#F9FBFA] text-[#342222] ml-auto"
                      : "text-black"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.contentKey ? t(msg.contentKey) : msg.content
                  ) : (
                    <FormattedResponse content={msg.contentKey ? t(msg.contentKey) : msg.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
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
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input at bottom */}
        <div className="w-full shrink-0 mt-auto">
          <CreativeChatInput
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
        </div>
      </div>
    </div>
  );
}

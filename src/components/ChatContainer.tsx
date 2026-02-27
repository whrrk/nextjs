"use client";
import ChatInput from "./ChatInput";
import type { ChatContainerProps } from "@/types/chat";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";

export default function ChatContainer({
  isNewChat,
  initialMessages,
  conversationId,
}: ChatContainerProps) {
  const { messages, isLoading, setConversationId, setMessages, clearMessage } =
    useChatStore();

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isNewChat) {
      clearMessage();
      setConversationId("");
    }
    if (conversationId) {
      setConversationId(conversationId);
    }
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [
    isNewChat,
    clearMessage,
    setConversationId,
    initialMessages,
    conversationId,
    setMessages,
  ]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* <div className="flex items-start justify-end">
          <div className="bg-white rounded-lg my-2 py-3 px-4">
            <p className="text-gray-800">ここに文章が入ります</p>
          </div>
        </div> */}

        {messages.length === 0 && !isLoading ? (
          <div className="my-12 text-center text-slate-500">
            <p>メッセージを送信してください</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`
                flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4
                `}
            >
                <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}

        <div ref={endOfMessagesRef} />

        {/* ローディングインジケーター */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div className="shrink-0 border-t border-slate-200 bg-white/80 py-4 backdrop-blur">
        <ChatInput />
      </div>
    </div>
  );
}

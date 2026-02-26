"use client";
import ChatInput from "./ChatInput";
import type { ChatContainerProps } from "@/types/chat";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";

export default function ChatContainer({
  isNewChat,
  initialMessages,
  conversationId,
  userId,
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
    <div className="flex flex-col h-full">
      {/* メッセージ表示エリア */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* <div className="flex items-start justify-end">
          <div className="bg-white rounded-lg my-2 py-3 px-4">
            <p className="text-gray-800">ここに文章が入ります</p>
          </div>
        </div> */}

        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-gray-500 my-12">
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
                className={`rounded-lg py-3 px-4 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-100 text-gray-800"
                    : "bg-white text-gray-800"
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
            <div className="bg-white text-gray-800 px-4 py-3 rounded-lg rounded-tl-none">
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
      <div className="flex-shrink-0 border-t py-4">
        <ChatInput userId={userId} />
      </div>
    </div>
  );
}

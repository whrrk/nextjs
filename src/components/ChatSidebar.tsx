"use client";
import type { ChatProps } from "@/types/chat";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import type { Conversation } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatSidebar({ userId }: ChatProps) {
  const router = useRouter();

  const { setConversations, conversations, conversationId, resetStore } =
    useChatStore();

  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations?userId=${userId}`);
      const data = await response.json();

      console.log(data.data);

      if (data.data) {
        const formattedConversations = data.data.map((conv: Conversation) => ({
          id: conv.id,
          name: conv.name,
          updatedAt: conv.updated_at * 1000, // JSの日時に変換
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error("会話リスト取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = () => {
    resetStore();
    router.push("/chat");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4">
        <Button onClick={handleNewChat} className="bg-indigo-700 w-full">
          <Plus size={16} />
          <span>新規チャット</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="flex justify-between items-center px-2 mb-2">
          <h3 className="text-sm font-medium">会話履歴</h3>
        </div>
        {isLoading && conversations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">読み込み中...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            会話履歴がありません
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="relative">
                <Link
                  href={`/chat/${conversation.id}`}
                  className={`
                    flex items-center p-2 my-2 text-sm rounded-lg hover:bg-slate-200
                    ${conversationId === conversation.id ? "bg-slate-200" : ""}`}
                >
                  <div className="flex-1">
                    <p className="truncate font-medium">{conversation.name}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

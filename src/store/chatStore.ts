import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// メッセージ
export type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

// 会話リスト
export type Conversation = {
  id?: string;
  name: string;
  updated_at: number;
};

// ストアの状態の型を定義
interface ChatStore {
  // 状態
  conversationId: string | null;
  isLoading: boolean;
  messages: Message[];
  conversations: Conversation[];

  // アクション
  setConversationId: (id: string) => void;
  setMessages: (message: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessage: () => void;
  setConversations: (conversation: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
}

// Zustandストアを作成
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // 初期状態
      conversationId: null,
      messages: [],
      conversations: [],
      isLoading: false,

      // アクション
      setConversationId: (id: string) => set({ conversationId: id }),
      setMessages: (messages: Message[]) => set({ messages }),
      addMessage: (message: Message) =>
        set((state) => {
          return { messages: [...state.messages, message] };
        }),
      updateMessage: (id: string, content: string) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, content } : message,
          ),
        })),
      clearMessage: () => set({ messages: [] }),
      setConversations: (conversations: Conversation[]) =>
        set({ conversations }),

      setLoading: (loading) => set({ isLoading: loading }),
      resetStore: () =>
        set({
          conversationId: null,
          messages: [],
          // conversations: [],
          isLoading: false,
        }),
    }),
    {
      name: "dify-chat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversationId: state.conversationId,
        messages: state.messages,
        conversations: state.conversations,
      }),
    },
  ),
);

import type { Message } from "@/store/chatStore";

export interface ChatContainerProps {
  isNewChat: boolean;
  initialMessages: Message[];
  conversationId?: string | null;
}

export interface ChatProps {
  userId: string;
}

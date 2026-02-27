import ChatContainer from "@/components/ChatContainer";
import { auth } from "@/auth";
import { getDifyBaseUrl, getDifyChatApiKey } from "@/lib/dify";

type Params = {
  params: Promise<{
    conversationId: string;
  }>;
};

type DifyMessage = {
  id?: string;
  query: string;
  answer: string;
};

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export default async function ChatPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id as string;

  const { conversationId } = await params;
  const messages: Message[] = [];
  const baseUrl = getDifyBaseUrl();
  const difyApiKey = getDifyChatApiKey();

  try {
    if (!baseUrl || !difyApiKey) {
      throw new Error("Dify API is not configured");
    }

    const response = await fetch(
      `${baseUrl}/messages?user=${userId}&conversation_id=${conversationId}&limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${difyApiKey}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (data.data) {
      data.data.forEach((message: DifyMessage) => {
        if (message.query) {
          messages.push({
            id: `${message.id}-user`,
            role: "user",
            content: message.query,
          });
        }

        if (message.answer) {
          messages.push({
            id: `${message.id}`,
            role: "assistant",
            content: message.answer,
          });
        }
      });
    }

    console.log("messages:", messages);
  } catch (error) {
    console.error("メッセージ取得不可", error);
  }

  return (
    <ChatContainer
      isNewChat={false}
      initialMessages={messages}
      conversationId={conversationId}
    />
  );
}

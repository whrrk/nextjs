import ChatContainer from "@/components/ChatContainer";
import { auth } from "@/auth";

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

const endpoint = `${process.env.DIFY_API_URL}/messages`;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

export default async function ChatPage({ params }: Params) {
  const session = await auth();
  const userId = session?.user?.id as string;

  const { conversationId } = await params;
  const messages: Message[] = [];

  try {
    const response = await fetch(
      `${endpoint}?user=${userId}&conversation_id=${conversationId}&limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DIFY_API_KEY}`,
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
      userId={userId}
    />
  );
}

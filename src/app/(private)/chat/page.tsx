import ChatContainer from "@/components/ChatContainer";
import { auth } from "@/auth";

export default async function ChatPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  return (
    <ChatContainer
      isNewChat={true}
      initialMessages={[]}
      conversationId={null}
      userId={userId}
    />
  );
}

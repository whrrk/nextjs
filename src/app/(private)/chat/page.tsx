import ChatContainer from "@/components/ChatContainer";
import { auth } from "@/auth";

export default async function ChatPage() {
  await auth();

  return (
    <ChatContainer
      isNewChat={true}
      initialMessages={[]}
      conversationId={null}
    />
  );
}

import { prisma } from "@/lib/prisma";

export type ChatFlowType = {
  conversation_id: string;
  metadata: {
    usage: {
      total_tokens: number;
      total_price: string;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
};

export async function createConversation(
  data: ChatFlowType,
  userId: string,
  query: string,
) {
  await prisma.conversation.create({
    data: {
      difyConversationId: data.conversation_id,
      userId: userId,
      title: query.substring(0, 30) + "...",
      totalTokens: data.metadata.usage.total_tokens,
      totalCost: parseFloat(data.metadata.usage.total_price),
    },
  });
}

export async function updateConversation(data: ChatFlowType, userId: string) {
  await prisma.conversation.upsert({
    where: {
      difyConversationId_userId: {
        difyConversationId: data.conversation_id,
        userId: userId,
      },
    },
    update: {
      totalTokens: data.metadata.usage.total_tokens,
      totalCost: parseFloat(data.metadata.usage.total_price),
    },
    create: {
      difyConversationId: data.conversation_id,
      userId: userId,
      totalTokens: data.metadata.usage.total_tokens,
      totalCost: parseFloat(data.metadata.usage.total_price),
    },
  });
}

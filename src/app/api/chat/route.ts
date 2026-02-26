import { NextRequest, NextResponse } from "next/server";
import { createConversation, updateConversation } from "@/lib/conversation";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

const endpoint = `${process.env.DIFY_API_URL}/chat-messages`;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId, conversationId } = body;

    // 通信前 使用量制限をチェック
    const usageCheck = await checkUsageLimit(userId);

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.message,
        },
        { status: 403 },
      );
    }

    // DifyワークフローAPI接続
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: {},
        query: query,
        response_mode: "blocking",
        user: userId,
        conversation_id: conversationId || "",
      }),
    });

    const data = await response.json();

    // トークン数
    const tokenCount = data.metadata?.usage?.total_tokens || 0;
    // 使用量を増加
    await incrementUsage(userId, tokenCount);

    if (!conversationId) {
      createConversation(data, userId, query);
    } else {
      updateConversation(data, userId);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("APIエラー", error);
    return NextResponse.json("Dify側でエラーが発生しました");
  }
}

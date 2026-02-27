import { NextRequest, NextResponse } from "next/server";
import { Agent } from "undici";
import { createConversation, updateConversation } from "@/lib/conversation";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";
import { auth } from "@/auth";
import { getDifyBaseUrl, getDifyChatApiKey } from "@/lib/dify";
import type { ChatFlowType } from "@/lib/conversation";

const difyHttpAgent = new Agent({
  bodyTimeout: 0,
  headersTimeout: 0,
});

type UndiciRequestInit = RequestInit & {
  dispatcher?: Agent;
};

function parseSseDataBlocks(raw: string) {
  const lines = raw.split(/\r?\n/);
  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());
  if (dataLines.length === 0) return null;
  return dataLines.join("\n");
}

function createSseRelayStream(
  source: ReadableStream<Uint8Array>,
  params: { userId: string; query: string; conversationId?: string },
) {
  const reader = source.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let buffer = "";
  let streamConversationId = params.conversationId?.trim() || "";
  let totalTokens = 0;
  let totalPrice = "0";
  let closedByMessageEnd = false;
  let isControllerClosed = false;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const closeSafely = () => {
        if (isControllerClosed) return;
        isControllerClosed = true;
        controller.close();
      };

      const forceCloseTimer = setTimeout(async () => {
        try {
          console.warn("[chat proxy] force close relay stream by timeout");
          await reader.cancel();
        } catch {
          // noop
        } finally {
          closeSafely();
        }
      }, 45000);

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let separatorIndex = buffer.search(/\r?\n\r?\n/);
          while (separatorIndex !== -1) {
            const block = buffer.slice(0, separatorIndex);
            const matchedSeparator = buffer
              .slice(separatorIndex)
              .match(/^\r?\n\r?\n/);
            const separatorLength = matchedSeparator?.[0]?.length ?? 2;
            buffer = buffer.slice(separatorIndex + separatorLength);

            const dataRaw = parseSseDataBlocks(block);
            if (dataRaw && dataRaw !== "[DONE]") {
              try {
                const payload = JSON.parse(dataRaw);
                if (typeof payload?.conversation_id === "string") {
                  streamConversationId = payload.conversation_id;
                }
                if (payload?.event === "message_end") {
                  totalTokens =
                    payload?.metadata?.usage?.total_tokens ?? totalTokens;
                  totalPrice =
                    payload?.metadata?.usage?.total_price?.toString() ??
                    totalPrice;
                  closedByMessageEnd = true;
                  console.log("[chat proxy] message_end received");
                }
              } catch {
                // pass through invalid event payloads as-is
              }
            }

            controller.enqueue(encoder.encode(`${block}\n\n`));

            if (closedByMessageEnd) {
              await reader.cancel();
              break;
            }

            separatorIndex = buffer.search(/\r?\n\r?\n/);
          }

          if (closedByMessageEnd) break;
        }

        if (streamConversationId) {
          try {
            await incrementUsage(params.userId, totalTokens);

            const conversationData: ChatFlowType = {
              conversation_id: streamConversationId,
              metadata: {
                usage: {
                  total_tokens: totalTokens,
                  total_price: totalPrice,
                },
              },
            };

            if (!params.conversationId) {
              await createConversation(
                conversationData,
                params.userId,
                params.query,
              );
            } else {
              await updateConversation(conversationData, params.userId);
            }
          } catch (error) {
            // DB sync failure should not break an already-streamed response.
            console.error("conversation sync error:", error);
          }
        }
      } catch (error) {
        console.error("sse relay error:", error);
        controller.error(error);
        return;
      } finally {
        clearTimeout(forceCloseTimer);
        reader.releaseLock();
      }

      console.log("[chat proxy] relay stream closed");
      closeSafely();
    },
    async cancel() {
      await reader.cancel();
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseUrl = getDifyBaseUrl();
    const difyApiKey = getDifyChatApiKey();

    if (!baseUrl || !difyApiKey) {
      return NextResponse.json(
        { error: "Dify API is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { query, conversationId } = body;

    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

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
    console.log("[chat proxy] forwarding request", {
      target: `${baseUrl}/chat-messages`,
      userId,
      hasConversationId: Boolean(conversationId),
    });
    const difyRequestBody: Record<string, unknown> = {
      inputs: {},
      query: query.trim(),
      response_mode: "streaming",
      user: userId,
    };

    if (typeof conversationId === "string" && conversationId.trim()) {
      difyRequestBody.conversation_id = conversationId.trim();
    }

    const requestInit: UndiciRequestInit = {
      dispatcher: difyHttpAgent,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${difyApiKey}`,
      },
      body: JSON.stringify(difyRequestBody),
    };

    const response = await fetch(`${baseUrl}/chat-messages`, requestInit);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage =
        data?.message || data?.error || data?.msg || "Dify request failed";
      return NextResponse.json(
        { error: errorMessage, details: data },
        { status: response.status },
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "Empty streaming response from Dify" },
        { status: 502 },
      );
    }

    const relayStream = createSseRelayStream(response.body, {
      userId,
      query: query.trim(),
      conversationId:
        typeof conversationId === "string" ? conversationId : undefined,
    });

    return new NextResponse(relayStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("APIエラー", error);
    const code = (error as { cause?: { code?: string } })?.cause?.code;
    if (code === "UND_ERR_BODY_TIMEOUT") {
      return NextResponse.json(
        {
          error:
            "Dify streaming response timed out on proxy. Check upstream/proxy buffering settings.",
        },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Dify側でエラーが発生しました" },
      { status: 500 },
    );
  }
}

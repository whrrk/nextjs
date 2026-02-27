import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const { conversationId, setConversationId, addMessage, updateMessage, setLoading } =
    useChatStore();

  const callDifyApi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const query = input.trim();
    if (!query) return;

    try {
      setLoading(true);

      addMessage({
        role: "user",
        content: query,
      });
      setInput("");

      const assistantMessageId = `assistant-temp-${Date.now()}`;
      addMessage({
        id: assistantMessageId,
        role: "assistant",
        content: "",
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          conversationId: conversationId,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const message =
          result?.error ||
          result?.message ||
          "リクエストの処理中にエラーが発生しました。";
        if (response.status === 403) {
          toast("利用制限に達しました", {
            description:
              "月間の利用回数制限に達しました。プランをアップグレードしてください。",
          });
        } else {
          toast("エラーが発生しました", {
            description: message,
          });
        }
        console.error("chat api error:", response.status, result);
        updateMessage(assistantMessageId, "エラーが発生しました。");
        setInput(query);
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      // Fallback: proxy/environment may collapse stream into a single JSON response.
      if (contentType.includes("application/json")) {
        const result = await response.json().catch(() => ({}));
        const answer =
          typeof result?.answer === "string"
            ? result.answer
            : typeof result?.data?.answer === "string"
              ? result.data.answer
              : "";
        if (answer) {
          updateMessage(assistantMessageId, answer);
        } else {
          updateMessage(
            assistantMessageId,
            "응답 포맷을 해석하지 못했습니다. 네트워크 응답 본문을 확인해주세요.",
          );
        }

        const resolvedConversationId =
          typeof result?.conversation_id === "string"
            ? result.conversation_id
            : typeof result?.data?.conversation_id === "string"
              ? result.data.conversation_id
              : conversationId;

        if (resolvedConversationId && !conversationId) {
          setConversationId(resolvedConversationId);
          router.replace(`/chat/${resolvedConversationId}`);
        } else {
          router.refresh();
        }
        return;
      }

      if (!response.body) {
        updateMessage(assistantMessageId, "空のレスポンスを受信しました。");
        setInput(query);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";
      let nextConversationId = conversationId;
      let isCompleted = false;
      let hasAnyChunk = false;

      while (!isCompleted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.search(/\r?\n\r?\n/);
        while (separatorIndex !== -1) {
          const rawEvent = buffer.slice(0, separatorIndex);
          const matchedSeparator = buffer
            .slice(separatorIndex)
            .match(/^\r?\n\r?\n/);
          const separatorLength = matchedSeparator?.[0]?.length ?? 2;
          buffer = buffer.slice(separatorIndex + separatorLength);

          const data = rawEvent
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");

          if (data && data !== "[DONE]") {
            try {
              const payload = JSON.parse(data);
              hasAnyChunk = true;
              if (
                typeof payload?.conversation_id === "string" &&
                payload.conversation_id
              ) {
                nextConversationId = payload.conversation_id;
              } else if (
                typeof payload?.data?.conversation_id === "string" &&
                payload.data.conversation_id
              ) {
                nextConversationId = payload.data.conversation_id;
              }
              const answerChunk =
                typeof payload?.answer === "string"
                  ? payload.answer
                  : typeof payload?.data?.answer === "string"
                    ? payload.data.answer
                    : "";
              if (answerChunk) {
                fullAnswer += answerChunk;
                updateMessage(assistantMessageId, fullAnswer);
              }
              if (
                payload?.event === "message_end" ||
                payload?.event === "agent_message_end"
              ) {
                isCompleted = true;
                await reader.cancel();
                break;
              }
            } catch {
              // ignore invalid chunks
            }
          }

          separatorIndex = buffer.search(/\r?\n\r?\n/);
        }
      }

      if (!hasAnyChunk) {
        updateMessage(
          assistantMessageId,
          "응답 스트림을 수신하지 못했습니다. 네트워크/프록시 설정을 확인해주세요.",
        );
      }

      if (nextConversationId && !conversationId) {
        setConversationId(nextConversationId);
        router.replace(`/chat/${nextConversationId}`);
      }
    } catch (error) {
      console.error("API接続に失敗", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        ref={formRef}
        onSubmit={callDifyApi}
        className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4"
      >
        <div className="flex items-center gap-2">
          <Textarea
            className="min-h-15 max-h-50 flex-1 resize-none rounded-xl border-slate-300 bg-slate-50 text-sm md:text-base"
            placeholder="メッセージを入力してください"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
          ></Textarea>
          <Button
            type="submit"
            className="h-10 shrink-0 bg-slate-900 px-4 text-white shadow-sm hover:bg-slate-700"
          >
            送信
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  );
}

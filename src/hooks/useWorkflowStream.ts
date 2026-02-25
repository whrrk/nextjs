import { useState, useRef, useEffect } from "react";

interface EventSourceType {
  event: string;
  workflow_run_id: string;
  task_id: string;
  data: {
    text?: string;
    node_type?: string;
    outputs?: {
      result?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function useWorkflowStream() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);
  const completeTextRef = useRef("");

  const callDifyApi = () => {
    if (!input.trim()) return;

    setOutput("処理を開始しています...");
    completeTextRef.current = "";

    // 既存の接続があれば閉じる
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `/api/workflow-stream?query=${input}&userId=user-123`;
    const eventSource = new EventSource(url);
    const es = new EventSource(url);

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE connected");
    };

    // チャンクが届くたびに発火
    eventSource.onmessage = (event) => {
      console.log("COmming???");
      try {
        const eventData = JSON.parse(event.data);
        console.log("eventData: " + eventData);
        handleEventData(eventData);
      } catch (error) {
        console.error("データ解析エラー", error, event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error("イベント取得エラー", error);
      console.log("readyState:", eventSource.readyState);
      eventSource.close();
    };
  };

  const handleEventData = (eventData: EventSourceType) => {
    console.log("イベント受信", eventData.event);
    if (eventData.event === "text_chunk") {
      appendText(eventData.data.text as string);
    }

    if (eventData.event === "workflow_finished") {
      if (
        completeTextRef.current === "" ||
        completeTextRef.current === "処理を開始しています..."
      ) {
        appendText(eventData.data.outputs?.result as string);
      }
      if (eventSourceRef.current) eventSourceRef.current.close();
    }
  };

  const appendText = (text: string) => {
    if (!text.trim()) return;

    completeTextRef.current += text;
    setOutput(completeTextRef.current);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    input,
    setInput,
    output,
    callDifyApi,
  };
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDifyBaseUrl, getDifyChatApiKey } from "@/lib/dify";

export async function GET() {
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

    // DifyワークフローAPI接続
    const response = await fetch(`${baseUrl}/conversations?user=${userId}&limit=50`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${difyApiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Dify request failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("APIエラー", error);
    return NextResponse.json(
      { error: "Dify側でエラーが発生しました" },
      { status: 500 },
    );
  }
}

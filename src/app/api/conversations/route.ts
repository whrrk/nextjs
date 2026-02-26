import { NextRequest, NextResponse } from "next/server";

const endpoint = `${process.env.DIFY_API_URL}/conversations`;
const DIFY_API_KEY = process.env.DIFY_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // DifyワークフローAPI接続
    const response = await fetch(`${endpoint}?user=${userId}&limit=50`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("APIエラー", error);
    return NextResponse.json("Dify側でエラーが発生しました");
  }
}

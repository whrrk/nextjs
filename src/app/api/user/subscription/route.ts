import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const isSubscribed =
      subscription !== null &&
      subscription.plan === "PRO" &&
      subscription.status === "ACTIVE" &&
      subscription.currentPeriodEnd &&
      new Date(subscription.currentPeriodEnd) > new Date();

    return NextResponse.json({ isSubscribed });
  } catch (error) {
    console.error("サブスク情報取得エラー", error);
    return NextResponse.json({
      isSubscribed: false,
      error: "サブスク情報取得に失敗",
    });
  }
}

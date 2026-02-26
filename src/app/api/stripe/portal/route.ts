import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/stripe/session";

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string;

    // StripeカスタマーIDの取得
    const stripeCustomerId = await getStripeCustomerId(userId);

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 },
      );
    }

    // Stripeカスタマーポータルセッションの作成
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("カスタマーポータルエラー", error);
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 },
    );
  }
}

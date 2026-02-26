import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "@/lib/stripe/webhook";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text(); // 生データ
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "署名またはwebhookシークレットがありません" },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
    console.log(event);

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event);
    }

    if (event.type === "customer.subscription.updated") {
      await handleSubscriptionUpdated(event);
    }

    if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("webhookエラー", error);
    const statusCode =
      error instanceof Stripe.errors.StripeSignatureVerificationError
        ? 400
        : 500;
    return NextResponse.json({ error: "決済失敗" }, { status: statusCode });
  }
}

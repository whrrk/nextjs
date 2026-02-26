import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getOrCreateStripeCustomer(
  userId: string,
  user: User | null,
): Promise<string> {
  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }
  // 既存のStripe顧客IDを検索
  const existingCustomer = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  // 既存のカスタマーIDがあればそれを返す
  if (existingCustomer?.stripeCustomerId) {
    return existingCustomer.stripeCustomerId;
  }

  // 新しいStripe顧客を作成
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name || undefined,
    metadata: { userId: user.id },
  });

  // データベースに保存
  await prisma.stripeCustomer.create({
    data: {
      userId: user.id,
      stripeCustomerId: customer.id,
    },
  });
  return customer.id;
}

// チェックアウトセッションを作成する
export async function createCheckoutSession(
  userId: string,
  stripeCustomerId: string,
) {
  const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

  if (!PRO_PLAN_PRICE_ID) {
    throw new Error("STRIPE_PRO_PRICE_ID is not defined");
  }

  // チェックアウトセッション作成
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: PRO_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
    metadata: { userId },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });
  return checkoutSession;
}

// Stripe顧客ID取得
export async function getStripeCustomerId(userId: string) {
  const customer = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  return customer?.stripeCustomerId;
}

import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { saveSubscription } from "@/lib/stripe/subscription";

export async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId as string;
  const subscriptionId = session.subscription as string;

  // 追加情報の取得
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log(subscription);

  const priceId = subscription.items.data[0]?.price.id;
  const customer = subscription.customer as string;
  const startDate = new Date(
    subscription.items.data[0]?.current_period_start * 1000,
  );
  const endDate = new Date(
    subscription.items.data[0]?.current_period_end * 1000,
  );
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // サブスクリプション情報をDBに保存
  await saveSubscription(
    userId,
    customer,
    priceId,
    subscriptionId,
    startDate,
    endDate,
    cancelAtPeriodEnd,
  );
}

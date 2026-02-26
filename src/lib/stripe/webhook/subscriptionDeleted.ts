import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  try {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: "CANCELED",
        plan: "FREE",
        cancelAtPeriodEnd: false,
        endsAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("サブスク更新エラー", error);
  }
}

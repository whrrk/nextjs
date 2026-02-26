import { prisma } from "@/lib/prisma";

export async function saveSubscription(
  userId: string,
  stripeCustomerId: string,
  stripePriceId: string,
  stripeSubscriptionId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: boolean = false,
) {
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId,
      stripePriceId,
      stripeSubscriptionId,
      status: "ACTIVE",
      plan: "PRO", // Stripe決済完了時はPROプラン
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
    create: {
      userId,
      stripeCustomerId,
      stripePriceId,
      stripeSubscriptionId,
      status: "ACTIVE",
      plan: "PRO", // Stripe決済完了時はPROプラン
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
  });
}

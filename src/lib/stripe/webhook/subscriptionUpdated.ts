import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { Prisma, SubscriptionStatus } from "@prisma/client";

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  try {
    // DBからサブスクを検索
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!dbSubscription) {
      console.log(`サブスク${subscriptionId}がDBに見つかりません`);
      return;
    }

    // 更新データを準備
    const updateData: Prisma.SubscriptionUpdateInput = {
      updatedAt: new Date(),
    };

    // サブスク項目から期間を取得
    const subscriptionItem = subscription.items?.data?.[0];
    if (subscriptionItem) {
      if (subscriptionItem.current_period_start) {
        updateData.currentPeriodStart = new Date(
          subscriptionItem.current_period_start * 1000,
        );
      }
      if (subscriptionItem.current_period_end) {
        updateData.currentPeriodEnd = new Date(
          subscriptionItem.current_period_end * 1000,
        );
      }
    }

    // キャンセル状態の変更処理
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    if (cancelAtPeriodEnd !== dbSubscription.cancelAtPeriodEnd) {
      updateData.cancelAtPeriodEnd = cancelAtPeriodEnd;

      // キャンセルのキャンセル
      if (dbSubscription.cancelAtPeriodEnd && !cancelAtPeriodEnd) {
        updateData.status = SubscriptionStatus.ACTIVE;
        updateData.endsAt = null;
      }
      // 新たにキャンセル予定に設定
      if (!dbSubscription.cancelAtPeriodEnd && cancelAtPeriodEnd) {
        updateData.status = SubscriptionStatus.CANCELED;
      }
    }

    // DB更新
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: updateData,
    });
  } catch (error) {
    console.error("サブスク更新エラー", error);
    throw error;
  }
}

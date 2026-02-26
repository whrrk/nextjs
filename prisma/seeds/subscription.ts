import { prisma } from "../../src/lib/prisma";
import { PlanType, SubscriptionStatus } from "@prisma/client";

export async function seedSubscriptions() {
  // ユーザー情報を取得
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@example.com" },
  });
  const regularUser = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });
  if (!adminUser || !regularUser) {
    console.error("ユーザーが見つかりません");
    return;
  }
  // 管理者ユーザーのサブスクリプション (Proプラン)
  const adminSubscription = await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      plan: PlanType.PRO,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
    },
  });
  console.log(`Admin用サブスク: ${adminSubscription.id}`);
  // 一般ユーザーのサブスクリプション (Freeプラン)
  const userSubscription = await prisma.subscription.create({
    data: {
      userId: regularUser.id,
      plan: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
    },
  });
  console.log(`User用サブスク: ${userSubscription.id}`);

  // 月初の日付を取得
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  // 使用量データの作成
  await prisma.usageStat.create({
    data: {
      userId: adminUser.id,
      count: 25, // Proプランで25回使用
      period: firstDayOfMonth,
    },
  });

  await prisma.usageStat.create({
    data: {
      userId: regularUser.id,
      count: 0, // Freeプランで0回使用
      period: firstDayOfMonth,
    },
  });
}

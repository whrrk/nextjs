import { prisma } from "./prisma";
// プラン別の利用制限を定義
export const PLAN_LIMITS = { FREE: 5, PRO: 100 };

// 月初めの日付を取得
export function getFirstDayOfMonth(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}

// ユーザーの使用状況を取得
export async function getUserUsage(userId: string) {
  const firstDayOfMonth = getFirstDayOfMonth();

  // ユーザーのサブスクリプション情報を取得
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });

  // 今月の使用量を取得
  const usage = await prisma.usageStat.findUnique({
    where: { userId_period: { userId, period: firstDayOfMonth } },
  });

  // プラン別の制限を取得
  const limit = PLAN_LIMITS[subscription?.plan ?? "FREE"];
  return {
    usage: usage?.count || 0,
    tokensUsed: usage?.tokensUsed || 0,
    limit,
    plan: subscription?.plan,
    isLimited: (usage?.count || 0) >= limit,
  };
}

// 使用量チェックと制限の確認
export async function checkUsageLimit(userId: string) {
  const { plan, isLimited } = await getUserUsage(userId);

  if (isLimited) {
    return {
      allowed: false,
      message:
        plan === "FREE"
          ? "無料プランの上限に達しました。Proプランへのアップグレードをご検討ください。"
          : "今月の会話上限に達しました。来月までお待ちください。",
    };
  }
  return { allowed: true };
}

// 使用量を増加させる
export async function incrementUsage(userId: string, tokenCount: number) {
  const firstDayOfMonth = getFirstDayOfMonth();

  return prisma.usageStat.upsert({
    where: { userId_period: { userId, period: firstDayOfMonth } },
    update: { count: { increment: 1 }, tokensUsed: { increment: tokenCount } },
    create: {
      userId,
      period: firstDayOfMonth,
      count: 1,
      tokensUsed: tokenCount,
    },
  });
}

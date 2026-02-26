import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
} from "@/lib/stripe/session";

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const stripeCustomerId = await getOrCreateStripeCustomer(userId, user);

    const checkoutSession = await createCheckoutSession(
      userId,
      stripeCustomerId,
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("決済エラー", error);
    return NextResponse.json({ error: "決済処理中にエラー" }, { status: 500 });
  }
}

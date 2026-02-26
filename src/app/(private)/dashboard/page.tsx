"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

function SubscriptionContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  // サブスク状態のチェック
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/user/subscription");
        const data = await response.json();
        setIsSubscribed(data.isSubscribed);
      } catch (error) {
        console.error("サブスク状態取得エラー", error);
      }
    };
    checkSubscription();
  }, []);

  // 通知表示
  useEffect(() => {
    if (success) {
      toast("サブスクリプション成功", {
        description: "Proプランへのサブスクリプションが完了しました!",
      });
      router.replace("/subscription");
    }
    if (canceled) {
      toast("サブスクリプションキャンセル", {
        description: "チェックアウトがキャンセルされました",
      });
      router.replace("/subscription");
    }
  }, [success, canceled, router]);

  // 支払いプロセス
  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error("サブスクリプション処理エラー", error);
      toast("エラー", {
        description: "サブスクリプション処理中にエラーが発生しました。",
      });
    } finally {
      setLoading(false);
    }
  };

  // カスタマーポータルにリダイレクト
  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.url) {
        router.push(data.url);
      } else {
        throw new Error("ポータルURLの取得に失敗しました");
      }
    } catch (error) {
      console.error("ポータルアクセスエラー", error);
      toast("エラー", {
        description: "サブスクリプション管理ページへのアクセスに失敗しました",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {isSubscribed ? "現在のプラン: Pro" : "プランをアップグレード"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSubscribed
              ? "Proプランをご利用いただきありがとうございます"
              : "Proプラン より多くの会話と機能を利用できます"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Proプラン</h2>
            <p className="text-gray-600 mb-4">
              より多くの会話と高度な機能を利用できます
            </p>
            <div className="text-3xl font-bold mb-4">
              $5<span className="text-lg text-gray-500">/月</span>
            </div>
            {isSubscribed && (
              <p className="text-sm text-emerald-600 font-medium">
                現在ご利用中のプランです
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {isSubscribed ? (
            <Button onClick={handleManageSubscription} className="w-full py-2">
              Stripeで請求・支払い情報を管理
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-2"
            >
              {loading ? "処理中..." : "Proプランにアップグレード"}
            </Button>
          )}

          <p className="text-xs text-gray-500 text-center">
            サブスクリプションはいつでもキャンセルできます。
            クレジットカードで安全に決済されます。
          </p>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <SubscriptionContent />
    </Suspense>
  );
}

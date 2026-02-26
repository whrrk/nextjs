import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserUsage } from "@/lib/usage";
import { ChatProps } from "@/types/chat";

export default async function UserUsage({ userId }: ChatProps) {
  const { usage, limit, plan, tokensUsed } = await getUserUsage(userId);
  const percentage = Math.min(100, Math.round((usage / limit) * 100));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">使用状況</CardTitle>
        <CardDescription>今月の利用状況</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">使用回数</span>
          <span className="text-sm text-gray-500">
            {usage} / {limit}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>現在のプラン</span>
            <span className="font-medium">
              {plan === "FREE" ? "無料プラン" : "Proプラン"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>使用済みトークン</span>
            <span className="font-medium">{tokensUsed.toLocaleString()}</span>
          </div>
        </div>

        {plan === "FREE" ? (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              {usage >= limit
                ? "無料プランの上限に達しました。"
                : `実行可能数 残り${limit - usage}回。`}
            </p>
            <Link href="/subscription">
              <Button className="w-full">Proプランにアップグレード</Button>
            </Link>
          </div>
        ) : (
          // proプラン用の表示
          <div className="mt-4 pt-4 border-t">
            <Link href="/subscription">
              <Button className="w-full">プラン内容の確認</Button>
            </Link>
          </div>
        )}
        <div className="mt-4 flex justify-between">
          <Link href="/chat">
            <div className="text-sm text-indigo-700">
              チャット画面に移動する
            </div>
          </Link>
          <Link href="/subscription">
            <div className="text-sm text-indigo-700">プラン詳細を見る</div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

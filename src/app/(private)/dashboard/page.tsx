import { auth } from "@/auth";
import UserUsage from "@/components/UserUsage";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id as string;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <UserUsage userId={userId} />
      </div>
    </div>
  );
}

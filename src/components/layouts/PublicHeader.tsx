import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default function PublicHeader() {
  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/"
                    className="rounded-md px-2 py-1 text-lg font-semibold tracking-tight text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    会話テスト
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* 検索ボックス、ログイン、登録ボタン */}
          <div className="flex items-center gap-4">
            <Input
              placeholder="記事を検索..."
              className="w-50 border-slate-300 bg-slate-50 lg:w-75"
            />
            <Button variant="outline" asChild className="border-slate-300">
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-700">
              <Link href="/register">登録</Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}

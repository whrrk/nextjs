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
      <header className="border-b bg-blue-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" passHref>
                  <NavigationMenuLink className="font-bold text-xl">
                    Blog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* 検索ボックス、ログイン、登録ボタン */}
          <div className="flex items-center gap-4">
            <Input placeholder="記事を検索。。。" className="w-50 lg:w-75" />
            <Button variant="outline" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/register">登録</Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Setting from "./Setting";
import { auth } from "@/auth";

export default async function PrivateHeader() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("不正なリクエストです");
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/dashboard"
                  className="rounded-md px-2 py-1 text-lg font-semibold tracking-tight text-slate-800 transition-colors hover:bg-slate-100"
                >
                  Console
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Setting session={session} />
      </div>
    </header>
  );
}

import ChatSidebar from "@/components/ChatSidebar";
import { auth } from "@/auth";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth();

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white md:flex-row">
      <div className="order-2 h-64 w-full border-t border-slate-200/80 bg-white/80 backdrop-blur md:order-1 md:h-full md:w-80 md:border-r md:border-t-0">
        <ChatSidebar />
      </div>
      <div className="order-1 flex-1 overflow-y-auto p-3 md:order-2 md:p-6">
        {children}
      </div>
    </div>
  );
}

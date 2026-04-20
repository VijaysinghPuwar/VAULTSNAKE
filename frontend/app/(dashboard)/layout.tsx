import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-cyber-bg lg:flex">
      <Sidebar />
      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { Sidebar, MobileNav } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] gap-8">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1">
          <TopBar />
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

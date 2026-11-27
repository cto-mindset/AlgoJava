import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { TitleBar } from "./TitleBar";
import { ToastViewport } from "@/components/ui/Toast";
import { UpdateNotificationDialog } from "@/components/shared/UpdateNotificationDialog";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TitleBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <Outlet />
        </main>
      </div>
      <UpdateNotificationDialog />
      <ToastViewport />
    </div>
  );
}

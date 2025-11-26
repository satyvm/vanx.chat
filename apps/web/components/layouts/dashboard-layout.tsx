import { AppSidebar } from "@/components/app-sidebar";
import { ChatListProvider } from "@/components/chat-list-provider";
import { SidebarInset, SidebarProvider } from "@vanx/ui/components/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatListProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-0 flex flex-col h-full">
          <div className="flex flex-1 min-h-0 max-w-full flex-col p-4 h-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ChatListProvider>
  );
}

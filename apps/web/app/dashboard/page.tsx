import { ChatInput } from "@/components/chat-input";
import { CommandK } from "@/components/command-k";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function Page() {
  return (
    <DashboardLayout>
      <div className="bg-muted/50 flex-1 rounded-xl" />
      <ChatInput />
      <CommandK />
    </DashboardLayout>
  );
}

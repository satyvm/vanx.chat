"use client";

import { ChatContent } from "@/app/chat/chat-content";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function NewChatPage() {
  return (
    <DashboardLayout>
      <ChatContent />
    </DashboardLayout>
  );
}

import { ChatContent } from "@/app/chat/chat-content";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  return (
    <DashboardLayout>
      <ChatContent initialChatId={chatId} />
    </DashboardLayout>
  );
}

import { ChatInput } from "@/components/chat-input";
import { CommandK } from "@/components/command-k";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@vanx/ui/components/breadcrumb";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

export default function Page() {
  return (
    <DashboardLayout
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Chats</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>
                Which is the best model for coding?
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
    >
      <div className="bg-muted/50 flex-1 rounded-xl" />
      <ChatInput />
      <CommandK />
    </DashboardLayout>
  );
}

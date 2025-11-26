"use client";

import * as React from "react";
import { Plus, MessageCircle, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { NavChats } from "@/components/nav-chat";
import { NavUser } from "@/components/nav-user";
import { useChatList } from "@/components/chat-list-provider";
import { useCommandK } from "@/components/command-k";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@vanx/ui/components/sidebar";
import { cn } from "@vanx/ui/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    isLoading,
    error: chatError,
  } = useChatList();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { setOpen: setCommandOpen } = useCommandK();

  const chatLinks = chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    href: `/chat/${chat.id}`,
    description: chat.description,
  }));

  const isChatListPage = pathname === "/chat";
  const isNewChatPage = pathname === "/chat/new";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger
            className={cn(
              "size-8 rounded-md transition-colors border-2 border-transparent hover:border-sidebar-border focus-visible:border-sidebar-border",
            )}
          />
          {!isCollapsed && (
            <>
              <SidebarMenuButton
                onClick={() => setCommandOpen(true)}
                className="size-8 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <SearchIcon className="h-4 w-4 shrink-0" />
              </SidebarMenuButton>
              <span className="font-semibold text-base text-sidebar-foreground">
                Vanx
              </span>
            </>
          )}
        </div>
      </SidebarHeader>
      {!isCollapsed && (
        <>
          <SidebarContent>
            <div className="px-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveChatId(undefined);
                      router.push("/chat/new");
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium justify-start h-8 rounded-lg"
                    isActive={isNewChatPage}
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>New chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveChatId(undefined);
                      router.push("/chat");
                    }}
                    className="justify-start h-8"
                    isActive={isChatListPage && !isNewChatPage}
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span>Chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
            <NavChats
              chats={chatLinks}
              activeChatId={activeChatId}
              isLoading={isLoading}
              errorMessage={chatError}
              onSelect={setActiveChatId}
            />
          </SidebarContent>
          <SidebarFooter>
            <NavUser
              user={{
                name: "root",
                email: "root@vanx.chat",
                avatar: "https://avatar.vercel.sh/vanx?text=VX",
              }}
            />
          </SidebarFooter>
        </>
      )}
      <SidebarRail />
    </Sidebar>
  );
}

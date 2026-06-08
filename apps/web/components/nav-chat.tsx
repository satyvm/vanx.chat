"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@vanx/ui/components/sidebar";

interface ChatNavItem {
  id: string;
  title: string;
  href: string;
  description?: string | null;
}

export function NavChats({
  chats,
  isLoading,
  activeChatId,
  onSelect,
  errorMessage,
}: {
  chats: ChatNavItem[];
  isLoading?: boolean;
  activeChatId?: string;
  onSelect?: (chatId?: string) => void;
  errorMessage?: string | null;
}) {
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className={isCollapsed ? "py-0" : ""}>
      {!isCollapsed && <SidebarGroupLabel>Chats</SidebarGroupLabel>}
      <SidebarMenu>
        {isLoading ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground h-8" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              {!isCollapsed && <span>Loading chats...</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : chats.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground h-8" disabled>
              {!isCollapsed && (
                <span>
                  {errorMessage ? "Unable to load chats" : "No chats yet"}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                isActive={chat.id === activeChatId}
                tooltip={isCollapsed ? chat.title : undefined}
                onClick={() => {
                  onSelect?.(chat.id);
                  router.push(chat.href);
                }}
                className="justify-start h-8"
              >
                {!isCollapsed && (
                  <span className="truncate text-left">{chat.title}</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

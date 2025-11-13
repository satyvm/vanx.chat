"use client";

import { Fragment } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@vanx/ui/components/sidebar";
import { LucideIcon } from "lucide-react";

export function NavChats({
  chats,
}: {
  chats: {
    title: string;
    icon: LucideIcon;
    url: string;
    items?: {
      id: number;
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className={isCollapsed ? "py-0" : ""}>
      {!isCollapsed && <SidebarGroupLabel>Chats</SidebarGroupLabel>}
      <SidebarMenu>
        {chats.map((item) =>
          isCollapsed ? (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Fragment key={item.title}>
              {item.items && (
                <>
                  {item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.id}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuItem>
                  ))}
                </>
              )}
            </Fragment>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

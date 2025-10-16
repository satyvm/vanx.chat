"use client";

import * as React from "react";
import {
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Hash,
} from "lucide-react";

import { NavSearch } from "@/components/nav-search";
import { NavChats } from "@/components/nav-chat";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@vanx/ui/components/sidebar";

// This is sample data.
const data = {
  user: {
    name: "root",
    email: "root@vanx.chat",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Vanx Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  chats: [
    {
      id: 1,
      title: "Which is the best model for coding?",
      url: "#",
    },
    {
      id: 2,
      title: "How to build a website?",
      url: "#",
    },
    {
      id: 3,
      title: "How to build a mobile app?",
      url: "#",
    },
  ],
  navMain: [
    {
      title: "Tags",
      url: "#",
      icon: Hash,
      items: [
        {
          title: "Code",
          url: "#",
        },
        {
          title: "Business",
          url: "#",
        },
        {
          title: "Linux",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Gemini",
          url: "#",
        },
        {
          title: "Claude",
          url: "#",
        },
        {
          title: "ChatGPT",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavSearch />
        <NavChats chats={data.chats} />
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

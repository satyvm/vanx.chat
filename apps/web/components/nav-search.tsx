import { SearchIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@vanx/ui/components/sidebar";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@vanx/ui/components/input-group";

export function NavSearch() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className="px-2">
      <SidebarMenu>
        <SidebarMenuItem>
          {isCollapsed ? (
            <SidebarMenuButton tooltip="Search">
              <SearchIcon className="h-4 w-4 shrink-0" />
            </SidebarMenuButton>
          ) : (
            <div className="w-full">
              <InputGroup>
                <InputGroupInput placeholder="Search..." />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

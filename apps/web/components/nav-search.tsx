import { SearchIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@vanx/ui/components/sidebar";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@vanx/ui/components/input-group";
import { Collapsible } from "@vanx/ui/components/collapsible";

export function NavSearch() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className={isCollapsed ? "pb-0" : ""}>
      {isCollapsed ? (
        <SidebarMenu>
          <SidebarMenuButton asChild>
            <SearchIcon />
          </SidebarMenuButton>
        </SidebarMenu>
      ) : (
        <SidebarMenu>
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}

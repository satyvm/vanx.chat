import { SearchIcon } from "lucide-react";

import { Button } from "@vanx/ui/components/button";
import { ButtonGroup } from "@vanx/ui/components/button-group";
import { Input } from "@vanx/ui/components/input";
import { SidebarGroup } from "@vanx/ui/components/sidebar";

export function NavSearch() {
  return (
    <SidebarGroup>
      <ButtonGroup>
        <Input placeholder="Search..." />
        <Button variant="outline" aria-label="Search">
          <SearchIcon />
        </Button>
      </ButtonGroup>
    </SidebarGroup>
  );
}

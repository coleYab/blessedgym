import { Link } from '@inertiajs/react';
import {
  AreaChart,
  ChevronDown,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Landmark,
  Receipt,
  RefreshCcw,
  TrendingDown,
} from 'lucide-react';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

const revenueItems = [
  { title: 'Revenue Dashboard', href: '/billing/revenue', icon: AreaChart },
  { title: 'Expense Tracking', href: '/billing/revenue#expenses', icon: TrendingDown },
  { title: 'Financial Reports', href: '/billing/revenue#reports', icon: FileText },
];

export function NavRevenue() {
  const { isCurrentUrl } = useCurrentUrl();
  const [open, setOpen] = useState(
    revenueItems.some((item) => isCurrentUrl(item.href)),
  );

  return (
    <SidebarGroup className="px-2 py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2">
            <Landmark className="size-4" />
            <span className="flex-1 text-left text-xs font-medium">Revenue Management</span>
            <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Revenue Dashboard">
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isCurrentUrl('/billing/revenue')}
                    >
                      <Link href="/billing/revenue" prefetch>
                        <AreaChart className="size-4" />
                        <span>Revenue Dashboard</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

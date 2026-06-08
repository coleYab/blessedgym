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
import { useTranslation } from 'react-i18next';
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

export function NavRevenue() {
  const { t } = useTranslation();
  const { isCurrentUrl } = useCurrentUrl();
  const revenueItems = [
    { title: t('nav.revenue.dashboard'), href: '/billing/revenue', icon: AreaChart },
    { title: t('nav.revenue.expenses'), href: '/billing/revenue#expenses', icon: TrendingDown },
    { title: t('nav.revenue.reports'), href: '/billing/revenue#reports', icon: FileText },
  ];
  const [open, setOpen] = useState(
    revenueItems.some((item) => isCurrentUrl(item.href)),
  );

  return (
    <SidebarGroup className="px-2 py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2">
            <Landmark className="size-4" />
            <span className="flex-1 text-left text-xs font-medium">{t('nav.revenue.label')}</span>
            <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {revenueItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isCurrentUrl(item.href)}
                      >
                        <Link href={item.href} prefetch>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

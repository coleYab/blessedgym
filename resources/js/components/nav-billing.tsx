import { Link } from '@inertiajs/react';
import {
  AlertTriangle,
  ChevronDown,
  CreditCard,
  FileText,
  History,
  PauseCircle,
  Receipt,
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

const billingItems = [
  { title: 'Flexible Plan Creation', href: '/billing/plans', icon: Receipt },
  { title: 'Invoice Generation', href: '/billing/invoices', icon: FileText },
  { title: 'Payment Collection', href: '/billing/payments', icon: CreditCard },
  { title: 'Outstanding Balances', href: '/billing/balances', icon: AlertTriangle },
  { title: 'Freeze / Pause Membership', href: '/billing/freeze', icon: PauseCircle },
  { title: 'Payment History', href: '/billing/history', icon: History },
];

export function NavBilling() {
  const { isCurrentUrl } = useCurrentUrl();
  const [open, setOpen] = useState(
    billingItems.some((item) => isCurrentUrl(item.href)),
  );

  return (
    <SidebarGroup className="px-2 py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2">
            <CreditCard className="size-4" />
            <span className="flex-1 text-left text-xs font-medium">Billing & Pricing</span>
            <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {billingItems.map((item) => (
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

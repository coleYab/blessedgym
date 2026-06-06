import { Link } from '@inertiajs/react';
import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  Fingerprint,
  UserCheck,
  UserPlus,
  Users,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

const membershipItems = [
  { title: 'Member Registration', href: '/membership/register', icon: UserPlus },
  { title: 'Member Checkin', href: '/membership/checkin', icon: Fingerprint },
  { title: 'Attendance History', href: '/membership/attendance', icon: CalendarCheck },
  { title: 'Membership Status', href: '/membership/status', icon: Users },
  { title: 'Analytics', href: '/membership/analytics', icon: BarChart3 },
];

export function NavMembership() {
  const { isCurrentUrl } = useCurrentUrl();
  const [open, setOpen] = useState(
    membershipItems.some((item) => isCurrentUrl(item.href)),
  );

  return (
    <SidebarGroup className="px-2 py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2">
            <UserCheck className="size-4" />
            <span className="flex-1 text-left text-xs font-medium">Membership</span>
            <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {membershipItems.map((item) => (
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

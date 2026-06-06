import { Link } from '@inertiajs/react';
import {
  CalendarCheck,
  ChevronDown,
  Clock,
  Gauge,
  Users,
  UserSquare2,
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

const employeeItems = [
  { title: 'Staff Profiles & Roles', href: '/employee/staff', icon: UserSquare2 },
  { title: 'Attendance & Clock In/Out', href: '/employee/attendance', icon: Clock },
  { title: 'Performance Metrics', href: '/employee/performance', icon: Gauge },
  { title: 'Leave & Absence', href: '/employee/leave', icon: CalendarCheck },
];

export function NavEmployeeManagement() {
  const { isCurrentUrl } = useCurrentUrl();
  const [open, setOpen] = useState(
    employeeItems.some((item) => isCurrentUrl(item.href)),
  );

  return (
    <SidebarGroup className="px-2 py-0">
      <Collapsible open={open} onOpenChange={setOpen}>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2">
            <Users className="size-4" />
            <span className="flex-1 text-left text-xs font-medium">Employee Management</span>
            <ChevronDown className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {employeeItems.map((item) => (
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

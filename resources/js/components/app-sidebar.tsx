import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { NavBilling } from '@/components/nav-billing';
import { NavEmployeeManagement } from '@/components/nav-employee-management';
import { NavMembership } from '@/components/nav-membership';
import { NavRevenue } from '@/components/nav-revenue';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMembership />
                <NavBilling />
                <NavRevenue />
                <NavEmployeeManagement />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

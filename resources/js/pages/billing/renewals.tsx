import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function Renewals() {
  return (
    <>
      <Head title="Auto-Renewal & Expiry" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-none p-4">
        <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-none border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
      </div>
    </>
  );
}

Renewals.layout = {
  breadcrumbs: [
    { title: 'Billing & Pricing', href: '/billing/renewals' },
    { title: 'Auto-Renewal & Expiry', href: '/billing/renewals' },
  ],
};

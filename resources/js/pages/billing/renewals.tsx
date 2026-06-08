import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export default function Renewals() {
  const { t } = useTranslation();
  return (
    <>
      <Head title={t('billing.renewals.title')} />
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
    { title: i18n.t('billing.billing'), href: '/billing/renewals' },
    { title: i18n.t('billing.renewals.title'), href: '/billing/renewals' },
  ],
};

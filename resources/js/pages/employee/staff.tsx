import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Search, UserPlus, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Role = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
};

type StaffMember = {
  id: number;
  user: { id: number; name: string; email: string } | null;
  role: Role | null;
  employment_status: string;
  hired_date: string;
  specialties: string[] | null;
  base_hourly_rate: string | null;
  currency: string;
  profile_photo_url: string | null;
};

type PageProps = {
  staff: StaffMember[];
  roles: Role[];
  filters: { search?: string; role?: string };
};

export default function StaffProfiles() {
  const { t } = useTranslation();
  const { staff, roles, filters } = usePage<PageProps>().props;

  return (
    <>
      <Head title={t('employee.staff.title')} />

      <div className="flex flex-1 flex-col gap-6 p-4">
        <Heading
          title={t('employee.staff.title')}
          description={t('employee.staff.description')}
        />

        <div className="flex items-center gap-2">
          <Form
            action="/employee/staff"
            method="get"
            className="flex flex-1 items-end gap-3"
          >
            <div className="flex-1">
              <Label htmlFor="search">{t('employee.staff.search')}</Label>
              <div className="relative mt-2">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="search"
                  name="search"
                  defaultValue={filters.search ?? ''}
                  placeholder={t('employee.staff.search_placeholder')}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role">{t('employee.staff.role')}</Label>
              <select
                id="role"
                name="role"
                className="border-input mt-2 flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                defaultValue={filters.role ?? ''}
              >
                <option value="">{t('employee.staff.all_roles')}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit">{t('employee.staff.search_btn')}</Button>
            <Link href="/employee/staff">
              <Button type="button" variant="outline">{t('employee.staff.clear')}</Button>
            </Link>
          </Form>

          <PromoteToStaffDialog roles={roles} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('employee.staff.staff')}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({staff.length} {t(staff.length === 1 ? 'employee.staff.member' : 'employee.staff.members')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employee.staff.staff')}</TableHead>
                  <TableHead>{t('employee.staff.role')}</TableHead>
                  <TableHead>{t('employee.staff.status')}</TableHead>
                  <TableHead>{t('employee.staff.hired')}</TableHead>
                  <TableHead>{t('employee.staff.specialties')}</TableHead>
                  <TableHead>{t('employee.staff.rate')}</TableHead>
                  <TableHead className="text-right">{t('employee.staff.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-2 py-6">
                        <Users className="size-8 text-muted-foreground/50" />
                        <p>{t('employee.staff.no_staff')}</p>
                        <p className="text-xs">{t('employee.staff.add_first')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                          {member.profile_photo_url ? (
                            <img
                              src={member.profile_photo_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              {member.user
                                ? member.user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                                : '??'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.user?.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.role?.name ?? '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.employment_status === 'Active'
                            ? 'default'
                            : member.employment_status === 'Suspended'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {member.employment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(member.hired_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {member.specialties && member.specialties.length > 0
                          ? member.specialties.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {member.base_hourly_rate
                        ? `${member.currency} ${Number(member.base_hourly_rate).toFixed(2)}/hr`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <form
                        action={`/employee/staff/${member.id}`}
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm(t('employee.staff.confirm_remove'))) {
e.preventDefault();
}
                        }}
                      >
                        <input type="hidden" name="_method" value="delete" />
                        <Button type="submit" variant="ghost" size="sm">
                          {t('employee.staff.remove')}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PromoteToStaffDialog({ roles }: { roles: Role[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; name: string; email: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setSelectedUserId(null);
    setSelectedUserName('');

    if (debounceRef.current) {
clearTimeout(debounceRef.current);
}

    if (q.length < 2) {
 setSearchResults([]); setShowResults(false);

 return; 
}

    debounceRef.current = setTimeout(async () => {
      setSearching(true);

      try {
        const res = await fetch(`/employee/staff/search-users?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-1 size-4" />
          {t('employee.staff.promote')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Form
          action="/employee/staff"
          method="post"
          encType="multipart/form-data"
          resetOnSuccess
          className="space-y-4"
          onSuccess={() => setOpen(false)}
        >
          {({ processing, errors, setData }) => (
            <>
              <DialogHeader>
                <DialogTitle>{t('employee.staff.promote_title')}</DialogTitle>
                <DialogDescription>
                  {t('employee.staff.promote_desc')}
                </DialogDescription>
              </DialogHeader>

              <input type="hidden" name="user_id" value={selectedUserId ?? ''} />

              <div className="grid gap-2" ref={searchRef}>
                <Label htmlFor="user_search">{t('employee.staff.search_user')}</Label>
                <div className="relative">
                  <Input
                    id="user_search"
                    placeholder={t('employee.staff.search_user_placeholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  )}
                </div>
                {showResults && searchResults.length > 0 && (
                  <div className="bg-popover text-popover-foreground z-50 mt-1 max-h-48 overflow-auto rounded-none border shadow-md">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setSelectedUserName(u.name);
                          setSearchQuery(u.name);
                          setShowResults(false);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <div className="bg-muted flex size-7 items-center justify-center rounded-full text-xs font-medium">
                          {u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showResults && searchResults.length === 0 && searchQuery.length >= 2 && (
                  <p className="text-xs text-muted-foreground">{t('employee.staff.no_users_found')}</p>
                )}
                {selectedUserId && (
                  <p className="text-xs font-medium text-emerald-600">
                    {t('employee.staff.selected')}: {selectedUserName}
                  </p>
                )}
                <InputError message={errors.user_id} />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role_id">{t('employee.staff.role')}</Label>
                  <select
                    id="role_id"
                    name="role_id"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    required
                  >
                    <option value="">{t('employee.staff.select_role')}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <InputError message={errors.role_id} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="employment_status">{t('employee.staff.status')}</Label>
                  <select
                    id="employment_status"
                    name="employment_status"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    required
                  >
                    <option value="Active">{t('employee.staff.active')}</option>
                    <option value="Suspended">{t('employee.staff.suspended')}</option>
                    <option value="Terminated">{t('employee.staff.terminated')}</option>
                  </select>
                  <InputError message={errors.employment_status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hired_date">{t('employee.staff.hired')}</Label>
                  <Input id="hired_date" name="hired_date" type="date" required />
                  <InputError message={errors.hired_date} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="currency">{t('employee.staff.currency')}</Label>
                  <select
                    id="currency"
                    name="currency"
                    className="border-input flex h-9 w-full min-w-0 rounded-none border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <InputError message={errors.currency} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="base_hourly_rate">{t('employee.staff.base_rate')}</Label>
                  <Input id="base_hourly_rate" name="base_hourly_rate" type="number" step="0.01" min="0" />
                  <InputError message={errors.base_hourly_rate} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile_photo">{t('employee.staff.profile_photo')}</Label>
                  <Input id="profile_photo" name="profile_photo" type="file" accept="image/*" />
                  <InputError message={errors.profile_photo} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="specialties">{t('employee.staff.specialties_label')}</Label>
                <textarea
                  id="specialties"
                  name="specialties"
                  rows={2}
                  placeholder={t('employee.staff.specialties_placeholder')}
                  className="border-input flex w-full min-w-0 rounded-none border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                  onChange={(e) => {
                    const lines = e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setData('specialties', lines);
                  }}
                />
                <InputError message={errors.specialties} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t('employee.staff.cancel')}
                </Button>
                <Button disabled={processing || !selectedUserId}>
                  {processing ? t('employee.staff.creating') : t('employee.staff.create_profile')}
                </Button>
              </div>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}

StaffProfiles.layout = {
  breadcrumbs: [
    { title: i18n.t('employee.staff.breadcrumb_management'), href: '/employee/staff' },
    { title: i18n.t('employee.staff.title'), href: '/employee/staff' },
  ],
};

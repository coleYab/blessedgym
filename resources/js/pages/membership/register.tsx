import { Form, Head } from '@inertiajs/react';
import MemberController from '@/actions/App/Http/Controllers/MemberController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function MemberRegistration() {
    return (
        <>
            <Head title="Member Registration" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Member Registration"
                    description="Fill in the details below to register a new member."
                />

                <Form
                    {...MemberController.store.form()}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <Card>
                                <CardContent className="space-y-6 pt-6">
                                    <div>
                                        <h3 className="mb-4 text-sm font-medium">
                                            Personal Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="first_name">
                                                    First Name
                                                </Label>
                                                <Input
                                                    id="first_name"
                                                    name="first_name"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.first_name}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="last_name">
                                                    Last Name
                                                </Label>
                                                <Input
                                                    id="last_name"
                                                    name="last_name"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.last_name}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="mb-4 text-sm font-medium">
                                            Contact Information
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="phone_number">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone_number"
                                                    type="tel"
                                                    name="phone_number"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors.phone_number
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="mb-4 text-sm font-medium">
                                            Account Details
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="date_of_birth">
                                                    Date of Birth
                                                </Label>
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    name="date_of_birth"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors.date_of_birth
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="registration_source">
                                                    Registration Source
                                                </Label>
                                                <select
                                                    id="registration_source"
                                                    name="registration_source"
                                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                                    required
                                                >
                                                    <option value="">
                                                        Select source...
                                                    </option>
                                                    <option value="mobile_app">
                                                        Mobile App
                                                    </option>
                                                    <option value="admin_dashboard">
                                                        Admin Dashboard
                                                    </option>
                                                    <option value="kiosk">
                                                        Kiosk
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.registration_source
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="mb-4 text-sm font-medium">
                                            Media &amp; Identification
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="profile_photo">
                                                    Profile Photo
                                                </Label>
                                                <Input
                                                    id="profile_photo"
                                                    type="file"
                                                    name="profile_photo"
                                                    accept="image/*"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Optional. Max 2MB.
                                                </p>
                                                <InputError
                                                    message={
                                                        errors.profile_photo
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="id_document_type">
                                                    ID Document Type
                                                </Label>
                                                <select
                                                    id="id_document_type"
                                                    name="id_document_type"
                                                    className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                                                >
                                                    <option value="">
                                                        Select document
                                                        type...
                                                    </option>
                                                    <option value="National_ID">
                                                        National ID
                                                    </option>
                                                    <option value="Passport">
                                                        Passport
                                                    </option>
                                                    <option value="Drivers_License">
                                                        Driver&apos;s License
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={
                                                        errors.id_document_type
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2">
                                            <Label htmlFor="id_document">
                                                ID Document Image
                                            </Label>
                                            <Input
                                                id="id_document"
                                                type="file"
                                                name="id_document"
                                                accept="image/*"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Optional. Max 5MB.
                                            </p>
                                            <InputError
                                                message={errors.id_document}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="hidden"
                                            name="is_verified"
                                            value="0"
                                        />
                                        <input
                                            id="is_verified"
                                            type="checkbox"
                                            name="is_verified"
                                            value="1"
                                            className="border-input size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        />
                                        <Label
                                            htmlFor="is_verified"
                                            className="!leading-none"
                                        >
                                            Mark member as verified
                                        </Label>
                                        <InputError
                                            message={errors.is_verified}
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button disabled={processing}>
                                            {processing
                                                ? 'Registering...'
                                                : 'Register Member'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

MemberRegistration.layout = {
    breadcrumbs: [
        {
            title: 'Member Registration',
            href: '/membership/register',
        },
    ],
};

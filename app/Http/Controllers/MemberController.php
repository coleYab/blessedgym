<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberRequest;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('membership/register');
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $data = $request->validated();

        unset($data['profile_photo'], $data['id_document']);

        if ($request->hasFile('profile_photo')) {
            $data['profile_photo_path'] = $request->file('profile_photo')->store('member-photos', 'public');
        }

        if ($request->hasFile('id_document')) {
            $data['id_document_path'] = $request->file('id_document')->store('member-documents', 'public');
        }

        $data['registered_by'] = $request->user()->id;
        $data['registered_at'] = now();

        Member::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Member registered successfully.']);

        return to_route('membership.register');
    }
}

import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

const tiers = [
    {
        name: 'Basic',
        price: '2,500',
        period: '/ month',
        highlight: false,
        features: [
            'Access to gym floor & cardio deck',
            'Locker room & shower access',
            'Open workspace lounge access',
            '1 Free coaching session',
        ],
        cta: 'Get Started',
    },
    {
        name: 'The Athlete',
        price: '4,500',
        period: '/ month',
        highlight: true,
        features: [
            '24/7 Gym & workspace access',
            'Unlimited 1-on-1 coaching',
            'Sauna & recovery zone',
            '1 Monthly body composition scan',
            'Dedicated desk booking',
        ],
        cta: 'Join The Team',
    },
    {
        name: 'VIP Elite',
        price: '8,000',
        period: '/ month',
        highlight: false,
        features: [
            'Everything in Athlete',
            'Weekly 1-on-1 coaching',
            'Custom nutrition & program design',
            'Private office space',
            'Complimentary juice bar daily',
            'Priority class booking',
        ],
        cta: 'Go Elite',
    },
];

const faqs = [
    {
        q: 'Can I cancel my membership at any time?',
        a: 'Yes, we offer contract-free month-to-month options.',
    },
    {
        q: 'Is there parking available?',
        a: 'Yes, we have a massive, free dedicated parking lot for members.',
    },
    {
        q: 'Do you have beginner-friendly programs?',
        a: 'Absolutely. Every new member gets a complimentary orientation and baseline assessment.',
    },
    {
        q: 'Can I use the workspace without a gym session?',
        a: 'Yes. Our Athlete and VIP Elite plans include full coworking access — gym is optional.',
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-border bg-card transition-shadow hover:shadow-[4px_4px_0px_0px_hsl(0_0%_0%)]">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-card-foreground"
            >
                <span className="font-semibold">{q}</span>
                <span className={`text-xl transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">{a}</div>}
        </div>
    );
}

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const counted = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !counted.current) {
                    counted.current = true;
                    const duration = 1500;
                    const steps = 30;
                    const increment = end / steps;
                    let current = 0;
                    const timer = setInterval(() => {
                        current += increment;

                        if (current >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(current));
                        }
                    }, duration / steps);
                }
            },
            { threshold: 0.3 },
        );

        if (ref.current) {
observer.observe(ref.current);
}

        return () => observer.disconnect();
    }, [end]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
}

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Blessed Gym" />

            <div
                className="flex min-h-screen flex-col bg-background text-foreground"
                style={
                    {
                        '--background': 'oklch(1 0 0)',
                        '--foreground': 'oklch(0 0 0)',
                        '--card': 'oklch(1 0 0)',
                        '--card-foreground': 'oklch(0 0 0)',
                        '--muted': 'oklch(0.9551 0 0)',
                        '--muted-foreground': 'oklch(0.3211 0 0)',
                        '--border': 'oklch(0 0 0)',
                        '--primary': 'oklch(0.6489 0.2370 26.9728)',
                        '--primary-foreground': 'oklch(1 0 0)',
                        '--secondary': 'oklch(0.968 0.211 109.769)',
                        '--secondary-foreground': 'oklch(0 0 0)',
                        '--accent': 'oklch(0.5635 0.2408 260.818)',
                        '--accent-foreground': 'oklch(1 0 0)',
                    } as React.CSSProperties
                }
            >
                {/* ── Navigation ── */}
                <header className="fixed top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                        <span className="text-lg font-black uppercase tracking-tight text-foreground">
                            Blessed Gym
                        </span>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-none border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-none border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-none border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ── 1. Hero Section ── */}
                <section className="relative mt-14 flex min-h-[90vh] items-center overflow-hidden border-b border-border">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                    <div className="relative mx-auto max-w-7xl px-6 py-20">
                        <div className="max-w-3xl">
                            <h1 className="text-balance text-5xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                                No Excuses.
                                <br />
                                Just Results.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
                                Premium equipment, expert coaching, and a community built to push you
                                forward. Claim your free 3-day pass today.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href={register()}
                                    className="group relative inline-block rounded-none border-2 border-[#39FF14] bg-[#39FF14] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#1a1a2e] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a2e]"
                                >
                                    <span className="relative z-10">Claim Your Free Pass</span>
                                </Link>
                                <a
                                    href="#offerings"
                                    className="inline-block rounded-none border-2 border-white/40 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-white"
                                >
                                    Explore More
                                </a>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
                                <span className="text-yellow-400">⭐ 4.9/5 stars</span>
                                <span className="text-white/40">|</span>
                                <span>from over 500+ local members</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 2. Social Proof / Trust Bar ── */}
                <section className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>15,000 sq. ft. Facility</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>24/7 Workspace Access</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>1-on-1 Expert Coaching</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>NASM Certified</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>Premium Coworking</span>
                    </div>
                </section>

                {/* ── 3. Core Offerings ── */}
                <section id="offerings" className="border-b border-border px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            What We Offer
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            A space built for your body and your work. Train, focus, recover — all
                            under one roof.
                        </p>
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    title: 'Elite Equipment',
                                    desc: 'Top-tier strength, cardio, and functional training gear. No waiting in lines.',
                                    icon: '🏋️',
                                },
                                {
                                    title: 'Expert Coaching',
                                    desc: 'Certified personal trainers dedicated to tracking your form and progress.',
                                    icon: '🎯',
                                },
                                {
                                    title: 'Workspace & Lounge',
                                    desc: 'High-speed WiFi, quiet desks, meeting rooms, and a lounge to recharge.',
                                    icon: '💻',
                                },
                                {
                                    title: 'Premium Amenities',
                                    desc: 'Locker rooms, saunas, cold plunge, and a fully stocked juice bar.',
                                    icon: '♨️',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="group flex flex-col border border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]"
                                >
                                    <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                                        {item.icon}
                                    </span>
                                    <h3 className="mt-4 text-lg font-bold text-card-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 4. Inside the Facility ── */}
                <section className="border-b border-border px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Inside the Facility
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            See where you will be sweating, working, and recovering.
                        </p>
                        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                { label: 'Heavy Lifting Zone', cols: 'col-span-2 row-span-2' },
                                { label: 'Cardio & Turf' },
                                { label: 'Coworking Lounge' },
                                { label: 'Sauna & Recovery' },
                            ].map((img, i) => (
                                <div
                                    key={i}
                                    className={`${img.cols || ''} group relative flex aspect-[4/3] items-end overflow-hidden border border-border bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] p-4 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]`}
                                >
                                    <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/5" />
                                    <span className="relative text-xs font-bold uppercase tracking-wider text-white/80">
                                        {img.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 5. Membership Pricing ── */}
                <section className="border-b border-border px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Choose Your Plan
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            Clear, transparent pricing. No hidden fees. All prices in ETB.
                        </p>
                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.name}
                                    className={`relative flex flex-col border border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)] ${
                                        tier.highlight
                                            ? 'border-2 border-primary shadow-[6px_6px_0px_0px_var(--primary)] hover:shadow-[8px_8px_0px_0px_var(--primary)]'
                                            : ''
                                    }`}
                                >
                                    {tier.highlight && (
                                        <span className="absolute -top-3 left-4 rounded-none bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                                            Most Popular
                                        </span>
                                    )}
                                    <h3 className="text-lg font-bold text-card-foreground">
                                        {tier.name}
                                    </h3>
                                    <div className="mt-3 flex items-baseline gap-1">
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            ETB
                                        </span>
                                        <span className="text-4xl font-black text-card-foreground">
                                            {tier.price}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {tier.period}
                                        </span>
                                    </div>
                                    <ul className="mt-6 flex flex-col gap-3">
                                        {tier.features.map((f) => (
                                            <li
                                                key={f}
                                                className="flex items-start gap-2 text-sm text-muted-foreground"
                                            >
                                                <span className="mt-0.5 text-primary">✓</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={register()}
                                        className={`mt-8 block w-full rounded-none border-2 px-5 py-3 text-center text-sm font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 ${
                                            tier.highlight
                                                ? 'border-primary bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--primary)] hover:shadow-[6px_6px_0px_0px_var(--primary)]'
                                                : 'border-border bg-card text-card-foreground shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]'
                                        }`}
                                    >
                                        {tier.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 6. Success Stories ── */}
                <section className="border-b border-border px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Real Results
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            Transformation stories from our Ethiopian community.
                        </p>
                        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="flex flex-col border border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center border border-border bg-primary text-sm font-bold uppercase text-primary-foreground">
                                        BT
                                    </div>
                                    <div>
                                        <p className="font-bold text-card-foreground">Bethlehem T.</p>
                                        <p className="text-xs text-muted-foreground">
                                            Member since 2024 · Addis Ababa
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-card-foreground italic">
                                    &ldquo;I used to think I had to choose between my fitness and my
                                    work. Here I get both. The workspace keeps me productive, and
                                    the coaches keep me accountable.&rdquo;
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">↓ 12 kg</span>
                                    <span className="text-muted-foreground">lost in 4 months</span>
                                </div>
                            </div>
                            <div className="flex flex-col border border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center border border-border bg-secondary text-sm font-bold uppercase text-secondary-foreground">
                                        DH
                                    </div>
                                    <div>
                                        <p className="font-bold text-card-foreground">Dawit H.</p>
                                        <p className="text-xs text-muted-foreground">
                                            Member since 2023 · Bole
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-card-foreground italic">
                                    &ldquo;The 1-on-1 coaching completely changed my form. I went
                                    from chronic back pain to deadlifting my bodyweight in 6
                                    months. Unreal community.&rdquo;
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">+25 kg</span>
                                    <span className="text-muted-foreground">
                                        on squat in 3 months
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col border border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_hsl(0_0%_0%)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center border border-border bg-primary text-sm font-bold uppercase text-primary-foreground">
                                        MA
                                    </div>
                                    <div>
                                        <p className="font-bold text-card-foreground">Mekedes A.</p>
                                        <p className="text-xs text-muted-foreground">
                                            Member since 2024 · CMC
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-card-foreground italic">
                                    &ldquo;The VIP Elite plan is worth every birr. Weekly coaching
                                    + the private office space means I get my work done and still
                                    hit my fitness goals. No excuses.&rdquo;
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">↓ 18 kg</span>
                                    <span className="text-muted-foreground">
                                        lost · 3 dress sizes down
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 border border-border bg-card px-8 py-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)]">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={500} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">Active Members</span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={50} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Weekly Sessions
                                </span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={4.9} />
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Star Rating
                                </span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={15} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">Years Running</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 7. FAQ + Final CTA ── */}
                <section className="px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <div>
                                <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                                    FAQs
                                </h2>
                                <p className="mt-3 max-w-xl text-muted-foreground">
                                    Everything you need to know before stepping in.
                                </p>
                                <div className="mt-8 flex flex-col gap-3">
                                    {faqs.map((faq) => (
                                        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center border border-border bg-card p-8 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)]">
                                <h3 className="text-balance text-2xl font-black uppercase tracking-tight text-card-foreground sm:text-3xl">
                                    Ready to write your success story?
                                </h3>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    No commitment. Just show up and see what&apos;s possible.
                                </p>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="min-w-0 flex-1 rounded-none border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                    />
                                    <Link
                                        href={register()}
                                        className="inline-block shrink-0 rounded-none border-2 border-primary bg-primary px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0px_0px_var(--primary)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--primary)]"
                                    >
                                        Get Started Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-border px-6 py-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
                        <span className="font-black uppercase tracking-tight text-foreground">
                            Blessed Gym
                        </span>
                        <p>&copy; {new Date().getFullYear()} Blessed Gym. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

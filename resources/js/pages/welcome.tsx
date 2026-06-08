import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

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
    const { t } = useTranslation();

    const tiers = [
        {
            name: t('welcome.pricing.basic'),
            price: '2,500',
            period: '/ month',
            highlight: false,
            features: [
                t('welcome.pricing.features.basic_1'),
                t('welcome.pricing.features.basic_2'),
                t('welcome.pricing.features.basic_3'),
                t('welcome.pricing.features.basic_4'),
            ],
            cta: t('welcome.pricing.get_started'),
        },
        {
            name: t('welcome.pricing.athlete'),
            price: '4,500',
            period: '/ month',
            highlight: true,
            features: [
                t('welcome.pricing.features.athlete_1'),
                t('welcome.pricing.features.athlete_2'),
                t('welcome.pricing.features.athlete_3'),
                t('welcome.pricing.features.athlete_4'),
                t('welcome.pricing.features.athlete_5'),
            ],
            cta: t('welcome.pricing.join_team'),
        },
        {
            name: t('welcome.pricing.vip'),
            price: '8,000',
            period: '/ month',
            highlight: false,
            features: [
                t('welcome.pricing.features.vip_1'),
                t('welcome.pricing.features.vip_2'),
                t('welcome.pricing.features.vip_3'),
                t('welcome.pricing.features.vip_4'),
                t('welcome.pricing.features.vip_5'),
                t('welcome.pricing.features.vip_6'),
            ],
            cta: t('welcome.pricing.go_elite'),
        },
    ];

    const faqs = [
        {
            q: t('welcome.faq.q1'),
            a: t('welcome.faq.a1'),
        },
        {
            q: t('welcome.faq.q2'),
            a: t('welcome.faq.a2'),
        },
        {
            q: t('welcome.faq.q3'),
            a: t('welcome.faq.a3'),
        },
        {
            q: t('welcome.faq.q4'),
            a: t('welcome.faq.a4'),
        },
    ];

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
                                    {t('welcome.nav.dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-none border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035]"
                                    >
                                        {t('welcome.nav.login')}
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-none border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                                    >
                                        {t('welcome.nav.register')}
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
                                {t('welcome.hero.title1')}
                                <br />
                                {t('welcome.hero.title2')}
                            </h1>
                            <p className="mt-6 max-w-xl text-lg text-white/80 sm:text-xl">
                                {t('welcome.hero.subtitle')}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href={register()}
                                    className="group relative inline-block rounded-none border-2 border-[#39FF14] bg-[#39FF14] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_#1a1a2e] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a2e]"
                                >
                                    <span className="relative z-10">{t('welcome.hero.cta')}</span>
                                </Link>
                                <a
                                    href="#offerings"
                                    className="inline-block rounded-none border-2 border-white/40 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-white"
                                >
                                    {t('welcome.hero.explore')}
                                </a>
                            </div>
                            <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
                                <span className="text-yellow-400">{t('welcome.hero.rating')}</span>
                                <span className="text-white/40">|</span>
                                <span>{t('welcome.hero.from')}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 2. Social Proof / Trust Bar ── */}
                <section className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{t('welcome.trust.facility')}</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>{t('welcome.trust.access')}</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>{t('welcome.trust.coaching')}</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>{t('welcome.trust.certified')}</span>
                        <span className="hidden text-muted-foreground/30 sm:inline">|</span>
                        <span>{t('welcome.trust.coworking')}</span>
                    </div>
                </section>

                {/* ── 3. Core Offerings ── */}
                <section id="offerings" className="border-b border-border px-6 py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-balance text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            {t('welcome.offerings.title')}
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            {t('welcome.offerings.subtitle')}
                        </p>
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    title: t('welcome.offerings.elite_equipment'),
                                    desc: t('welcome.offerings.elite_equipment_desc'),
                                    icon: '🏋️',
                                },
                                {
                                    title: t('welcome.offerings.expert_coaching'),
                                    desc: t('welcome.offerings.expert_coaching_desc'),
                                    icon: '🎯',
                                },
                                {
                                    title: t('welcome.offerings.workspace'),
                                    desc: t('welcome.offerings.workspace_desc'),
                                    icon: '💻',
                                },
                                {
                                    title: t('welcome.offerings.amenities'),
                                    desc: t('welcome.offerings.amenities_desc'),
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
                            {t('welcome.facility.title')}
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            {t('welcome.facility.subtitle')}
                        </p>
                        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                { label: t('welcome.facility.heavy_lifting'), cols: 'col-span-2 row-span-2' },
                                { label: t('welcome.facility.cardio') },
                                { label: t('welcome.facility.coworking') },
                                { label: t('welcome.facility.sauna') },
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
                            {t('welcome.pricing.title')}
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            {t('welcome.pricing.subtitle')}
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
                                            {t('welcome.pricing.most_popular')}
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
                            {t('welcome.results.title')}
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            {t('welcome.results.subtitle')}
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
                                    {t('welcome.results.testimonial_1')}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">↓ 12 kg</span>
                                    <span className="text-muted-foreground">{t('welcome.results.lost')}</span>
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
                                    {t('welcome.results.testimonial_2')}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">+25 kg</span>
                                    <span className="text-muted-foreground">
                                        {t('welcome.results.squat')}
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
                                    {t('welcome.results.testimonial_3')}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    <span className="font-bold text-secondary">↓ 18 kg</span>
                                    <span className="text-muted-foreground">
                                        {t('welcome.results.dress_sizes')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 border border-border bg-card px-8 py-6 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)]">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={500} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">{t('welcome.results.active_members')}</span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={50} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t('welcome.results.weekly_sessions')}
                                </span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={4.9} />
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t('welcome.results.star_rating')}
                                </span>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="text-center">
                                <span className="block text-3xl font-black text-card-foreground">
                                    <CountUp end={15} suffix="+" />
                                </span>
                                <span className="text-xs text-muted-foreground">{t('welcome.results.years_running')}</span>
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
                                    {t('welcome.faq.title')}
                                </h2>
                                <p className="mt-3 max-w-xl text-muted-foreground">
                                    {t('welcome.faq.subtitle')}
                                </p>
                                <div className="mt-8 flex flex-col gap-3">
                                    {faqs.map((faq) => (
                                        <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-center border border-border bg-card p-8 shadow-[4px_4px_0px_0px_hsl(0_0%_0%)]">
                                <h3 className="text-balance text-2xl font-black uppercase tracking-tight text-card-foreground sm:text-3xl">
                                    {t('welcome.cta.title')}
                                </h3>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    {t('welcome.cta.subtitle')}
                                </p>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        type="email"
                                        placeholder={t('welcome.cta.placeholder')}
                                        className="min-w-0 flex-1 rounded-none border-2 border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                    />
                                    <Link
                                        href={register()}
                                        className="inline-block shrink-0 rounded-none border-2 border-primary bg-primary px-6 py-3 text-center text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[4px_4px_0px_0px_var(--primary)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--primary)]"
                                    >
                                        {t('welcome.cta.button')}
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
                        <p>&copy; {new Date().getFullYear()} Blessed Gym. {t('welcome.footer.copyright')}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

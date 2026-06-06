<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- SEO Metadata --}}
        <meta name="description" content="{{ config('seo.description') }}">
        <meta name="keywords" content="{{ config('seo.keywords') }}">
        <meta name="robots" content="{{ config('seo.robots') }}">
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Open Graph --}}
        <meta property="og:title" content="{{ config('seo.title') }}">
        <meta property="og:description" content="{{ config('seo.description') }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:site_name" content="{{ config('seo.site_name') }}">
        <meta property="og:type" content="{{ config('seo.og_type') }}">
        <meta property="og:image" content="{{ asset(config('seo.og_image')) }}">

        {{-- Twitter Card --}}
        <meta name="twitter:card" content="{{ config('seo.twitter_card') }}">
        <meta name="twitter:site" content="{{ config('seo.twitter_site') }}">
        <meta name="twitter:title" content="{{ config('seo.title') }}">
        <meta name="twitter:description" content="{{ config('seo.description') }}">
        <meta name="twitter:image" content="{{ asset(config('seo.og_image')) }}">

        {{-- JSON-LD Structured Data --}}
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@type": "HealthClub",
            "name": "{{ config('seo.site_name') }}",
            "description": "{{ config('seo.description') }}",
            "url": "{{ url('/') }}",
            "image": "{{ asset(config('seo.og_image')) }}",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "{{ url('/') }}/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
        </script>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Blessed Gym') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>

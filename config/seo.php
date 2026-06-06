<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Search Engine Metadata
    |--------------------------------------------------------------------------
    |
    | These values control the SEO meta tags rendered in the app layout.
    | Override any value via environment variables or .env.
    |
    */

    'title' => env('SEO_TITLE', config('app.name', 'Blessed Gym')),
    'description' => env('SEO_DESCRIPTION', 'Blessed Gym – Premium fitness center with state-of-the-art equipment, expert trainers, and a supportive community. Join us today!'),
    'keywords' => env('SEO_KEYWORDS', 'gym, fitness, health, workout, personal training, membership, premium gym'),
    'site_name' => env('SEO_SITE_NAME', config('app.name', 'Blessed Gym')),

    /*
    |--------------------------------------------------------------------------
    | Open Graph / Twitter
    |--------------------------------------------------------------------------
    */
    'og_image' => env('SEO_OG_IMAGE', '/og-image.png'),
    'og_type' => env('SEO_OG_TYPE', 'website'),
    'twitter_card' => env('SEO_TWITTER_CARD', 'summary_large_image'),
    'twitter_site' => env('SEO_TWITTER_SITE', '@blessedgym'),

    /*
    |--------------------------------------------------------------------------
    | Robots
    |--------------------------------------------------------------------------
    */
    'robots' => env('SEO_ROBOTS', 'index, follow'),
];

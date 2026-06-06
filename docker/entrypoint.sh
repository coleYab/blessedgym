#!/bin/sh
set -e

if [ ! -f /app/.env ]; then
    cp /app/.env.example /app/.env
    php /app/artisan key:generate --force
fi

php /app/artisan migrate --force --graceful

exec /usr/bin/supervisord -c /etc/supervisord.conf

FROM php:8.4-cli-alpine AS base

RUN apk add --no-cache \
    curl \
    git \
    oniguruma-dev \
    libzip-dev \
    unzip \
    zlib-dev \
    && docker-php-ext-install \
    bcmath \
    ctype \
    fileinfo \
    mbstring \
    pdo \
    pdo_sqlite \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

FROM base AS vendor

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader \
    && composer clear-cache

FROM node:22-alpine AS frontend

RUN apk add --no-cache git
WORKDIR /app

COPY package.json package-lock.json pnpm-lock.yaml ./
RUN npm ci

COPY vite.config.ts tsconfig.json ./
COPY resources/ resources/
COPY public/ public/

RUN npm run build

FROM base AS final

RUN apk add --no-cache \
    nginx \
    supervisor \
    && addgroup -g 1000 -S app \
    && adduser -u 1000 -S app -G app

COPY --from=vendor /app/vendor /app/vendor
COPY --from=frontend /app/public/build /app/public/build

COPY --chown=app:app . /app

RUN mkdir -p /app/storage/framework/cache/data \
    /app/storage/framework/sessions \
    /app/storage/framework/views \
    /app/storage/logs \
    /app/database \
    && chmod -R 775 /app/storage /app/bootstrap/cache

COPY docker/php.ini $PHP_INI_DIR/conf.d/laravel.ini
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

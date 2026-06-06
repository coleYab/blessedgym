# Blessed Gym — Premium Fitness Management System

A comprehensive, full-featured fitness management platform built with Laravel 13, Inertia.js 3, and React 19. Blessed Gym streamlines membership administration, check-in operations, billing and invoicing, employee management, and revenue analytics for modern fitness facilities.

---

## Features

### Membership Management
- Member registration and profile management
- Membership plan configuration (CRUD operations)
- Membership lifecycle management (activation, freeze, cancellation, modification)
- Renewal tracking

### Check-in System
- Member check-in and check-out with method tracking
- Real-time attendance logs and history

### Billing & Finance
- Invoice generation, finalization, and PDF export via DomPDF
- Payment recording, refund processing, and full transaction history
- Outstanding balance tracking with a dedicated debt ledger
- Membership freeze management with billing awareness
- Revenue dashboard with expense tracking
- PDF and CSV export capabilities

### Employee Management
- Staff profiles linked to user accounts
- Attendance tracking with clock-in/clock-out
- Leave request submission, approval, and denial workflows
- Performance metrics tracking

### Analytics & Dashboards
- Real-time dashboard displaying active members, daily check-ins, monthly revenue, outstanding balances, staff status, pending leave requests, expiring memberships, and new member trends
- Searchable membership analytics

### Authentication & Security
- Laravel Fortify-powered authentication (registration, login, password reset, email verification)
- Two-factor authentication (TOTP) with recovery codes
- Passkey (WebAuthn) support for passwordless authentication
- Sanctum API token authentication
- Rate limiting on login, two-factor, and passkey endpoints

### User Settings
- Profile management
- Appearance and theme configuration
- Security settings (password, 2FA, passkeys)
- Account deletion

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | PHP 8.4, Laravel 13 |
| **Frontend** | React 19, TypeScript 5.7, Inertia.js 3 |
| **Styling** | Tailwind CSS 4, Radix UI primitives, Lucide icons |
| **Forms** | React Hook Form, Zod |
| **Charts** | Recharts |
| **Tables** | TanStack React Table |
| **PDF** | barryvdh/laravel-dompdf |
| **Database** | SQLite (configurable via Laravel) |
| **Build** | Vite 8 |
| **Testing** | Pest PHP 4 |
| **Code Quality** | Laravel Pint, ESLint 9, Prettier 3 |
| **Auth** | Laravel Fortify, Laravel Sanctum, WebAuthn |

---

## Requirements

- PHP ^8.3
- Composer
- Node.js & npm
- SQLite (or any Laravel-supported database)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blessed-gym.git
cd blessed-gym

# Install PHP dependencies
composer install

# Copy environment configuration
copy .env.example .env

# Generate application key
php artisan key:generate

# Install Node.js dependencies
npm install

# Build frontend assets
npm run build

# Run database migrations
php artisan migrate

# (Optional) Seed the database with sample data
php artisan db:seed
```

---

## Development

Start the development servers concurrently:

```bash
composer run dev
```

This command launches the Laravel development server, queue worker, real-time logger (Pail), and Vite development server in parallel.

### Individual Commands

| Command | Description |
|---|---|
| `php artisan serve` | Start the Laravel development server |
| `npm run dev` | Start the Vite development server with hot module replacement |
| `php artisan queue:listen` | Process queued jobs |
| `php artisan pail` | Watch application logs in real time |

---

## Code Quality & CI

### Linting & Formatting

```bash
# PHP (Laravel Pint)
composer run lint

# Frontend (ESLint)
npm run lint

# Frontend (Prettier)
npm run format

# TypeScript type checking
npm run types:check
```

### Testing

```bash
# Run the full test suite (includes linting checks)
composer run test

# Run tests only
php artisan test

# Run tests with compact output
php artisan test --compact

# Run a specific test file
php artisan test --compact --filter=TestName
```

### CI Pipeline

The repository includes GitHub Actions workflows that run linting, formatting checks, TypeScript compilation, and the full test suite on each push.

---

## Deployment

This application is designed for deployment on [Laravel Cloud](https://cloud.laravel.com/) or any standard Laravel hosting environment. Ensure the following steps are completed for production:

1. Set `APP_ENV=production` and `APP_DEBUG=false` in your `.env` file
2. Configure a production-ready database driver (MySQL, PostgreSQL, etc.)
3. Run `php artisan optimize` for route, config, and event caching
4. Build frontend assets with `npm run build`
5. Configure your web server to point to the `public/` directory

---

## Project Structure

```
├── app/                    # Backend PHP code
│   ├── Actions/            # Fortify authentication actions
│   ├── Concerns/           # Shared traits
│   ├── Http/               # Controllers, middleware, requests, responses
│   ├── Models/             # Eloquent models
│   ├── Providers/          # Service providers
│   └── Services/           # Service layer
├── config/                 # Application configuration
├── database/               # Migrations, factories, seeders
├── resources/
│   ├── js/                 # Frontend React/TypeScript code
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Inertia page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── css/                # Tailwind CSS entry point
│   └── views/              # Blade templates (app shell, PDFs)
├── routes/                 # Web, API, settings, and console routes
├── tests/                  # Pest PHP test suite
└── public/                 # Public entry point
```

---

## License

Blessed Gym is open-source software licensed under the [MIT license](LICENSE).

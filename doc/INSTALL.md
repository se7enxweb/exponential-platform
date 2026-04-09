# Exponential Platform 3.2 — Installation Guide

This guide covers a full installation of **Exponential Platform 3.2 OSS** (`se7enxweb/exponential-platform ~3.2.9`).

The stack is a **single-kernel** Symfony 5.1 / 5.4 application — there is no LegacyBridge, no `ezpublish_legacy/` tree, and no dual-kernel routing. All administration is handled through the built-in React-based Admin UI at `/admin/`.

---

## Table of Contents

1. [Requirements](#1-requirements)
2. [First-Time Installation](#2-first-time-installation)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Setup](#4-database-setup)
5. [Web Server Setup](#5-web-server-setup)
6. [File and Directory Permissions](#6-file-and-directory-permissions)
7. [Frontend Asset Build](#7-frontend-asset-build)
8. [Admin UI Asset Compile](#8-admin-ui-asset-compile)
9. [JWT Authentication Keypair](#9-jwt-authentication-keypair)
10. [Search Index](#10-search-index)
11. [Cache Management](#11-cache-management)
12. [Day-to-Day Operations](#12-day-to-day-operations)
13. [Updating the Codebase](#13-updating-the-codebase)
14. [Cron Jobs](#14-cron-jobs)
15. [Solr Search (Optional)](#15-solr-search-optional)
16. [Varnish HTTP Cache (Optional)](#16-varnish-http-cache-optional)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. Requirements

### Server-Side

| Requirement | Minimum | Recommended |
|---|---|---|
| PHP | 8.0 | 8.1+ (tested through 8.5) |
| PHP extensions | `curl`, `intl`, `mbstring`, `pdo`, `pdo_mysql` or `pdo_pgsql`, `xml`, `zip`, `fileinfo`, `imagick` or `gd` | All above + `opcache`, `redis` |
| Composer | 2.x | Latest 2.x |
| Database | MySQL 5.7+ / MariaDB 10.3+ | MariaDB 10.6 LTS |
| | PostgreSQL 9.6+ | PostgreSQL 14+ |
| Web server | Apache 2.4 or Nginx 1.18+ | Nginx 1.24+ |
| Symfony CLI (optional) | 5.x | Latest |

### Client-Side (asset build only — not required on production)

| Requirement | Version |
|---|---|
| Node.js | **16 LTS** (v16.x) — do **not** use Node 18 or 20 for this release |
| Yarn | 1.22.x (classic) |
| nvm (recommended) | any |

> **Note:** The Webpack Encore version used in 3.2 (`~0.28`) is compatible with Node 16 LTS only. Using Node 18+ will produce webpack build errors. Pre-compile assets on Node 16 before deploying to production servers.

---

## 2. First-Time Installation

### Option A — Composer create-project (recommended)

```bash
composer create-project se7enxweb/exponential-platform:3.2.x-dev my_project --no-install
cd my_project
composer install
```

### Option B — Clone from GitHub

```bash
git clone https://github.com/se7enxweb/exponential-platform.git my_project
cd my_project
git checkout 3.2
composer install
```

### Option C — Clone to a specific directory

```bash
git clone -b 3.2 https://github.com/se7enxweb/exponential-platform.git /path/to/docroot
cd /path/to/docroot
composer install
```

---

## 3. Environment Configuration

Exponential Platform uses Symfony's Dotenv component. Copy the distributed template and then edit it:

```bash
cp .env .env.local
```

Open `.env.local` and set at minimum the following variables:

### Application

```dotenv
APP_ENV=dev          # or "prod" for production
APP_SECRET=<generate a random 32-char hex string>
APP_DEBUG=1          # set to 0 in production
```

Generate a secret:
```bash
php -r "echo bin2hex(random_bytes(16)) . PHP_EOL;"
```

### Database

```dotenv
DATABASE_DRIVER=pdo_mysql
DATABASE_VERSION=mariadb-10.3.0   # or mariadb-10.6.0 / 10.11.0 as appropriate; set to the PostgreSQL version number for pgsql
DATABASE_CHARSET=utf8mb4
DATABASE_COLLATION=utf8mb4_unicode_520_ci
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=exponential_platform
DATABASE_USER=db_user
DATABASE_PASSWORD=db_password
DATABASE_PLATFORM=mysql            # "mysql" or "pgsql"
```

The full DSN is assembled automatically from the individual variables — do not set `DATABASE_URL` directly unless you know what you are doing.

### Mailer (optional)

```dotenv
MAILER_DSN=smtp://localhost:25
```

### JWT (required for REST API)

The keypair is generated in [Section 9](#9-jwt-authentication-keypair). Leave these at their defaults for now:

```dotenv
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=<a passphrase of your choice>
```

### Solr (optional — for production search)

```dotenv
SOLR_DSN=http://localhost:8983/solr
SOLR_CORES=default
```

---

## 4. Database Setup

### Create the database and user (MySQL / MariaDB)

```sql
CREATE DATABASE exponential_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
CREATE USER 'db_user'@'localhost' IDENTIFIED BY 'db_password';
GRANT ALL PRIVILEGES ON exponential_platform.* TO 'db_user'@'localhost';
FLUSH PRIVILEGES;
```

### Create the database and user (PostgreSQL)

```sql
CREATE USER db_user WITH PASSWORD 'db_password';
CREATE DATABASE exponential_platform OWNER db_user ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';
```

### Run Doctrine migrations

```bash
php bin/console doctrine:migration:migrate --allow-no-migration
```

### Install Platform schema and seed data

```bash
# Install clean schema with no demo content:
php bin/console ezplatform:install clean

# Or run both install and GraphQL schema generation in one step using the Composer script:
composer ezplatform-install
```

---

## 5. Web Server Setup

### Option A — Symfony CLI (development only)

The quickest way to get a local dev server running:

```bash
symfony serve --port=8080
```

Access the site at `http://localhost:8080/` and the Admin UI at `http://localhost:8080/admin/`.

### Option B — Apache 2.4

Enable the `rewrite` and `headers` modules:

```bash
a2enmod rewrite headers
```

Create a virtual host:

```apache
<VirtualHost *:80>
    ServerName exponential.local
    DocumentRoot /path/to/my_project/public

    <Directory /path/to/my_project/public>
        AllowOverride All
        Require all granted
        Options -MultiViews
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/exponential_error.log
    CustomLog ${APACHE_LOG_DIR}/exponential_access.log combined
</VirtualHost>
```

The provided `public/.htaccess` handles Symfony's front controller routing automatically.

### Option C — Nginx

```nginx
server {
    listen 80;
    server_name exponential.local;
    root /path/to/my_project/public;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;
    }

    error_log /var/log/nginx/exponential_error.log;
    access_log /var/log/nginx/exponential_access.log;
}
```

---

## 6. File and Directory Permissions

The web server and CLI user must be able to write to two directories:

```bash
# If web server user is www-data and your user is $USER:
sudo setfacl -R -m u:www-data:rwX -m u:"$USER":rwX var/ public/var/
sudo setfacl -dR -m u:www-data:rwX -m u:"$USER":rwX var/ public/var/
```

If ACLs are not available:

```bash
chmod -R 777 var/ public/var/
```

> **Only `var/` and `public/var/` need to be writable.** Do not make the entire project tree writable.

---

## 7. Frontend Asset Build

The webpack-encore setup in 3.2 uses **Node.js 16 LTS** and **Yarn 1.22.x**. Building on Node 18 or newer will fail.

```bash
# Activate Node 16 via nvm:
nvm use 16

# Install Node dependencies (first run or after package.json changes):
yarn install

# Development build — includes source maps, unminified:
yarn dev

# Production build — minified, no source maps:
yarn build

# Watch mode — auto-rebuilds on file changes (development only):
yarn watch
```

After a successful build, compiled assets appear under `public/build/`.

---

## 8. Admin UI Asset Compile

The Admin UI ships its own Webpack Encore configuration. After the Yarn build, compile the Admin UI bundle:

```bash
php bin/console ezplatform:encore:compile
```

Also dump the JavaScript translation catalogue so the Admin UI strings are available:

```bash
php bin/console bazinga:js-translation:dump public/assets --merge-domains
```

Publish Symfony bundle assets (icons, fonts, etc.):

```bash
php bin/console assets:install --symlink --relative public
```

---

## 9. JWT Authentication Keypair

The REST API and Admin UI require asymmetric JWT tokens. Generate the RSA keypair:

```bash
php bin/console lexik:jwt:generate-keypair
```

This writes `config/jwt/private.pem` and `config/jwt/public.pem`. Make sure the private key is **not** committed to version control (it is listed in `.gitignore` by default).

Ensure the `JWT_PASSPHRASE` in `.env.local` matches the passphrase you set (or leave blank for no passphrase).

---

## 10. Search Index

### Built-in Legacy Search (Solr not required for dev)

No extra setup needed. The built-in search uses the database.

### Build the search index after install

```bash
# Full reindex — may take several minutes on large content trees:
php bin/console ezplatform:reindex

# Incremental — process N objects per iteration:
php bin/console ezplatform:reindex --iteration-count=50
```

See [Section 15](#15-solr-search-optional) to configure the optional Solr backend.

---

## 11. Cache Management

### Clear caches

```bash
# Clear all caches (dev or prod, depending on APP_ENV):
php bin/console cache:clear

# Clear and warm up production cache:
php bin/console cache:clear --env=prod && php bin/console cache:warmup --env=prod
```

### Redis (optional, recommended for production)

Install `predis/predis` and configure `config/packages/cache.yaml` to use Redis pools. See `config/packages/cache.yaml` for examples.

---

## 12. Day-to-Day Operations

### Useful commands after every deploy

```bash
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
php bin/console assets:install --symlink --relative public
php bin/console doctrine:migration:migrate --allow-no-migration
php bin/console ezplatform:encore:compile
php bin/console bazinga:js-translation:dump public/assets --merge-domains
```

### Check site health

```bash
php bin/console about              # environment summary
php bin/console debug:router       # verify route registration
php bin/console debug:container    # verify service wiring
```

---

## 13. Updating the Codebase

```bash
# Pull the latest 3.2 changes:
git pull origin 3.2

# Update PHP dependencies:
composer install

# Run any new database migrations:
php bin/console doctrine:migration:migrate --allow-no-migration

# Rebuild assets:
nvm use 16 && yarn install && yarn build && php bin/console ezplatform:encore:compile

# Clear caches:
php bin/console cache:clear
```

---

## 14. Cron Jobs

Add the Platform cron scheduler to your web server user's crontab:

```cron
* * * * * /usr/bin/php /path/to/my_project/bin/console ezplatform:cron:run >> /path/to/my_project/var/log/cron.log 2>&1
```

This fires all scheduled tasks (content expiry, notifications, scheduled publication, etc.).

---

## 15. Solr Search (Optional)

Exponential Platform includes `se7enxweb/ezplatform-solr-search-engine ~3.3.18` for production-grade search.

### Install and start Solr

```bash
# Download Solr 7.7.x (required for this version of the Solr search engine):
wget https://archive.apache.org/dist/lucene/solr/7.7.3/solr-7.7.3.tgz
tar xzf solr-7.7.3.tgz
cd solr-7.7.3
bin/solr start
```

### Create the core

```bash
php bin/console ezplatform:solr:create-core --cores=default
```

### Configure the search engine

In `config/packages/ibexa_solr.yaml` (or the appropriate package config), set:

```yaml
ez_search_engine_solr:
    endpoints:
        endpoint0:
            dsn: '%env(SOLR_DSN)%'
            core: '%env(SOLR_CORES)%'
    connections:
        default:
            entry_endpoints:
                - endpoint0
            mapping:
                default: endpoint0
```

In `.env.local`:

```dotenv
SOLR_DSN=http://localhost:8983/solr
SOLR_CORES=default
```

### Index all content

```bash
php bin/console ezplatform:reindex
```

---

## 16. Varnish HTTP Cache (Optional)

For high-traffic sites configure Varnish as a reverse proxy HTTP cache.

Sample Varnish VCL is provided in `doc/varnish/`. Adjust the backend host and port to match your setup.

Enable the Varnish cache in `config/packages/ibexa_http_cache.yaml`:

```yaml
ibexa_http_cache:
    purge_type: varnish
```

Set the `TRUSTED_PROXIES` in `.env.local`:

```dotenv
TRUSTED_PROXIES=127.0.0.1
```

Purge all cached content:

```bash
php bin/console fos:httpcache:invalidate:path / --all
```

---

## 17. Troubleshooting

### Blank page / HTTP 500 with no output

Enable `APP_DEBUG=1` in `.env.local` and tail the logs:

```bash
tail -f var/log/dev.log
tail -f var/log/prod.log
```

### "Connection refused" or "Unknown database"

Verify your `DATABASE_*` variables in `.env.local` are correct and that the MySQL / MariaDB / PostgreSQL service is running.

### Composer install fails with "Your lock file does not contain a compatible set of packages"

```bash
composer install --ignore-platform-reqs
# or regenerate the lock file:
composer update --lock
```

### Node / Yarn build fails

Check that you are running **Node.js 16 LTS**:

```bash
node -v    # must be v16.x
nvm use 16 && yarn build
```

### "JWT keypair not found"

Run:

```bash
php bin/console lexik:jwt:generate-keypair
```

Then verify `JWT_SECRET_KEY` and `JWT_PUBLIC_KEY` paths in `.env.local` match where the files were written.

### "No such file or directory" for `var/` or `public/var/`

```bash
mkdir -p var public/var
chmod -R 777 var public/var
```

### Cache not updating after deploy

```bash
php bin/console cache:clear --env=prod
php bin/console cache:warmup --env=prod
```

---

*For questions not covered here, see the [Where to Get More Help](../README.md#where-to-get-more-help) section of the main README.*

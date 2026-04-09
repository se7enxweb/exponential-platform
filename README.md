# Exponential Platform v3.2.9 (Stable; Open Source; Starter Skeleton)

[![PHP](https://img.shields.io/badge/PHP-8.0%20→%208.5-8892BF?logo=php&logoColor=white)](https://php.net)
[![Symfony](https://img.shields.io/badge/Symfony-5.1%2F5.4-000000?logo=symfony&logoColor=white)](https://symfony.com)
[![Platform](https://img.shields.io/badge/Platform-3.2%20OSS-orange)](https://github.com/se7enxweb/exponential-platform)
[![License: GPL v2 (or any  later version)](https://img.shields.io/badge/License-GPL%20v2%20(or%20any%20later%20version)-blue.svg)](https://www.gnu.org/licenses/gpl-2.0)
[![GitHub issues](https://img.shields.io/github/issues/se7enxweb/exponential-platform)](https://github.com/se7enxweb/exponential-platform/issues)
[![GitHub stars](https://img.shields.io/github/stars/se7enxweb/exponential-platform?style=social)](https://github.com/se7enxweb/exponential-platform)

## Exponential Platform Project Notice

> "Please Note: This project is not associated with the original eZ Publish software or its original developer, eZ Systems or Ibexa."

This is an independent, 7x + community-driven continuation of the platform. The Exponential Platform codebase is stewarded and evolved by [7x (se7enx.com)](https://se7enx.com) and the open-source community of developers and integrators who have relied on it for decades.

---

## Exponential Platform Project Status

**Exponential Platform 3.2.9** is the current stable release on the `3.2` branch. It runs the **Exponential Platform kernel** on **Symfony 5.1/5.4 LTS** (full-stack, single kernel — no LegacyBridge) with full PHP 8.x support. Ongoing work focuses on:

- Continued PHP 8.x compatibility (8.2, 8.3, 8.4, 8.5 tested and supported)
- Dependency upgrades across Composer and Yarn package ecosystems
- Security patches and vulnerability triage
- Documentation and developer experience improvements

---

## Who is 7x

[7x](https://se7enx.com) is the North American corporation driving the continued general use, support, development, hosting, and design of Exponential Platform Open Source Content Management System.

7x has been in business supporting Exponential Platform website customers and projects for over 24 years. 7x took over leadership of the project and its development, support, adoption and community growth in 2023.

**7x offers:**
- Commercial support subscriptions for Exponential Platform deployments
- Hosting on the Exponential Platform cloud infrastructure (`exponential.earth`)
- Custom development, migrations, upgrades, and training
- Community stewardship via [share.exponential.earth](https://share.exponential.earth)

---

## What is Exponential Platform?

*Exponential Platform* is a fully open source professional CMS (Content Management System) developed by [7x](https://se7enx.com) and the Exponential Platform community.

The **3.2.x** release runs on the **Symfony 5 framework (Full Stack)** — a single-kernel architecture using the Exponential Platform content repository, REST API v2, GraphQL, JWT authentication, and Webpack Encore asset pipeline.

- **Very extensible** — Extend the application and content model in many ways.
- **Future and backwards compatible** — Strong backward compatibility policy on data as well as code.
- **Multi-channel by design** — Strong focus on separation between <sup>semantic</sup> content and design.
- **Scalable** — Easily scale across multiple servers out of the box.
- **Future proof** — Architecture designed to allow even more content scalability and performance.
- **Stable** — Built on experience in building CMS gathered since early 2000.
- **Integration friendly** — Numerous events and signals to hook into for advanced needs.

Exponential Platform is fully open source and is the foundation for the commercial *Exponential Digital Experience Platform* software, which adds advanced features for editorial teams, entirely built on top of *Exponential Platform* APIs.

## Technology Stack

| Layer | Technology |
|---|---|
| **Language** | PHP 8.0 → 8.5 |
| **Framework** | Symfony 5.1 / 5.4 LTS |
| **CMS Core** | Exponential Platform kernel (`se7enxweb/ezplatform-kernel`) |
| **ORM** | Doctrine ORM 2.x |
| **Template Engine** | Twig 3.x |
| **Frontend Build** | Webpack Encore + Yarn 1.x + Node.js 16 LTS |
| **Search** | Legacy search (default) · Solr 7.7 / 8.x (optional) |
| **HTTP Cache** | Symfony HttpCache (default) · Varnish 6/7 (optional) |
| **App Cache** | Filesystem (default) · Redis 6+ (optional) |
| **Database** | MySQL 8.0+ · MariaDB 10.3+ · PostgreSQL 14+ |
| **API** | REST API v2 · GraphQL (schema auto-generated) · JWT auth |
| **Admin UI** | Exponential Platform Admin UI (`/admin/`) |
| **Dependency Mgmt** | Composer 2.x · Yarn 1.x |

---

## Requirements

- PHP 8.0+ (8.2, 8.3, or 8.5 recommended)
- A web server: Apache 2.4 or Nginx 1.18+
- A database server: MySQL 8.0+, MariaDB 10.3+, or PostgreSQL 14+
- Composer 2.x
- Node.js 16 LTS (via nvm recommended)
- Yarn 1.22.x

| Requirement | Minimum | Recommended |
|---|---|---|
| PHP | 8.0 | 8.3 or 8.5 |
| Composer | 2.x | latest 2.x |
| Node.js | 16 LTS | 16 LTS (via nvm) |
| Yarn | 1.x | 1.22.x |
| MySQL | 8.0 | 8.0+ (utf8mb4) |
| MariaDB | 10.3 | 10.6+ |
| PostgreSQL | 14 | 16+ |
| Redis | 6.0 | 7.x (optional) |
| Solr | 7.7 | 8.11.x (optional) |
| Varnish | 6.0 | 7.1+ (optional) |
| Apache | 2.4 | 2.4 (event + PHP-FPM) |
| Nginx | 1.18 | 1.24+ |

---

## Quick Start

```bash
# 1. Create project
composer create-project se7enxweb/exponential-platform:3.2.x-dev my_project
cd my_project

# 2. Configure environment
cp .env .env.local
# Edit DATABASE_HOST, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, APP_SECRET

# 3. Create database and import seed data
mysql -u root -p -e "CREATE DATABASE exponential CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;"
php bin/console ezplatform:install clean

# 4. Set permissions
setfacl -R -m u:www-data:rwX -m g:www-data:rwX var/ public/var/
setfacl -dR -m u:www-data:rwX -m g:www-data:rwX var/ public/var/

# 5. Build assets
nvm use 16
yarn install
yarn build
php bin/console ezplatform:encore:compile

# 6. Generate JWT keypair (REST API)
php bin/console lexik:jwt:generate-keypair

# 7. Clear all caches
php bin/console cache:clear

# 8. Start dev server
symfony server:start
# → https://127.0.0.1:8000         (public site)
# → https://127.0.0.1:8000/admin/  (Admin UI — admin / publish)
# → https://127.0.0.1:8000/api/ezp/v2/  (REST API v2)
```

> See [doc/INSTALL.md](doc/INSTALL.md) for the complete step-by-step guide.

---

## Main Exponential Platform Features

- User defined content classes and objects
- Version control
- Advanced multi-lingual support
- Built-in search engine
- Separation of content and presentation layer
- Fine-grained role-based permissions system
- Content approval and scheduled publication
- Multi-site support
- Multimedia support with automatic image conversion and scaling
- RSS feeds
- Contact forms
- Built-in webshop
- Flexible workflow management system
- Full support for Unicode
- Twig 3.x template engine
- A headless CRUD REST API v2
- Database abstraction layer supporting MySQL, MariaDB, and PostgreSQL
- MVC architecture
- Support for the latest image and video file formats (webp, webm, png, jpeg, etc.)
- Support for highly available and scalable configurations (multi-server clusters)
- XML handling and parsing library
- SOAP communication library
- Localisation and internationalisation libraries
- SDK (software development kit) and full documentation
- Plugin API with thousands of open-source extensions available

---

## Installation

Create a new project using Composer:

```bash
composer create-project se7enxweb/exponential-platform:3.2.x-dev my_project
```

The full installation guide covers environment configuration, database setup, web server configuration, asset builds, JWT keypair generation, search indexing, cron jobs, Solr, Varnish, and production deployment.

See **[doc/INSTALL.md](doc/INSTALL.md)** for the complete step-by-step guide.

---

## Key CLI Commands Reference

### Symfony Core

```bash
php bin/console list                                     # list all registered commands
php bin/console help <command>                           # help for a specific command
php bin/console cache:clear                              # clear application cache
php bin/console cache:clear --env=prod                   # clear production cache
php bin/console cache:warmup --env=prod                  # warm up prod cache after deploy
php bin/console assets:install --symlink --relative public  # publish bundle public/ assets
php bin/console debug:router                             # list all routes
php bin/console debug:container                          # list all service IDs
php bin/console debug:config <bundle>                    # dump resolved bundle config
```

### Doctrine / Migrations

```bash
php bin/console doctrine:migration:migrate --allow-no-migration   # run pending migrations
php bin/console doctrine:migration:status                         # show migration status
php bin/console doctrine:migration:diff                           # generate a new migration
php bin/console doctrine:schema:validate                          # validate entity mappings
```

### Exponential Platform

```bash
php bin/console ezplatform:install clean                 # fresh install (no demo content)
php bin/console ezplatform:reindex                       # rebuild search index (full)
php bin/console ezplatform:reindex --iteration-count=50  # incremental reindex
php bin/console ezplatform:cron:run                      # run the Platform cron scheduler
php bin/console ezplatform:graphql:generate-schema       # regenerate GraphQL schema
php bin/console ezplatform:solr:create-core --cores=default  # set up Solr core
php bin/console bazinga:js-translation:dump public/assets --merge-domains  # JS i18n
php bin/console fos:httpcache:invalidate:path / --all    # purge HTTP cache paths
php bin/console lexik:jwt:generate-keypair               # generate RSA keypair for REST API
```

### Frontend / Asset Build (Yarn / Webpack)

```bash
nvm use 16              # activate Node.js 16 LTS (required)
yarn install            # install / update Node dependencies
yarn dev                # build all assets with source maps — dev mode
yarn build              # build all assets minified for production
yarn watch              # watch mode — auto-rebuild on change
php bin/console ezplatform:encore:compile   # compile Admin UI encore assets
```

---

## Issue Tracker

Submitting bugs, improvements and stories is possible on
[https://github.com/se7enxweb/exponential-platform/issues](https://github.com/se7enxweb/exponential-platform/issues)

If you discover a security issue, please responsibly report it via email to security@exponential.earth

---

## Where to Get More Help

| Resource | URL |
|---|---|
| Platform Website | [platform.exponential.earth](https://platform.exponential.earth) |
| Documentation Hub | [doc.exponential.earth](https://doc.exponential.earth) |
| Community Forums | [share.exponential.earth](https://share.exponential.earth) |
| GitHub Organisation | [github.com/se7enxweb](https://github.com/se7enxweb) |
| This Repository | [github.com/se7enxweb/exponential-platform](https://github.com/se7enxweb/exponential-platform) |
| Issue Tracker | [Issues](https://github.com/se7enxweb/exponential-platform/issues) |
| Discussions | [Discussions](https://github.com/se7enxweb/exponential-platform/discussions) |
| Telegram Chat | [t.me/exponentialcms](https://t.me/exponentialcms) |
| Discord | [discord.gg/exponential](https://discord.gg/exponential) |
| 7x Corporate | [se7enx.com](https://se7enx.com) |
| Support Subscriptions | [support.exponential.earth](https://support.exponential.earth) |
| Sponsor 7x | [sponsor.se7enx.com](https://sponsor.se7enx.com) |

---

## How to Contribute

Everyone is encouraged to [contribute](CONTRIBUTING.md) to the development of new features and bugfixes for Exponential Platform.

1. **Fork** the repository: [github.com/se7enxweb/exponential-platform](https://github.com/se7enxweb/exponential-platform)
2. **Clone** your fork and create a feature branch: `git checkout -b feature/my-improvement`
3. **Install** the full dev stack per [doc/INSTALL.md](doc/INSTALL.md) (`APP_ENV=dev`)
4. **Make** your changes — follow coding standards in [CONTRIBUTING.md](CONTRIBUTING.md)
5. **Test** with `php bin/phpunit` and verify no regressions
6. **Push** your branch and open a **Pull Request** against the `3.2` branch
7. **Participate** in the review — maintainers will give feedback promptly

---

## Donate and Make a Support Subscription

You can support this project and its community by making a donation at
[sponsor.se7enx.com](https://sponsor.se7enx.com),
[paypal.com/paypalme/7xweb](https://www.paypal.com/paypalme/7xweb), or
[github.com/sponsors/se7enxweb](https://github.com/sponsors/se7enxweb).

Every contribution goes directly toward maintaining PHP compatibility, patching the kernel, writing documentation, running community infrastructure, and triaging security vulnerabilities.

---

## COPYRIGHT

Copyright (C) 1998 - 2026 7x. All rights reserved.

Copyright (C) 1999-2020 Ibexa AS (formerly eZ Systems AS). All rights reserved.

---

## LICENSE

This source code is available under the following license:

GNU General Public License, version 2.
See: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

---

*Copyright &copy; 1998 – 2026 7x (se7enx.com). All rights reserved unless otherwise noted.*  
*Exponential Platform is Open Source software released under the GNU GPL v2 or any later version.*

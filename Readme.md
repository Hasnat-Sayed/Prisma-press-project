# 📰 Prisma Press

A modular blog backend built with **Express 5**, **TypeScript**, **Prisma 7** and **PostgreSQL**.
It provides authentication, user profiles, blog posts, comments, admin reporting and a
**Stripe-powered premium subscription** for paid content.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)
![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

🌐 **Live API:** [https://prisma-press-project.vercel.app](https://prisma-press-project.vercel.app)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Authentication & Roles](#-authentication--roles)
- [API Reference](#-api-reference)
- [Data Model](#-data-model)
- [Premium Subscriptions (Stripe)](#-premium-subscriptions-stripe)
- [Error Handling](#-error-handling)
- [Known Limitations & Roadmap](#-known-limitations--roadmap)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Authentication**: register, log in, and refresh tokens using JWT (access + refresh) and bcrypt password hashing.
- **HTTP-only cookies** for token storage, with support for the `Authorization` header as well.
- **User profiles**: every user gets a profile (photo, bio) created in the same database transaction.
- **Posts**: create, list, search, filter, sort, paginate, update and delete.
- **View counter**: reading a post increments its view count and returns approved comments only.
- **Comments**: create, edit, delete (owner only) and admin moderation (`APPROVED` / `REJECT`).
- **Role-based access control**: `USER`, `AUTHOR` and `ADMIN`.
- **Admin stats**: totals for posts, comments and views.
- **Premium content**: Stripe Checkout subscription unlocks premium-only posts.
- **Centralised error handling**: Prisma errors are translated into readable responses.

---

## 🧰 Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript (strict mode) |
| Web framework | Express 5 |
| ORM | Prisma 7 (generated client in `generated/prisma`) |
| Database | PostgreSQL via `@prisma/adapter-pg` |
| Auth | `jsonwebtoken` + `bcryptjs` |
| Payments | Stripe (Checkout + Webhooks) |
| Middleware | `cors`, `cookie-parser`, JSON / URL-encoded body parsers |
| Dev tooling | `tsx` (watch mode), `tsc` (build) |

---

## 🗂 Project Structure

```
prisma-press-project/
├── prisma/
│   ├── schema/                 # Multi-file Prisma schema
│   │   ├── schema.prisma       # generator + datasource
│   │   ├── user.prisma
│   │   ├── profile.prisma
│   │   ├── post.prisma
│   │   ├── comment.prisma
│   │   ├── subscription.prisma
│   │   └── enums.prisma
│   └── migrations/             # SQL migrations
├── prisma7.config.ts           # Prisma CLI config (schema + migrations path)
├── src/
│   ├── app.ts                  # Express app, middleware and route mounting
│   ├── server.ts               # Connects to DB, then starts the server
│   ├── config/                 # Reads environment variables
│   ├── lib/                    # Prisma client and Stripe client
│   ├── middlewares/            # auth, premium guard, notFound, globalErrorHandler
│   ├── modules/                # One folder per feature
│   │   ├── auth/
│   │   ├── users/
│   │   ├── post/
│   │   ├── comment/
│   │   ├── subscription/
│   │   └── premium/
│   └── utils/                  # catchAsync, jwt helpers, sendResponse
├── .env.example
├── package.json
└── tsconfig.json
```

Each module follows the same pattern: **route → controller → service** (plus an interface file for types).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer
- A running PostgreSQL database (local, Docker, Neon, Supabase, etc.)
- `npm` or `pnpm`
- *(Optional, for premium features)* a [Stripe](https://stripe.com) account and the [Stripe CLI](https://docs.stripe.com/stripe-cli)

### 1. Clone the repository

```bash
git clone https://github.com/Hasnat-Sayed/Prisma-press-project.git
cd Prisma-press-project
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in the values described in [Environment Variables](#-environment-variables).

### 4. Set up the database

The Prisma config file in this project is named `prisma7.config.ts` (not the default `prisma.config.ts`),
so pass it to every Prisma CLI command with `--config`.

```bash
# Generate the Prisma client (output goes to ./generated/prisma)
npx prisma generate --config prisma7.config.ts

# Apply the migrations to your database
npx prisma migrate deploy --config prisma7.config.ts
```

### 5. Run the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm run build
npm start
```

Open `http://localhost:<PORT>/` — you should see `Hello, World!`.

### Startup behaviour

1. Environment variables are loaded.
2. Prisma connects to PostgreSQL.
3. The server starts listening **only after** the database connection succeeds.
4. If startup fails, Prisma disconnects and the process exits with an error.

---

## 🔐 Environment Variables

| Variable | Required | Description |
| --- | :---: | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `PORT` | ✅ | HTTP port (use `5000` if you use the bundled Stripe webhook script) |
| `APP_URL` | ✅ | Frontend origin allowed by CORS. Also used for Stripe success/cancel redirects |
| `BCRYPT_SALT_ROUNDS` | ✅ | Password hashing cost (e.g. `10`) |
| `JWT_ACCESS_SECRET` | ✅ | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | ✅ | Access-token lifetime (e.g. `1d`) |
| `JWT_REFRESH_EXPIRES_IN` | ✅ | Refresh-token lifetime (e.g. `7d`) |
| `STRIPE_SECRET_KEY` | ⚠️ premium | Stripe secret API key |
| `STRIPE_PRODUCT_PRICE_ID` | ⚠️ premium | Stripe Price ID of the subscription product |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ premium | Signing secret of the Stripe webhook endpoint |

Example `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/prisma_press"
PORT=5000
APP_URL="http://localhost:3000"

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET="change-me-access"
JWT_REFRESH_SECRET="change-me-refresh"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="7d"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRODUCT_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```



---

## 📜 Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with `tsx watch` (auto-reload) |
| `npm run build` | Compiles TypeScript with `tsc` into `dist/` |
| `npm start` | Runs the compiled server (`node dist/server.js`) |
| `npm run stripe:webhook` | Forwards Stripe events to `localhost:5000/api/subscription/webhook` (requires Stripe CLI) |

---


## 🔑 Authentication & Roles

### How login works

1. `POST /api/auth/login` verifies the email and password.
2. The server returns an **access token** and a **refresh token** in the response body
   and also sets both as **HTTP-only cookies**.
3. Protected routes read the access token from (in this order):
   1. the `accessToken` cookie,
   2. the `Authorization: Bearer <token>` header,
   3. the raw `Authorization: <token>` header.
4. When the access token expires, call `POST /api/auth/refresh-token`. It reads the
   `refreshToken` cookie and issues a new access token.

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Cookies

| Cookie | Lifetime | Flags |
| --- | --- | --- |
| `accessToken` | 1 day | `httpOnly`, `sameSite: none`, `secure: false` |
| `refreshToken` | 7 days | `httpOnly`, `sameSite: none`, `secure: false` |

> For production over HTTPS, set `secure: true` in the auth controller.

### Roles

| Role | Description |
| --- | --- |
| `USER` | Default role for every new registration |
| `AUTHOR` | Defined in the schema; currently has the same route access as `USER` |
| `ADMIN` | Can edit/delete any post and moderate comments |

New users are always created as `ACTIVE` + `USER`. To create an admin, change the `role` value
directly in the database (for example with `npx prisma studio --config prisma7.config.ts`).
Users with `activeStatus = BLOCKED` cannot log in or use protected routes.

---

## 📡 API Reference

| Environment | Base URL |
| --- | --- |
| Production (Vercel) | `https://prisma-press-project.vercel.app/api` |
| Local | `http://localhost:<PORT>/api` |

Quick check that the live API is running:

```bash
curl https://prisma-press-project.vercel.app/
# Hello, World!

curl "https://prisma-press-project.vercel.app/api/posts?page=1&limit=5"
```

Successful responses use this shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request completed successfully",
  "data": {}
}
```

Paginated responses also include `meta`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Post retrived SuccessFully",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 },
  "data": []
}
```

### Endpoint summary

| Area | Method | Route | Access |
| --- | --- | --- | --- |
| Health | GET | `/` | Public |
| Auth | POST | `/api/auth/login` | Public |
| Auth | POST | `/api/auth/refresh-token` | Public (needs refresh cookie) |
| Users | POST | `/api/users/register` | Public |
| Users | GET | `/api/users/me` | Logged in |
| Users | PUT | `/api/users/my-profile` | Logged in |
| Posts | GET | `/api/posts` | Public |
| Posts | GET | `/api/posts/stats` | Public *(planned: ADMIN only)* |
| Posts | GET | `/api/posts/my-posts` | Logged in |
| Posts | GET | `/api/posts/:postId` | Public |
| Posts | POST | `/api/posts` | Logged in |
| Posts | PATCH | `/api/posts/:postId` | Owner or ADMIN |
| Posts | DELETE | `/api/posts/:postId` | Owner or ADMIN |
| Comments | POST | `/api/comments` | Logged in |
| Comments | GET | `/api/comments/author/:authorId` | Public |
| Comments | GET | `/api/comments/:postId` | Public |
| Comments | PATCH | `/api/comments/:commentId` | Comment owner |
| Comments | DELETE | `/api/comments/:commentId` | Comment owner |
| Comments | PATCH | `/api/comments/:commentId/moderate` | ADMIN |
| Subscription | POST | `/api/subscription/checkout` | Logged in |
| Subscription | GET | `/api/subscription/status` | Logged in |
| Subscription | POST | `/api/subscription/webhook` | Stripe only |
| Premium | GET | `/api/premium` | Logged in + active subscription |



---

### 🔸 Auth

#### `POST /api/auth/login`

```json
{ "email": "user@example.com", "password": "password123" }
```

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User is logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

#### `POST /api/auth/refresh-token`

No body. Send the `refreshToken` cookie.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token Refreshed Successfully",
  "data": { "accessToken": "eyJhbGciOi..." }
}
```

---

### 🔸 Users

#### `POST /api/users/register`

Creates the user and their profile in a single transaction. The password is hashed with bcrypt.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "profilePhoto": "https://example.com/photo.jpg"
}
```

Response `data` (password is never returned):

```json
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "activeStatus": "ACTIVE",
  "role": "USER",
  "profile": { "profilePhoto": "https://example.com/photo.jpg", "bio": null }
}
```

#### `GET /api/users/me`

Returns the logged-in user with their profile (without the password).

#### `PUT /api/users/my-profile`

```json
{
  "name": "John Updated",
  "profilePhoto": "https://example.com/new-photo.jpg",
  "bio": "Software Engineer and Writer"
}
```

---

### 🔸 Posts

#### `POST /api/posts`

```json
{
  "title": "My First Post",
  "content": "Content of the post goes here.",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "isFeatured": false,
  "isPremium": false,
  "status": "PUBLISHED",
  "tags": ["typescript", "prisma", "express"]
}
```

- `status` is one of `DRAFT`, `PUBLISHED` (default), `ARCHIVED`.
- Setting `isPremium: true` requires an **active subscription**.

#### `GET /api/posts`

Public, filtered, paginated list. Premium posts are **not** included here (they are served by `/api/premium`).

| Query param | Description | Default |
| --- | --- | --- |
| `searchTerm` | Case-insensitive search in title and content | none |
| `tags` | JSON array string, e.g. `["typescript","prisma"]` (matches any) | none |
| `isFeatured` | Filter by featured flag | none |
| `status` | `DRAFT`, `PUBLISHED` or `ARCHIVED` | none |
| `authorId` | Only posts by this author | none |
| `title` / `content` | Exact match filters | none |
| `page` | Page number | `1` |
| `limit` | Items per page | `10` |
| `sortBy` | Any post field | `createdAt` |
| `sortOrder` | `asc` or `desc` | `desc` |

Example:

```http
GET /api/posts?searchTerm=prisma&tags=["typescript","backend"]&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

#### `GET /api/posts/:postId`

Returns a single non-premium post with its author (no password) and **approved comments only**.
Every call increments `views` by 1 (done in a database transaction).

#### `GET /api/posts/my-posts`

All posts written by the logged-in user, with comments and comment count.

#### `PATCH /api/posts/:postId`

Updatable fields: `title`, `content`, `thumbnail`, `isFeatured`, `status`, `tags`.

- Admins can update any post.
- Other users can update only their own posts.

#### `DELETE /api/posts/:postId`

Same ownership rules as update. Comments on the post are deleted with it (cascade).

#### `GET /api/posts/stats`

```json
{
  "totalPosts": 42,
  "totalPublishedPosts": 30,
  "totalDraftPosts": 8,
  "totalArchivedPosts": 4,
  "totalComments": 120,
  "totalApprovedComments": 110,
  "totalRejectedComments": 10,
  "totalPostViews": 5400
}
```

---

### 🔸 Comments

#### `POST /api/comments`

```json
{ "content": "This is a comment", "postId": "post-id-1" }
```

The post must exist. New comments default to `APPROVED`.

#### `GET /api/comments/author/:authorId`

All comments written by an author (newest first), each including the related post's `id` and `title`.

#### `PATCH /api/comments/:commentId`

Edit your own comment.

#### `DELETE /api/comments/:commentId`

Delete your own comment.

#### `PATCH /api/comments/:commentId/moderate` *(ADMIN)*

```json
{ "status": "REJECT" }
```

Allowed values: `APPROVED`, `REJECT`. Setting the status it already has returns an error.

---

### 🔸 Subscription & Premium

| Endpoint | Purpose |
| --- | --- |
| `POST /api/subscription/checkout` | Creates a Stripe Checkout session and returns its data (redirect the user to the Stripe URL) |
| `GET /api/subscription/status` | Returns the current user's subscription status |
| `POST /api/subscription/webhook` | Receives Stripe events (raw body, signature verified) |
| `GET /api/premium` | Lists premium posts. Supports the same query params as `GET /api/posts` |

---

## 🗃 Data Model

```mermaid
erDiagram
    USER ||--o| PROFILE : has
    USER ||--o{ POST : writes
    USER ||--o{ COMMENT : writes
    USER ||--o| SUBSCRIPTION : has
    POST ||--o{ COMMENT : has

    USER {
        uuid id PK
        string name
        string email UK
        string password
        enum activeStatus "ACTIVE | BLOCKED"
        enum role "USER | AUTHOR | ADMIN"
    }
    PROFILE {
        uuid id PK
        string userId UK
        string profilePhoto
        string bio
    }
    POST {
        uuid id PK
        string title
        text content
        string thumbnail
        boolean isFeatured
        boolean isPremium
        enum status "DRAFT | PUBLISHED | ARCHIVED"
        string[] tags
        int views
        string authorId FK
    }
    COMMENT {
        uuid id PK
        text content
        enum status "APPROVED | REJECT"
        string authorId FK
        string postId FK
    }
    SUBSCRIPTION {
        uuid id PK
        string userId UK
        enum status "ACTIVE | CANCELED | EXPIRED"
        datetime currentPeriodEnd
        string stripeCustomerId UK
        string stripeSubscriptionId UK
    }
```

Key rules:

- Every table uses a UUID primary key.
- `User.email` is unique.
- Deleting a user cascades to their posts, comments and subscription; deleting a post cascades to its comments.
- `Post.authorId`, `Comment.authorId` and `Comment.postId` are indexed.

---

## 💳 Premium Subscriptions (Stripe)

1. A logged-in user calls `POST /api/subscription/checkout` and is sent to Stripe Checkout
   (`mode: subscription`, using `STRIPE_PRODUCT_PRICE_ID`).
2. After payment, Stripe calls `POST /api/subscription/webhook`. The signature is verified with `STRIPE_WEBHOOK_SECRET`.
3. The webhook handles:
   - `checkout.session.completed` → creates/updates the user's `Subscription` as `ACTIVE`.
   - `customer.subscription.updated` → syncs status (`ACTIVE`, `CANCELED`, `EXPIRED`) and `currentPeriodEnd`.
4. `GET /api/premium` uses the `subscriptionGuard` middleware, which allows only users with an `ACTIVE` subscription.

### Testing webhooks locally

```bash
stripe login
npm run stripe:webhook
```

Copy the `whsec_...` secret printed by the Stripe CLI into `STRIPE_WEBHOOK_SECRET`, then restart the server.

---

## 🚨 Error Handling

- Unknown routes return a **404** response.
- All other errors go through a global error handler.
- Common Prisma errors are translated into readable messages:

| Prisma code | Meaning | Message |
| --- | --- | --- |
| `P2002` | Unique constraint | Duplicate Key Error |
| `P2003` | Foreign key constraint | Foreign key constraint failed |
| `P2025` | Record not found | Operation failed because a required record was not found |
| Validation error | Wrong or missing fields | You have provided incorrect field type or missing fields |

Error response shape:

```json
{
  "success": false,
  "statusCode": 400,
  "name": "PrismaClientKnownRequestError",
  "message": "Duplicate Key Error"
}
```

---

## ⚠️ Known Limitations & Roadmap

This project is a learning/portfolio backend. These are known gaps and good first improvements:

-  No request validation library (e.g. Zod) yet.
- No automated tests.
- No rate limiting.
- Logging is done with `console`.
- `GET /api/posts/stats` should be restricted to `ADMIN`.
- `GET /api/comments/:postId` currently filters by comment `id` instead of `postId`.
- The global error handler always sends HTTP status `500`; use the computed `statusCode` for the real HTTP status.
- Authorization errors are thrown as plain `Error`s; use a custom `AppError` with proper status codes (401 / 403).
- Cookies use `secure: false`; enable `secure: true` in production (required for `SameSite=None` on the Vercel deployment).
- Add `postinstall` / `prisma generate` to the scripts, and rename `prisma7.config.ts` to `prisma.config.ts` so `--config` is no longer needed.
- Some controllers use `sendResponse` while others return custom JSON; unify them.
- Add the `AUTHOR` role to real workflows (e.g. only authors/admins can publish).

---

## 📚 Documentation

| Resource | Location |
| --- | --- |
| Backend requirements (source of truth) | [`docs/Prisma_Press_Backend_Requirement_Analysis.pdf`](docs/Prisma_Press_Backend_Requirement_Analysis.pdf) |
| Postman collection | [`docs/postman/prisma-press.postman_collection.json`](docs/postman/prisma-press.postman_collection.json) |
| Live API | [prisma-press-project.vercel.app](https://prisma-press-project.vercel.app) |


---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Keep the existing module structure (`route → controller → service`).
4. Keep Prisma as the source of truth for persistence and do not break the current API contract without a versioned change.
5. Commit your changes and open a Pull Request.

---

## 📄 License

Released under the [ISC License](https://opensource.org/licenses/ISC).

---

<p align="center">Built with ❤️ by <a href="https://github.com/Hasnat-Sayed">@Hasnat-Sayed</a></p>
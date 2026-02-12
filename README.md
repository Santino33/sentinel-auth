# Sentinel Auth

Production-ready, multi-tenant authentication and authorization service built with Node.js and TypeScript.

## Features

- **Multi-tenancy**: Complete isolation of projects, users, and roles
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per project
- **JWT Authentication**: Access tokens and refresh tokens
- **Email Verification**: Users must verify email before login
- **Password Reset**: Secure password recovery flow
- **Bootstrap Keys**: High-level administrative operations

## Tech Stack

- Node.js + TypeScript
- Prisma ORM + PostgreSQL
- Express.js
- Docker + Docker Compose

## Quick Start

### Development

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start development server
npm run dev
```

### Production Build

```bash
# Build TypeScript
npm run build

# Run compiled code
npm start
```

## Database

### Start Database

```bash
docker-compose up -d postgres
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force
```

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://postgres:root@localhost:5432/sentinel?schema=public

# Admin
ADMIN_BOOTSTRAP_TOKEN=super-secret-once

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# JWT (auto-generated if not set)
JWT_SECRET=your-secret-key
```

## Testing

### Run All Tests

```bash
# Start database first
docker-compose up -d postgres

# Get admin key from container logs
docker logs sentinel-back | grep "ADMIN_KEY="

# Run email verification tests
ADMIN_KEY=your_admin_key npx ts-node test/email-verification/test-email-verification.ts

# Run other tests
ADMIN_KEY=your_admin_key npx ts-node test/login/test-flow.ts
```

### Available Test Files

| Test | Description | Command |
|------|-------------|---------|
| Email Verification | Complete verification flow | `npx ts-node test/email-verification/test-email-verification.ts` |
| Login Flow | Authentication tests | `npx ts-node test/login/test-flow.ts` |
| Change Password | Password change tests | `npx ts-node test/login/test-change-password.ts` |
| Refresh Token | Token refresh tests | `npx ts-node test/login/test-refresh-token.ts` |
| DB Connection | Database tests | `npx ts-node test/login/test-db.ts` |

### Test Admin Key

After starting the application:

```bash
docker logs sentinel-back | grep "ADMIN_KEY="
```

**Important:** The admin key is only shown once when the application first starts. Save it immediately.

### Troubleshooting Tests

If tests fail with "column does not exist":

```bash
# Sync Prisma schema
npx prisma db push

# Restart the container
docker-compose restart sentinel-back
```

## Project Structure

```
sentinel-auth/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Prisma migrations
├── src/
│   ├── modules/
│   │   ├── auth/         # Authentication
│   │   ├── users/        # User management
│   │   ├── projects/     # Multi-tenancy
│   │   ├── roles/        # RBAC
│   │   ├── adminKeys/    # Admin operations
│   │   ├── password_reset/
│   │   └── email_verification/
│   ├── errors/           # Custom errors
│   ├── middleware/       # Express middleware
│   ├── lib/              # Shared utilities
│   └── utils/            # Helper functions
├── test/                 # Integration tests
├── docker-compose.yml    # Docker services
├── Dockerfile            # Production image
└── package.json
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/refresh | Refresh tokens |
| POST | /api/auth/change-password | Change password |
| POST | /api/auth/request-verification | Request verification email |
| POST | /api/auth/verify-email | Verify email with code |

### Users (requires x-api-key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users |
| POST | /api/users | Create user |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### Password Reset

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/password-reset/request | Request reset code |
| POST | /api/auth/password-reset/verify | Verify reset code |
| POST | /api/auth/password-reset/reset | Reset password |

### Admin (requires x-admin-key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/projects | Create project |

## Deployment to Render

### 1. Create Render Account

Sign up at [render.com](https://render.com)

### 2. Create PostgreSQL Database

1. Go to Dashboard → New → PostgreSQL
2. Configure:
   - Name: `sentinel-db`
   - Database: `sentinel`
   - User: `sentinel`
3. Copy the `Internal Database URL`

### 3. Create Web Service

1. Go to Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - Name: `sentinel-auth`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
4. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://sentinel:xxx@your-host.render.com/sentinel?schema=public
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_BOOTSTRAP_TOKEN=your-admin-bootstrap-token
   ```
5. Add SMTP variables (optional, for emails):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

### 4. Get Admin Key

After first deploy, check Render logs for the admin key:

```bash
# In Render dashboard, go to Logs
# Look for: "ADMIN_KEY=xxxxxxxxx..."
```

### 5. Configure Domain (Optional)

1. Go to Settings → Custom Domains
2. Add your domain
3. Update DNS records

### Render Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for JWT signing |
| ADMIN_BOOTSTRAP_TOKEN | Yes | For admin operations |
| SMTP_HOST | No | SMTP server hostname |
| SMTP_PORT | No | SMTP port (587 or 465) |
| SMTP_USER | No | SMTP username |
| SMTP_PASS | No | SMTP password/app token |
| EMAIL_FROM | No | From address for emails |
| PORT | No | Override port (Render sets this) |

### Troubleshooting Render

**Build fails:**
```bash
# Test locally first
docker-compose up -d postgres
npm install && npx prisma generate && npm run build
```

**Database connection fails:**
- Ensure DATABASE_URL is correct
- Check that Render PostgreSQL is not suspended (upgrade to paid or keep active)

**Emails not sending:**
- Verify SMTP credentials
- For Gmail, use App Password instead of regular password

## License

MIT

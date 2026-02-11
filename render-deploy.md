# Render Deployment Guide

This guide covers deploying Sentinel Auth to [Render](https://render.com), a cloud platform that supports Node.js applications with PostgreSQL.

## Prerequisites

- GitHub account with repository access
- Render account
- Gmail account (for SMTP) or another email provider

## Step 1: Create Render PostgreSQL Database

1. **Log in to Render Dashboard**
2. Click **New** → **PostgreSQL**
3. Configure the database:
   ```
   Name: sentinel-db
   Database: sentinel
   User: sentinel
   ```
4. Select **Free** tier (or paid if needed)
5. Click **Create Database**

**Important:** Copy the `Internal Database URL` - you'll need it later:
```
postgresql://sentinel:xxx@your-host.render.com/sentinel?schema=public
```

## Step 2: Create Web Service

1. **Go to Dashboard** → **New** → **Web Service**
2. **Connect Repository**
   - Select your GitHub repository
   - Configure build settings:
     ```
     Build Command: npm install && npx prisma generate && npm run build
     Start Command: npm start
     ```
3. **Configure Service**
   ```
   Name: sentinel-auth
   Environment: Node
   Region: Choose closest to your users
   ```

4. **Add Environment Variables**

   Click **Advanced** → **Add Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Render PostgreSQL URL (from Step 1) |
   | `JWT_SECRET` | Generate a strong secret: `openssl rand -base64 32` |
   | `ADMIN_BOOTSTRAP_TOKEN` | Your admin bootstrap token |

   **Optional (for emails):**
   | Variable | Value |
   |----------|-------|
   | `SMTP_HOST` | `smtp.gmail.com` (or your SMTP server) |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | Your email address |
   | `SMTP_PASS` | Your app password or SMTP token |
   | `EMAIL_FROM` | Sender email address |

5. **Click Create Web Service**

## Step 3: Verify Deployment

1. **Check Build Logs**
   - Go to your service → **Logs**
   - Verify successful build: "Build completed"

2. **Health Check**
   ```bash
   curl https://your-service.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Check for Admin Key**
   ```bash
   # In Render Logs, look for:
   ========================================
   🚨 INITIAL ADMIN KEY GENERATED
   SAVE THIS KEY — IT WILL NOT BE SHOWN AGAIN

   ADMIN_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ========================================
   ```

   **IMPORTANT:** Save this admin key immediately!

## Step 4: Create Your First Project

Use the admin key to create your first project:

```bash
ADMIN_KEY=your_admin_key_here

curl -X POST https://your-service.onrender.com/api/admin/projects \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "name": "My First Project",
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "api_key": "xxxxxxxx...",
  "project": { "id": "xxx", "name": "My First Project" },
  "user": { "id": "xxx", "username": "admin", "email": "admin@example.com" }
}
```

## Step 5: Test Authentication Flow

### 1. Login (should fail - email not verified)

```bash
PROJECT_API_KEY=your_project_api_key

curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: $PROJECT_API_KEY" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "statusCode": 400,
  "errorCode": "USER_EMAIL_NOT_VERIFIED",
  "message": "User email is not verified"
}
```

### 2. Get Verification Code (check Render logs)

```bash
curl -X POST https://your-service.onrender.com/api/auth/email-verification/request-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'
```

Response:
```
{"message":"Verification code sent. Check your email."}
```

**Check Render logs for verification code:**
```
[EMAIL] Verification - To: admin@example.com | Code: 12345678
```

### 3. Verify Email

```bash
curl -X POST https://your-service.onrender.com/api/auth/email-verification/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "code": "12345678"
  }'
```

Response:
```
{"message":"Email verified successfully"}
```

### 4. Login (should succeed now)

```bash
curl -X POST https://your-service.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-api-key: $PROJECT_API_KEY" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "expiresIn": 3600
}
```

## Step 6: Configure Custom Domain (Optional)

1. **Go to Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `auth.yourdomain.com`)
4. **Add DNS Records** as instructed by Render

Common DNS configurations:

**A Record (for apex domain):**
```
Type: A
Name: @
Value: Your Render service IP
TTL: 300
```

**CNAME Record (for subdomain):**
```
Type: CNAME
Name: auth
Value: your-service.onrender.com
TTL: 300
```

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `JWT_SECRET` | Secret for signing JWTs | `openssl rand -base64 32` |
| `ADMIN_BOOTSTRAP_TOKEN` | Bootstrap admin token | `your-secure-token` |

### Optional - Email Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS/SSL | `false` |
| `SMTP_USER` | SMTP username | email address |
| `SMTP_PASS` | SMTP password/app token | app password |
| `EMAIL_FROM` | From address in emails | email address |

### Gmail Setup

If using Gmail:

1. Enable 2-Factor Authentication
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password
4. Use that 16-character password in `SMTP_PASS`

## Troubleshooting

### Build Fails

```bash
# Test locally first
docker-compose up -d postgres
npm install
npx prisma generate
npm run build
```

### Database Connection Failed

1. Verify `DATABASE_URL` is correct
2. Check Render PostgreSQL is not suspended
3. Ensure IP allowlisting (Render databases allow connections from anywhere by default)

### Emails Not Sending

1. Check SMTP credentials
2. For Gmail, ensure App Password is used
3. Check Render logs for email errors

### 503 Errors (Service Unavailable)

1. Check service health in Render dashboard
2. Verify environment variables are set
3. Check memory usage (upgrade if needed)

### "User email is not verified"

This is expected behavior - users must verify email before login. Complete the verification flow.

## Useful Commands

### Restart Service

```bash
# Via Render Dashboard or CLI
render-cli service restart sentinel-auth
```

### View Logs

```bash
# Via Render CLI
render-cli service logs sentinel-auth
```

### Get Admin Key (if lost)

**Warning:** This will reset the database and generate a new admin key!

1. Go to Render PostgreSQL → Console
2. Run:
   ```sql
   DELETE FROM admin_keys;
   DELETE FROM refresh_tokens;
   DELETE FROM project_users;
   DELETE FROM users;
   DELETE FROM projects;
   ```
3. Restart the web service
4. New admin key will appear in logs

## Security Checklist

- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Use unique `ADMIN_BOOTSTRAP_TOKEN`
- [ ] Configure SMTP with App Password (not regular password)
- [ ] Enable 2FA on Gmail account
- [ ] Set up custom domain with SSL
- [ ] Monitor usage and upgrade plan if needed
- [ ] Set up alerts for service downtime

## Cost Estimation

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Web Service | 750 hours/month | ~$7/month |
| PostgreSQL | 90 days retention | ~$7/month |
| Custom Domain | Free | Free |

**Total (Free Tier):** ~$0/month (with limits)  
**Total (Paid):** ~$14/month

## Next Steps

1. Integrate with your frontend application
2. Set up monitoring and alerts
3. Configure rate limiting for production
4. Set up CI/CD pipeline
5. Implement webhook notifications

For questions or issues, check the [main README](README.md) or open a GitHub issue.

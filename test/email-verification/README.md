# Email Verification Tests

This directory contains integration tests for the email verification feature.

## Test Files

### test-email-verification.ts
Comprehensive test suite that validates all email verification scenarios without direct database access. Uses API calls to test the feature flow.

**Run:**
```bash
npx ts-node test/email-verification/test-email-verification.ts
```

### test-email-verification-db.ts
Integration tests with direct database access to verify verification codes and email verification status.

**Run:**
```bash
npx ts-node test/email-verification/test-email-verification-db.ts
```

## Test Suites

| Suite | Description | Tests |
|-------|-------------|-------|
| Suite 1 | User Registration Flow | 5 |
| Suite 2 | Email Verification Request Endpoint | 4 |
| Suite 3 | Email Verification Confirm Endpoint | 4 |
| Suite 4 | Login Protection | 3 |
| Suite 5 | Edge Cases & Security | 4 |
| Suite 6 | Bootstrap Users | 1 |
| Suite 7 | Admin-Created Users | 2 |
| E2E | Complete End-to-End Flow | 1 |

## Running Tests with Docker

### Start Services
```bash
docker-compose up -d postgres sentinel-back
```

### Wait for Services
```bash
sleep 15
```

### Run API-only Tests
```bash
docker-compose run --rm test-email-verification
```

### Run Database Integration Tests
```bash
docker-compose run --rm test-email-verification-db
```

## Expected Test Results

### Assertions Validated

| Assertion | Expected Result |
|-----------|----------------|
| User created | email_verified = false in DB |
| Login blocked | errorCode: 'USER_EMAIL_NOT_VERIFIED' |
| Verification succeeds | message: 'Email verified successfully' |
| Login after verify | Returns accessToken/refreshToken |
| Invalid code | errorCode: 'VERIFICATION_CODE_INVALID' |
| Expired code | errorCode: 'VERIFICATION_CODE_EXPIRED' |

## Test Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| TEST_BASE_URL | Base URL for API tests | http://sentinel-back:3000/api |
| ADMIN_KEY | Admin key for creating test projects | (from environment) |
| DATABASE_URL | Database connection string | postgresql://postgres:root@postgres:5432/sentinel |

## Notes

1. **Email Service Mock**: Tests use the mock email service (ConsoleEmailService) when SMTP is not configured. Verification codes are logged to the console.

2. **Database Access**: The `test-email-verification-db.ts` file requires direct database access to verify verification codes are stored correctly.

3. **Timing**: Some tests include small delays to ensure database operations complete.

4. **Cleanup**: Test users are created with unique timestamps to avoid conflicts. In production, consider adding cleanup logic.

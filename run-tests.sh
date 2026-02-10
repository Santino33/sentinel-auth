#!/bin/bash
set -e

echo "Extracting admin key from Docker logs..."
ADMIN_KEY=$(docker logs sentinel-back 2>&1 | grep -o 'ADMIN_KEY=[a-f0-9]*' | head -1 | cut -d= -f2)

if [ -z "$ADMIN_KEY" ]; then
    echo "❌ ERROR: Could not extract admin key from Docker logs"
    echo "Make sure sentinel-back container is running and has generated an admin key"
    exit 1
fi

echo "✅ Admin key found: ${ADMIN_KEY:0:16}..."

echo "Running email verification tests..."
ADMIN_KEY=$ADMIN_KEY npx ts-node --transpile-only test/email-verification/test-email-verification.ts

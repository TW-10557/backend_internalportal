#!/bin/bash

# -----------------------------
# Config - replace with your info
# -----------------------------
EMAIL="n_jayapratha@twave.co.jp"
PASSWORD="Jaya@2004"
MESSAGE="Hello Teams — sent via automated script!"
BASE_URL="http://localhost:4000"

# -----------------------------
# Step 1: Login and get token
# -----------------------------
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
-H "Content-Type: application/json" \
-d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

# Check if token was received
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "Failed to get token. Check credentials."
    exit 1
fi

echo "Token received: $TOKEN"

# -----------------------------
# Step 2: Send message to Teams
# -----------------------------
RESPONSE=$(curl -s -X POST "$BASE_URL/api/teams/send" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d "{\"message\": \"$MESSAGE\"}")

echo "Teams API Response:"
echo "$RESPONSE"

#!/bin/bash

# This script reads variables from .env.local and adds them to the
# Vercel production environment. It automatically skips comments and empty lines.

# --- Configuration ---
# Set the Vercel environment(s) to sync to.
# Can be "production", "preview", "development", or a combination.
# Example: "production preview"
VERCEL_ENVIRONMENTS="production"

# --- Script Logic ---
set -e # Exit immediately if a command exits with a non-zero status.

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found in the current directory."
    exit 1
fi

echo "🔗 Reading variables from .env.local..."

# Read each line, filter out comments/empty lines, and process it
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
        continue
    fi

    # Split line into KEY and VALUE
    KEY=$(echo "$line" | cut -d '=' -f 1)
    # Get everything after the first '='
    VALUE=$(echo "$line" | cut -d '=' -f 2-)

    # Remove surrounding quotes from the value, if they exist
    if [[ "$VALUE" =~ ^"(.*)"$ ]]; then
        VALUE="${BASH_REMATCH[1]}"
    fi

    echo "🔒 Syncing '$KEY' to Vercel for environment(s): $VERCEL_ENVIRONMENTS"
    # Use the --yes flag to skip interactive prompts for each variable
    vercel env add "$KEY" "$VALUE" $VERCEL_ENVIRONMENTS --yes
done < .env.local

echo "✅ All environment variables have been successfully synced to Vercel."

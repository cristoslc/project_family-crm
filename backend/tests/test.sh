#!/bin/bash

# Convenience script to run Family CRM API tests
# Usage: ./tests/test.sh [API_BASE] [API_KEY]

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
API_BASE="${API_BASE:-http://localhost:3001/api}"
API_KEY="${API_KEY:-change-me-in-production}"

# Allow override via command line args
if [ -n "$1" ]; then
  API_BASE="$1"
fi

if [ -n "$2" ]; then
  API_KEY="$2"
fi

echo "Running tests with:"
echo "  API_BASE: $API_BASE"
echo "  API_KEY: ${API_KEY:0:10}..."
echo ""

cd "$BACKEND_DIR"
API_BASE="$API_BASE" API_KEY="$API_KEY" npm test


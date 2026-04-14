#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found."
  exit 1
fi

echo "🚀 Starting OpenCode Agent Server (without Telegram Bot)..."
echo "🤖 Server running at localhost:$OPENCODE_PORT"

# Run opencode-ai serve in the foreground to see logs
npx opencode-ai serve --port "$OPENCODE_PORT"

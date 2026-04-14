#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found."
  exit 1
fi

echo "🚀 Starting Personal Assistant..."

# 1. Start OpenCode serve in the background
echo "🤖 Starting OpenCode Agent Server (localhost:$OPENCODE_PORT)..."
# We use npx to run it. opencode.json in the current dir configures the MCP server.
npx opencode-ai serve --port "$OPENCODE_PORT" > opencode-server.log 2>&1 &
OPENCODE_PID=$!

# 2. Start Telegram Bot
echo "🤖 Starting Telegram Bot..."
cd telegram-bot
npm start

# Cleanup background processes on exit
trap "kill $OPENCODE_PID" EXIT

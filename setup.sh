#!/bin/bash

# Load environment variables if .env exists
if [ -f .env ]; then
  source .env
else
  echo "Error: .env file not found. Please create it from .env.example"
  exit 1
fi

VAULT_PATH_EXPANDED="${VAULT_PATH/#\~/$HOME}"

echo "🔧 Setting up Obsidian Vault at: $VAULT_PATH_EXPANDED"

# 1. Create vault directory if it doesn't exist
mkdir -p "$VAULT_PATH_EXPANDED/Daily"
mkdir -p "$VAULT_PATH_EXPANDED/Inbox"

# 2. Initialize Git in vault
if [ ! -d "$VAULT_PATH_EXPANDED/.git" ]; then
  echo "📦 Initializing Git in vault..."
  cd "$VAULT_PATH_EXPANDED"
  git init
  # Create a dummy file if vault is empty to have a head
  if [ -z "$(ls -A "$VAULT_PATH_EXPANDED" | grep -v .git)" ]; then
    echo "# Inbox" > Inbox/README.md
    git add .
    git commit -m "Initial vault structure"
  fi
  
  if [ ! -z "$GH_REMOTE" ]; then
    echo "🔗 Adding GitHub remote: $GH_REMOTE"
    git remote add origin "$GH_REMOTE"
  fi
else
  echo "✅ Git already initialized in vault."
fi

# 3. Install project dependencies
echo "📦 Installing MCP server dependencies..."
cd /home/dev-frontend/sideprojects/agent-assistent/mcp-server
npm install
npm run build

echo "📦 Installing Telegram bot dependencies..."
cd /home/dev-frontend/sideprojects/agent-assistent/telegram-bot
npm install
npm run build

echo "🏗️  Setup complete!"
echo "🚀 Run ./start.sh to start the assistant."

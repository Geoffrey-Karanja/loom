#!/bin/bash

echo "⌬ Starting Loom..."

# Check Ollama
if ! command -v ollama &> /dev/null; then
  echo "⚠ Ollama not found. Install from https://ollama.com"
  echo "  Then run: ollama pull llama3.2:1b"
else
  # Start Ollama if not running
  if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Starting Ollama..."
    ollama serve &
    sleep 2
  else
    echo "✓ Ollama running"
  fi
fi

# Start API
echo "Starting API..."
cd "$(dirname "$0")/../apps/api"
node src/index.js &
API_PID=$!

sleep 1

# Start frontend
echo "Starting frontend..."
cd "$(dirname "$0")/../apps/web"
npm run dev &
WEB_PID=$!

echo ""
echo "✅ Loom is running"
echo "   Frontend: http://localhost:3000"
echo "   API:      http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop"

# Wait and cleanup
trap "kill $API_PID $WEB_PID 2>/dev/null; echo 'Loom stopped.'" EXIT
wait

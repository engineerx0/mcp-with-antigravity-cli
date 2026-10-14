#!/usr/bin/env bash
set -e

PORT=6274
ORIGINS="http://localhost:${PORT},http://127.0.0.1:${PORT}"
if [ -n "$CODESPACE_NAME" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  ORIGINS="${ORIGINS},https://${CODESPACE_NAME}-${PORT}.${DOMAIN},https://${CODESPACE_NAME}.${DOMAIN}"
fi

export ALLOWED_ORIGINS="$ORIGINS"
export DANGEROUSLY_OMIT_AUTH="true"
export CLIENT_PORT="$PORT"

echo "Starting MCP Inspector with allowed origins:"
echo "$ALLOWED_ORIGINS"
echo ""

cd /workspaces/mcp-with-claude-code/hello-mcp
exec npx @modelcontextprotocol/inspector node dist/index.js

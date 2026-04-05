#!/bin/bash
set -e

echo "==> Running DB migrations..."
wasp db migrate-dev --name init

echo "==> Starting Wasp app..."
exec wasp start --host 0.0.0.0 --port "${PORT}"

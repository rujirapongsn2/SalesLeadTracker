#!/bin/sh
set -euo pipefail

# Resolve database file path from environment or use default
DB_FILE="${DATABASE_FILE:-/app/data/sqlite.db}"
# Directory containing SQL seed scripts
INIT_DIR="/docker-entrypoint-initdb.d"
# Path expected by application (hard-coded)
APP_DB_PATH="/app/sqlite.db"

main() {
  echo "[Entrypoint] Database file: $DB_FILE"
  echo "[Entrypoint] Init directory: $INIT_DIR"

  # Ensure the database directory exists
  mkdir -p "$(dirname "$DB_FILE")"

  # Run schema migration if database is missing or empty
  if [ ! -s "$DB_FILE" ]; then
    echo "[Entrypoint] No database found or file is empty. Running schema migration..."
    if ! command -v npm >/dev/null 2>&1; then
      echo "[Entrypoint][Error] npm CLI not available. Cannot migrate schema." >&2
      exit 1
    fi
    npm run db:push
    echo "[Entrypoint] Schema migration completed."
  else
    echo "[Entrypoint] Existing database detected. Skipping schema migration."
  fi

  # Seed database if initialization directory exists
  if [ -d "$INIT_DIR" ]; then
    echo "[Entrypoint] Seeding database from $INIT_DIR"
    for script in "$INIT_DIR"/*.sql; do
      [ -f "$script" ] || continue
      echo "[Entrypoint] Applying seed script: $(basename "$script")"
      if ! sqlite3 "$DB_FILE" < "$script"; then
        echo "[Entrypoint][Warning] Failed to apply $(basename "$script")." >&2
      fi
    done
  else
    echo "[Entrypoint] Init directory not found. Skipping seeding."
  fi

  # Ensure application sees database at expected path
  # Remove any existing file or symlink at /app/sqlite.db
  rm -f "$APP_DB_PATH"
  # Create a symbolic link from APP_DB_PATH to actual DB_FILE
  ln -sf "$DB_FILE" "$APP_DB_PATH"
  echo "[Entrypoint] Linked $APP_DB_PATH -> $DB_FILE"

  # Execute the provided command
  echo "[Entrypoint] Starting application: $*"
  exec "$@"
}

main "$@"

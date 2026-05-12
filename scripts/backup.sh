#!/bin/bash
# scripts/backup.sh
# PostgreSQL backup script for BazarX
# Usage: ./backup.sh [days-to-retain]

set -e

RETENTION_DAYS=${1:-7}
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="bazarx_backup_${DATE}.sql.gz"

echo "[$(date)] Starting PostgreSQL backup..."

# PostgreSQL connection params from env
PGHOST="${POSTGRES_HOST:-postgres}"
PGPORT="${POSTGRES_PORT:-5432}"
PGUSER="${POSTGRES_USER:-bazarx}"
PGDATABASE="${POSTGRES_DB:-bazarx}"

# Create backup
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_DIR}/${FILENAME}"

# Remove old backups
find "$BACKUP_DIR" -name "bazarx_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup completed: ${FILENAME}"
echo "[$(date)] $(ls -lh ${BACKUP_DIR}/${FILENAME} | awk '{print $5}')"
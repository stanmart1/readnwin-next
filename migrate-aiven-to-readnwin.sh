#!/bin/bash

# Database Migration Script: Aiven Cloud defaultdb -> readnwin_readnwindb
# Using pg_dump streaming for direct transfer

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Source database (Aiven Cloud defaultdb)
SOURCE_HOST="readnwin-nextjs-book-nextjs.b.aivencloud.com"
SOURCE_PORT="28428"
SOURCE_DB="defaultdb"
SOURCE_USER="avnadmin"
SOURCE_PASSWORD="AVNS_Xv38UAMF77xN--vUfeX"

# Target database (readnwin_readnwindb)
TARGET_HOST="149.102.159.118"
TARGET_PORT="5432"
TARGET_DB="readnwin_readnwindb"
TARGET_USER="readnwin_readnwinuser"
TARGET_PASSWORD="izIoqVwU97i9niQPN3vj"

print_status "Starting database migration from Aiven Cloud to readnwin_readnwindb"
echo ""

# Test source database connection
print_status "Testing source database connection (Aiven Cloud)..."
if PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Source database connection successful"
else
    print_error "Failed to connect to source database"
    exit 1
fi

# Test target database connection
print_status "Testing target database connection (readnwin_readnwindb)..."
if PGPASSWORD="$TARGET_PASSWORD" psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Target database connection successful"
else
    print_error "Failed to connect to target database"
    exit 1
fi

# Check if target database is empty
print_status "Checking if target database is empty..."
TABLE_COUNT=$(PGPASSWORD="$TARGET_PASSWORD" psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
if [ "$TABLE_COUNT" -eq 0 ]; then
    print_success "Target database is empty, safe to proceed"
else
    print_warning "Target database contains $TABLE_COUNT tables"
    read -p "Do you want to continue? This will overwrite existing data. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Migration cancelled by user"
        exit 0
    fi
fi

# Get source database size
print_status "Getting source database size..."
SOURCE_SIZE=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT pg_size_pretty(pg_database_size('$SOURCE_DB'));" | tr -d ' ')
print_status "Source database size: $SOURCE_SIZE"

# Get table count from source
print_status "Getting table count from source..."
SOURCE_TABLE_COUNT=$(PGPASSWORD="$SOURCE_PASSWORD" psql -h "$SOURCE_HOST" -p "$SOURCE_PORT" -U "$SOURCE_USER" -d "$SOURCE_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
print_status "Source database contains $SOURCE_TABLE_COUNT tables"

echo ""
print_status "Starting migration using pg_dump streaming..."
print_status "This may take some time depending on the database size..."
echo ""

# Set environment variables for both databases
export PGPASSWORD_SOURCE="$SOURCE_PASSWORD"
export PGPASSWORD_TARGET="$TARGET_PASSWORD"

# Perform the migration using pg_dump streaming
# Note: We need to handle SSL for source and non-SSL for target
print_status "Executing: pg_dump (source) | psql (target)"

# Create a temporary script to handle the streaming
cat > /tmp/migration_script.sh << 'EOF'
#!/bin/bash

# Source database with SSL
SOURCE_HOST="readnwin-nextjs-book-nextjs.b.aivencloud.com"
SOURCE_PORT="28428"
SOURCE_DB="defaultdb"
SOURCE_USER="avnadmin"
SOURCE_PASSWORD="AVNS_Xv38UAMF77xN--vUfeX"

# Target database without SSL
TARGET_HOST="149.102.159.118"
TARGET_PORT="5432"
TARGET_DB="readnwin_readnwindb"
TARGET_USER="readnwin_readnwinuser"
TARGET_PASSWORD="izIoqVwU97i9niQPN3vj"

# Set passwords
export PGPASSWORD="$SOURCE_PASSWORD"
export PGPASSWORD_TARGET="$TARGET_PASSWORD"

# Execute pg_dump streaming with proper SSL handling
PGSSLMODE="require" PGPASSWORD="$SOURCE_PASSWORD" pg_dump \
  -h "$SOURCE_HOST" \
  -p "$SOURCE_PORT" \
  -U "$SOURCE_USER" \
  -d "$SOURCE_DB" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --verbose \
  --no-sync \
  | PGSSLMODE="disable" PGPASSWORD="$TARGET_PASSWORD" psql \
  -h "$TARGET_HOST" \
  -p "$TARGET_PORT" \
  -U "$TARGET_USER" \
  -d "$TARGET_DB" \
  --set ON_ERROR_STOP=on \
  --echo-all
EOF

chmod +x /tmp/migration_script.sh

# Execute the migration
if /tmp/migration_script.sh; then
    print_success "Migration completed successfully!"
else
    print_error "Migration failed!"
    rm -f /tmp/migration_script.sh
    exit 1
fi

# Clean up
rm -f /tmp/migration_script.sh

# Verify migration
echo ""
print_status "Verifying migration..."

# Check target database table count
TARGET_TABLE_COUNT=$(PGPASSWORD="$TARGET_PASSWORD" psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
print_status "Target database now contains $TARGET_TABLE_COUNT tables"

# Check target database size
TARGET_SIZE=$(PGPASSWORD="$TARGET_PASSWORD" psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -t -c "SELECT pg_size_pretty(pg_database_size('$TARGET_DB'));" | tr -d ' ')
print_status "Target database size: $TARGET_SIZE"

# List some key tables
print_status "Key tables in target database:"
PGPASSWORD="$TARGET_PASSWORD" psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'books', 'orders', 'payment_proofs', 'system_settings')
ORDER BY table_name;
" | grep -E '^[[:space:]]*[a-zA-Z_][a-zA-Z0-9_]*[[:space:]]*$' | head -10

echo ""
print_success "Database migration from Aiven Cloud to readnwin_readnwindb completed successfully!"
print_status "Source: $SOURCE_HOST:$SOURCE_PORT/$SOURCE_DB"
print_status "Target: $TARGET_HOST:$TARGET_PORT/$TARGET_DB"
print_status "Tables migrated: $TARGET_TABLE_COUNT" 
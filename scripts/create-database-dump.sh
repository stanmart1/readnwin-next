#!/bin/bash

# Database Migration Dump Script
# This script creates a complete database dump for migration to another database

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_DIR="database-dumps"
SCHEMA_DUMP="$DUMP_DIR/schema_$TIMESTAMP.sql"
DATA_DUMP="$DUMP_DIR/data_$TIMESTAMP.sql"
FULL_DUMP="$DUMP_DIR/full_dump_$TIMESTAMP.sql"
MIGRATION_SCRIPT="$DUMP_DIR/migration_$TIMESTAMP.sql"

# Database configuration from environment variables
DB_HOST="${DB_HOST:-149.102.159.118}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b}"
DB_PORT="${DB_PORT:-5432}"

print_step "Starting database migration dump process..."

# Create dump directory
print_step "Creating dump directory..."
mkdir -p "$DUMP_DIR"
print_success "Dump directory created: $DUMP_DIR"

# Test database connection
print_step "Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Failed to connect to database. Please check your environment variables."
    exit 1
fi
print_success "Database connection successful"

# Get list of all tables
print_step "Getting list of tables..."
TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;")

if [ -z "$TABLES" ]; then
    print_warning "No tables found in the database"
    exit 0
fi

print_success "Found tables: $(echo "$TABLES" | wc -l | tr -d ' ')"

# Create schema dump (structure only)
print_step "Creating schema dump..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema-only \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --create \
    --verbose \
    > "$SCHEMA_DUMP" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Schema dump created: $SCHEMA_DUMP"
else
    print_error "Failed to create schema dump"
    exit 1
fi

# Create data dump (data only)
print_step "Creating data dump..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --data-only \
    --disable-triggers \
    --verbose \
    > "$DATA_DUMP" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Data dump created: $DATA_DUMP"
else
    print_error "Failed to create data dump"
    exit 1
fi

# Create full dump (schema + data)
print_step "Creating full database dump..."
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --create \
    --verbose \
    > "$FULL_DUMP" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Full dump created: $FULL_DUMP"
else
    print_error "Failed to create full dump"
    exit 1
fi

# Create migration script with instructions
print_step "Creating migration script..."
cat > "$MIGRATION_SCRIPT" << EOF
-- Database Migration Script
-- Generated on: $(date)
-- Source Database: $DB_NAME
-- Target Database: [YOUR_TARGET_DATABASE_NAME]

-- =====================================================
-- MIGRATION INSTRUCTIONS
-- =====================================================

-- 1. Create the target database:
--    CREATE DATABASE your_target_database_name;

-- 2. Run this migration script on the target database:
--    psql -h your_target_host -p your_target_port -U your_target_user -d your_target_database -f $MIGRATION_SCRIPT

-- 3. Or run the full dump directly:
--    psql -h your_target_host -p your_target_port -U your_target_user -d your_target_database -f $FULL_DUMP

-- =====================================================
-- DATABASE CONFIGURATION
-- =====================================================

-- Update your .env file with the new database credentials:
-- DB_HOST=your_new_host
-- DB_NAME=your_new_database_name
-- DB_USER=your_new_username
-- DB_PASSWORD=your_new_password
-- DB_PORT=your_new_port

-- =====================================================
-- PRE-MIGRATION CHECKS
-- =====================================================

-- Check if target database exists
SELECT 'Target database check' as status;

-- =====================================================
-- SCHEMA MIGRATION
-- =====================================================

-- The schema will be created by the full dump
-- This includes all tables, indexes, constraints, and sequences

-- =====================================================
-- DATA MIGRATION
-- =====================================================

-- All data will be migrated by the full dump
-- This includes all records from all tables

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Verify tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify data was migrated (example for users table)
-- SELECT COUNT(*) as user_count FROM users;

-- Verify sequences are working
-- SELECT nextval('users_id_seq');

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================

-- If you need to reset sequences after migration:
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

EOF

print_success "Migration script created: $MIGRATION_SCRIPT"

# Create a summary report
print_step "Creating migration summary..."
cat > "$DUMP_DIR/migration_summary_$TIMESTAMP.txt" << EOF
Database Migration Summary
==========================

Generated on: $(date)
Source Database: $DB_NAME
Source Host: $DB_HOST:$DB_PORT

Files Created:
==============

1. Schema Dump: $SCHEMA_DUMP
   - Contains only database structure (tables, indexes, constraints)
   - Use this if you only need to recreate the schema

2. Data Dump: $DATA_DUMP
   - Contains only data (INSERT statements)
   - Use this if you only need to migrate data to existing schema

3. Full Dump: $FULL_DUMP
   - Contains both schema and data
   - Recommended for complete database migration

4. Migration Script: $MIGRATION_SCRIPT
   - Contains instructions and verification queries
   - Use this as a guide for the migration process

Migration Steps:
================

1. Create target database on new server
2. Update your .env file with new database credentials
3. Run the full dump on the target database:
   psql -h [target_host] -p [target_port] -U [target_user] -d [target_database] -f $FULL_DUMP

4. Verify migration by running queries from the migration script

Important Notes:
================

- Make sure to backup your target database before migration
- Test the migration on a staging environment first
- Update all application configuration files with new database credentials
- Verify all application functionality after migration

EOF

print_success "Migration summary created: $DUMP_DIR/migration_summary_$TIMESTAMP.txt"

# Display file sizes
print_step "Dump file sizes:"
ls -lh "$DUMP_DIR"/*"$TIMESTAMP"*

print_success "Database migration dump completed successfully!"
echo ""
print_step "Next steps:"
echo "1. Copy the dump files to your target server"
echo "2. Update your .env file with new database credentials"
echo "3. Run the migration on your target database"
echo "4. Test your application with the new database"
echo ""
echo "Files created in: $DUMP_DIR/" 
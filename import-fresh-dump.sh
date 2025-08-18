#!/bin/bash

# Import Fresh PostgreSQL 17 Dump Script
# This script helps import the fresh dump to a PostgreSQL 17 database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

# Default values
DUMP_FILE="readnwin_fresh_dump_postgres17_2025-08-13T01-49-54.sql"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="readnwin_production"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            DUMP_FILE="$2"
            shift 2
            ;;
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -U|--user)
            DB_USER="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --file FILE       Dump file to import (default: $DUMP_FILE)"
            echo "  -h, --host HOST       Database host (default: $DB_HOST)"
            echo "  -p, --port PORT       Database port (default: $DB_PORT)"
            echo "  -U, --user USER       Database user (default: $DB_USER)"
            echo "  -d, --database DB     Database name (default: $DB_NAME)"
            echo "  --help                Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Import with defaults"
            echo "  $0 -d my_database                     # Import to specific database"
            echo "  $0 -h db.example.com -U dbuser -d mydb # Import to remote database"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_header "PostgreSQL 17 Fresh Dump Import Script"
echo "================================================"

# Check if dump file exists
if [ ! -f "$DUMP_FILE" ]; then
    print_error "Dump file not found: $DUMP_FILE"
    print_warning "Available dump files:"
    ls -la readnwin_fresh_dump_postgres17_*.sql 2>/dev/null || echo "No dump files found"
    exit 1
fi

print_success "Found dump file: $DUMP_FILE"
print_status "File size: $(du -h "$DUMP_FILE" | cut -f1)"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

print_success "PostgreSQL client tools found: $(psql --version)"

# Prompt for password
print_status "Please enter the database password for user '$DB_USER':"
read -s PGPASSWORD
export PGPASSWORD

print_header "Starting Import Process"
echo "=============================="

print_status "Target Database: $DB_NAME"
print_status "Host: $DB_HOST:$DB_PORT"
print_status "User: $DB_USER"

# Test connection
print_status "Testing database connection..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
    print_warning "Please check your database credentials and try again"
    exit 1
fi

# Check if database exists
print_status "Checking if database '$DB_NAME' exists..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping existing database..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
        print_success "Database dropped"
    else
        print_warning "Import cancelled"
        exit 0
    fi
fi

# Create database if it doesn't exist
print_status "Creating database '$DB_NAME'..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"
print_success "Database created"

# Import the dump
print_header "Importing Database Dump"
echo "=============================="
print_status "This may take several minutes depending on the dump size..."

start_time=$(date +%s)

if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$DUMP_FILE"; then
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Import completed successfully!"
    print_status "Import duration: ${duration} seconds"
    
    # Verify import
    print_header "Verifying Import"
    echo "==================="
    
    table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    print_success "Tables imported: $table_count"
    
    # Show some key tables
    print_status "Key tables imported:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT table_name, 
           (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns,
           (SELECT COUNT(*) FROM \"\".table_name\"\") as rows
    FROM information_schema.tables t 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'books', 'orders', 'categories', 'system_settings')
    ORDER BY table_name;
    " | while read -r line; do
        if [ ! -z "$line" ]; then
            echo "  $line"
        fi
    done
    
    print_header "Import Summary"
    echo "=================="
    print_success "✅ Database '$DB_NAME' imported successfully"
    print_status "📊 Total tables: $table_count"
    print_status "📁 Dump file: $DUMP_FILE"
    print_status "⏱️  Duration: ${duration} seconds"
    print_status "🎯 Target: $DB_HOST:$DB_PORT"
    
    print_header "Next Steps"
    echo "============="
    print_status "1. Update your application's database connection settings"
    print_status "2. Test the application with the new database"
    print_status "3. Verify all functionality works as expected"
    print_status "4. Update your .env.local file with new database credentials if needed"
    
else
    print_error "Import failed!"
    print_warning "Check the error messages above and try again"
    exit 1
fi

# Clean up
unset PGPASSWORD

print_success "Import process completed!" 
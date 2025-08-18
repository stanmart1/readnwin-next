#!/bin/bash

# =====================================================
# READNWIN DATABASE IMPORT SCRIPT
# =====================================================
# 
# This script helps import the dump.sql file to a new PostgreSQL database
#
# Usage: ./import-dump.sh [options]
#
# Options:
#   -h, --host HOST       Database host (default: localhost)
#   -p, --port PORT       Database port (default: 5432)
#   -U, --user USER       Database user (default: postgres)
#   -d, --database DB     Database name (required)
#   -f, --file FILE       Dump file (default: dump.sql)
#   --help                Show this help message
#
# Example:
#   ./import-dump.sh -h mydb.example.com -p 5432 -U myuser -d mydatabase
# =====================================================

# Default values
HOST="localhost"
PORT="5432"
USER="postgres"
DATABASE=""
DUMP_FILE="dump.sql"

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

# Function to show help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --host HOST       Database host (default: localhost)"
    echo "  -p, --port PORT       Database port (default: 5432)"
    echo "  -U, --user USER       Database user (default: postgres)"
    echo "  -d, --database DB     Database name (required)"
    echo "  -f, --file FILE       Dump file (default: dump.sql)"
    echo "  --help                Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -h mydb.example.com -p 5432 -U myuser -d mydatabase"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -U|--user)
            USER="$2"
            shift 2
            ;;
        -d|--database)
            DATABASE="$2"
            shift 2
            ;;
        -f|--file)
            DUMP_FILE="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if database name is provided
if [[ -z "$DATABASE" ]]; then
    print_error "Database name is required. Use -d or --database option."
    show_help
    exit 1
fi

# Check if dump file exists
if [[ ! -f "$DUMP_FILE" ]]; then
    print_error "Dump file '$DUMP_FILE' not found!"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

print_status "Starting database import process..."
print_status "Host: $HOST"
print_status "Port: $PORT"
print_status "User: $USER"
print_status "Database: $DATABASE"
print_status "Dump file: $DUMP_FILE"

# Test database connection
print_status "Testing database connection..."
if ! PGPASSWORD="$PGPASSWORD" psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -c "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to database. Please check your credentials and connection."
    print_warning "Make sure to set PGPASSWORD environment variable or use .pgpass file."
    exit 1
fi

print_success "Database connection successful!"

# Confirm before proceeding
echo ""
print_warning "This will import the dump file into database '$DATABASE'."
print_warning "This operation may overwrite existing data."
read -p "Do you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Import cancelled."
    exit 0
fi

# Import the dump
print_status "Importing database dump..."
if PGPASSWORD="$PGPASSWORD" psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DATABASE" -f "$DUMP_FILE"; then
    print_success "Database import completed successfully!"
    print_status "You can now update your application's database connection settings."
else
    print_error "Database import failed!"
    exit 1
fi

print_status "Import process completed." 
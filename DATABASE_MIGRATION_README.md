# Database Migration Guide

This guide explains how to migrate the ReadNWin database to a new PostgreSQL server using the provided `dump.sql` file.

## Files Included

- `dump.sql` - Complete database dump (schema + data)
- `import-dump.sh` - Automated import script
- `DATABASE_MIGRATION_README.md` - This guide

## Database Information

- **Original Database**: `defaultdb`
- **Original Host**: `readnwin-nextjs-book-nextjs.b.aivencloud.com:28428`
- **Total Tables**: 97
- **Dump Size**: ~1.1MB
- **PostgreSQL Version**: 17.5

## Prerequisites

1. **PostgreSQL Server**: Ensure you have access to a PostgreSQL server (version 12 or higher recommended)
2. **psql Client**: Install PostgreSQL client tools
3. **Database Credentials**: Have the new database connection details ready

## Method 1: Using the Import Script (Recommended)

The `import-dump.sh` script provides an automated way to import the database dump.

### Usage

```bash
# Basic usage (localhost)
./import-dump.sh -d your_database_name

# With custom connection details
./import-dump.sh -h your_host -p 5432 -U your_username -d your_database

# Show help
./import-dump.sh --help
```

### Example

```bash
# Set your database password
export PGPASSWORD="your_password"

# Import to local database
./import-dump.sh -d readnwin_production

# Import to remote database
./import-dump.sh -h db.example.com -p 5432 -U dbuser -d readnwin_production
```

## Method 2: Manual Import

If you prefer to import manually or the script doesn't work for your environment:

### Step 1: Create the Database

```sql
CREATE DATABASE your_database_name;
```

### Step 2: Import the Dump

```bash
# Set password environment variable
export PGPASSWORD="your_password"

# Import using psql
psql -h your_host -p your_port -U your_username -d your_database -f dump.sql
```

### Alternative: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on your database
4. Select "Restore..."
5. Choose the `dump.sql` file
6. Click "Restore"

## Method 3: Using Docker (if applicable)

If you're using Docker for PostgreSQL:

```bash
# Create a PostgreSQL container
docker run --name postgres-readnwin -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=readnwin -p 5432:5432 -d postgres:15

# Import the dump
docker exec -i postgres-readnwin psql -U postgres -d readnwin < dump.sql
```

## Post-Import Steps

### 1. Update Application Configuration

Update your application's database connection settings in `.env.local`:

```env
DB_HOST=your_new_host
DB_PORT=your_new_port
DB_USER=your_new_user
DB_PASSWORD=your_new_password
DB_NAME=your_new_database
```

### 2. Test the Connection

Run a simple test to ensure the database is working:

```bash
# Test connection
psql -h your_host -p your_port -U your_username -d your_database -c "SELECT COUNT(*) FROM users;"
```

### 3. Verify Data Integrity

Check that key tables have data:

```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check books count
SELECT COUNT(*) FROM books;

-- Check orders count
SELECT COUNT(*) FROM orders;
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your database user has CREATE, INSERT, and SELECT permissions
2. **Connection Refused**: Check if the PostgreSQL server is running and accessible
3. **Version Mismatch**: The dump was created from PostgreSQL 17.5, but should work with version 12+
4. **SSL Issues**: If using SSL, ensure your connection string includes SSL parameters

### Error: "relation already exists"

This is normal - the dump includes `DROP TABLE IF EXISTS` statements. The import will recreate all tables.

### Error: "sequence already exists"

This is also normal - sequences will be recreated during import.

## Security Considerations

1. **Secure the dump file**: The dump contains sensitive data including user information
2. **Use strong passwords**: Ensure your new database has a strong password
3. **Limit access**: Only grant necessary permissions to database users
4. **Encrypt connections**: Use SSL/TLS for database connections in production

## Backup Recommendations

Before importing to production:

1. **Test in development**: Always test the import in a development environment first
2. **Backup existing data**: If importing to an existing database, backup current data
3. **Verify application**: Test your application thoroughly after the migration

## Support

If you encounter issues during migration:

1. Check the PostgreSQL logs for detailed error messages
2. Verify your database connection settings
3. Ensure you have sufficient permissions on the target database
4. Test with a smaller subset of data first

## File Structure

```
├── dump.sql                    # Complete database dump
├── import-dump.sh             # Automated import script
├── DATABASE_MIGRATION_README.md # This guide
└── database-dumps/            # Additional dump files (if any)
```

---

**Note**: This migration preserves all data, including user accounts, orders, books, and system settings. Make sure to update your application's database connection settings after the migration. 
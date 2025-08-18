# Database Migration Scripts

This directory contains scripts to create database dumps for migration to another database server.

## Available Scripts

### 1. Bash Script (Recommended)
- **File**: `create-database-dump.sh`
- **Usage**: `./scripts/create-database-dump.sh`
- **Requirements**: PostgreSQL client tools (`psql`, `pg_dump`)

### 2. Node.js Script
- **File**: `create-database-dump.js`
- **Usage**: `node scripts/create-database-dump.js`
- **Requirements**: Node.js and `pg` package

## Prerequisites

### For Bash Script
1. Install PostgreSQL client tools:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # CentOS/RHEL
   sudo yum install postgresql
   ```

2. Make the script executable:
   ```bash
   chmod +x scripts/create-database-dump.sh
   ```

### For Node.js Script
1. Ensure you have the required dependencies:
   ```bash
   npm install pg
   ```

## Configuration

Both scripts use the same database configuration from your environment variables:

```bash
DB_HOST=readnwin-nextjs-book-nextjs.b.aivencloud.com
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_Xv38UAMF77xN--vUfeX
DB_PORT=28428
DB_CA_CERT=your_ca_certificate
```

## Running the Scripts

### Option 1: Bash Script
```bash
# From project root
./scripts/create-database-dump.sh
```

### Option 2: Node.js Script
```bash
# From project root
node scripts/create-database-dump.js
```

## Output Files

The scripts will create a `database-dumps/` directory with the following files:

1. **Schema Dump** (`schema_YYYYMMDD_HHMMSS.sql`)
   - Contains only database structure (tables, indexes, constraints)
   - Use this if you only need to recreate the schema

2. **Data Dump** (`data_YYYYMMDD_HHMMSS.sql`)
   - Contains only data (INSERT statements)
   - Use this if you only need to migrate data to existing schema

3. **Full Dump** (`full_dump_YYYYMMDD_HHMMSS.sql`)
   - Contains both schema and data
   - **Recommended for complete database migration**

4. **Migration Script** (`migration_YYYYMMDD_HHMMSS.sql`)
   - Contains instructions and verification queries
   - Use this as a guide for the migration process

5. **Summary Report** (`migration_summary_YYYYMMDD_HHMMSS.txt`)
   - Contains detailed information about the migration process

## Migration Process

### Step 1: Create Dump
Run one of the scripts to create the database dump.

### Step 2: Prepare Target Database
1. Create the target database on your new server
2. Ensure PostgreSQL client tools are installed on the target server

### Step 3: Restore Database
```bash
# On the target server
psql -h [target_host] -p [target_port] -U [target_user] -d [target_database] -f full_dump_YYYYMMDD_HHMMSS.sql
```

### Step 4: Update Configuration
Update your `.env` file with the new database credentials:

```bash
DB_HOST=your_new_host
DB_NAME=your_new_database_name
DB_USER=your_new_username
DB_PASSWORD=your_new_password
DB_PORT=your_new_port
```

### Step 5: Verify Migration
Run the verification queries from the migration script to ensure everything was migrated correctly.

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your environment variables
   - Verify network connectivity to the database server
   - Ensure SSL certificates are properly configured

2. **Permission Denied**
   - Make sure the script is executable: `chmod +x scripts/create-database-dump.sh`
   - Check file permissions on the output directory

3. **pg_dump Not Found**
   - Install PostgreSQL client tools
   - Ensure `pg_dump` is in your PATH

4. **SSL Certificate Issues**
   - Verify your `DB_CA_CERT` environment variable is set correctly
   - Check that the certificate file exists and is readable

### Error Messages

- **"Failed to connect to database"**: Check your database credentials and network connectivity
- **"No tables found"**: The database might be empty or you might not have the correct permissions
- **"Failed to create dump"**: Check disk space and file permissions

## Security Notes

- Database dumps contain sensitive information
- Store dump files securely
- Delete dump files after successful migration
- Use secure file transfer methods when copying dumps between servers

## Support

If you encounter issues:

1. Check the error messages in the console output
2. Verify your database configuration
3. Ensure all prerequisites are met
4. Test with a small subset of data first

## Example Usage

```bash
# 1. Create the dump
./scripts/create-database-dump.sh

# 2. Copy files to target server
scp database-dumps/full_dump_20241201_143022.sql user@target-server:/tmp/

# 3. Restore on target server
ssh user@target-server
psql -h localhost -p 5432 -U postgres -d new_database -f /tmp/full_dump_20241201_143022.sql

# 4. Update application configuration
# Edit .env file with new database credentials

# 5. Test the application
npm run dev
``` 
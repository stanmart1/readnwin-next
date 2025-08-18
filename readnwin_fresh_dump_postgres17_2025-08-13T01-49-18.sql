-- PostgreSQL 17 Compatible Database Dump
-- Generated: 2025-08-13T01:49:19.133Z
-- Database: readnwin_readnwindb
-- Server: 149.102.159.118:5432
-- PostgreSQL Version: 17.5
-- Compatibility: PostgreSQL 17+

-- Disable foreign key checks during import
SET session_replication_role = replica;

-- Drop database if exists (for fresh import)
DROP DATABASE IF EXISTS "readnwin_readnwindb";

-- Create database
CREATE DATABASE "readnwin_readnwindb";

-- Connect to the database
\c "readnwin_readnwindb";

-- Enable foreign key checks
SET session_replication_role = DEFAULT;

-- Reset sequences to their current values

-- Enable foreign key checks
SET session_replication_role = DEFAULT;

-- Analyze tables for optimal performance

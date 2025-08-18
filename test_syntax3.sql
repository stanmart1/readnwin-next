-- PostgreSQL 17 Compatible Database Dump
-- Generated: 2025-08-13T01:49:55.751Z
-- Database: defaultdb
-- Server: readnwin-nextjs-book-nextjs.b.aivencloud.com:28428
-- PostgreSQL Version: 17.5
-- Compatibility: PostgreSQL 17+

-- Disable foreign key checks during import
SET session_replication_role = replica;




-- Enable foreign key checks
SET session_replication_role = DEFAULT;

-- Sequence: about_us_sections_id_seq
CREATE SEQUENCE IF NOT EXISTS "about_us_sections_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: achievements_id_seq
CREATE SEQUENCE IF NOT EXISTS "achievements_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: audit_logs_id_seq
CREATE SEQUENCE IF NOT EXISTS "audit_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: authors_id_seq
CREATE SEQUENCE IF NOT EXISTS "authors_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: bank_accounts_id_seq
CREATE SEQUENCE IF NOT EXISTS "bank_accounts_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: bank_transfer_notifications_id_seq
CREATE SEQUENCE IF NOT EXISTS "bank_transfer_notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: bank_transfer_payments_id_seq
CREATE SEQUENCE IF NOT EXISTS "bank_transfer_payments_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: bank_transfer_proofs_id_seq
CREATE SEQUENCE IF NOT EXISTS "bank_transfer_proofs_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: bank_transfers_id_seq
CREATE SEQUENCE IF NOT EXISTS "bank_transfers_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: blog_categories_id_seq
CREATE SEQUENCE IF NOT EXISTS "blog_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    NO CYCLE;

-- Sequence: blog_comments_id_seq
CREATE SEQUENCE IF NOT EXISTS "blog_comments_id_seq"
    START WITH 1
    INCREMENT BY 1

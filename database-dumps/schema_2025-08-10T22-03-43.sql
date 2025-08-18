-- Database Schema Dump
-- Generated on: 2025-08-10T22:03:45.557Z
-- Database: defaultdb
-- Host: readnwin-nextjs-book-nextjs.b.aivencloud.com:28428

-- Table: about_us_sections
DROP TABLE IF EXISTS "about_us_sections" CASCADE;
CREATE TABLE "about_us_sections" (
  "id" integer(32) DEFAULT nextval('about_us_sections_id_seq'::regclass) NOT NULL,
  "section_type" character varying(50) NOT NULL,
  "title" text,
  "subtitle" text,
  "content" text,
  "image_url" text,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_about_us_sections_order ON public.about_us_sections USING btree (order_index);
CREATE INDEX idx_about_us_sections_type ON public.about_us_sections USING btree (section_type);

-- Table: achievements
DROP TABLE IF EXISTS "achievements" CASCADE;
CREATE TABLE "achievements" (
  "id" integer(32) DEFAULT nextval('achievements_id_seq'::regclass) NOT NULL,
  "achievement_type" character varying(100) NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text NOT NULL,
  "icon" character varying(100) NOT NULL,
  "condition_type" character varying(50) NOT NULL,
  "condition_value" integer(32) NOT NULL,
  "priority" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX achievements_achievement_type_key ON public.achievements USING btree (achievement_type);

-- Table: audit_logs
DROP TABLE IF EXISTS "audit_logs" CASCADE;
CREATE TABLE "audit_logs" (
  "id" integer(32) DEFAULT nextval('audit_logs_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "action" character varying(100) NOT NULL,
  "resource_type" character varying(50),
  "resource_id" integer(32),
  "details" jsonb,
  "ip_address" character varying(45),
  "user_agent" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "admin_user_id" integer(32),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users" ("id");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: authors
DROP TABLE IF EXISTS "authors" CASCADE;
CREATE TABLE "authors" (
  "id" integer(32) DEFAULT nextval('authors_id_seq'::regclass) NOT NULL,
  "name" character varying(255) NOT NULL,
  "email" character varying(255),
  "bio" text,
  "avatar_url" text,
  "website_url" text,
  "social_media" jsonb,
  "is_verified" boolean DEFAULT false,
  "status" character varying(20) DEFAULT 'active'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX authors_email_key ON public.authors USING btree (email);
CREATE INDEX idx_authors_is_verified ON public.authors USING btree (is_verified);
CREATE INDEX idx_authors_status ON public.authors USING btree (status);

-- Table: bank_accounts
DROP TABLE IF EXISTS "bank_accounts" CASCADE;
CREATE TABLE "bank_accounts" (
  "id" integer(32) DEFAULT nextval('bank_accounts_id_seq'::regclass) NOT NULL,
  "bank_name" character varying(100) NOT NULL,
  "account_number" character varying(20) NOT NULL,
  "account_name" character varying(100) NOT NULL,
  "account_type" character varying(20) DEFAULT 'current'::character varying,
  "is_active" boolean DEFAULT true,
  "is_default" boolean DEFAULT false,
  "sort_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_bank_accounts_is_active ON public.bank_accounts USING btree (is_active);
CREATE INDEX idx_bank_accounts_is_default ON public.bank_accounts USING btree (is_default);

-- Table: bank_transfer_notifications
DROP TABLE IF EXISTS "bank_transfer_notifications" CASCADE;
CREATE TABLE "bank_transfer_notifications" (
  "id" integer(32) DEFAULT nextval('bank_transfer_notifications_id_seq'::regclass) NOT NULL,
  "bank_transfer_id" integer(32),
  "user_id" integer(32),
  "type" character varying(50) NOT NULL,
  "title" character varying(255) NOT NULL,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_bank_transfer_notifications_is_read ON public.bank_transfer_notifications USING btree (is_read);
CREATE INDEX idx_bank_transfer_notifications_user_id ON public.bank_transfer_notifications USING btree (user_id);
ALTER TABLE "bank_transfer_notifications" ADD CONSTRAINT "bank_transfer_notifications_bank_transfer_id_fkey" FOREIGN KEY ("bank_transfer_id") REFERENCES "bank_transfers" ("id");
ALTER TABLE "bank_transfer_notifications" ADD CONSTRAINT "bank_transfer_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: bank_transfer_payments
DROP TABLE IF EXISTS "bank_transfer_payments" CASCADE;
CREATE TABLE "bank_transfer_payments" (
  "id" integer(32) DEFAULT nextval('bank_transfer_payments_id_seq'::regclass) NOT NULL,
  "transaction_id" character varying(255) NOT NULL,
  "user_id" integer(32),
  "order_id" integer(32),
  "amount" numeric(10,2) NOT NULL,
  "currency" character varying(3) NOT NULL,
  "bank_name" character varying(100) NOT NULL,
  "account_number" character varying(50) NOT NULL,
  "account_name" character varying(100) NOT NULL,
  "reference_number" character varying(100) NOT NULL,
  "proof_of_payment_url" text,
  "status" character varying(20) DEFAULT 'pending'::character varying,
  "submitted_at" timestamp without time zone,
  "verified_at" timestamp without time zone,
  "verified_by" integer(32),
  "admin_notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "payment_transaction_id" character varying(255),
  "verification_attempts" integer(32) DEFAULT 0,
  "last_verification_attempt" timestamp without time zone,
  "auto_expire_at" timestamp without time zone,
  "notification_sent" boolean DEFAULT false,
  "admin_notified" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX bank_transfer_payments_reference_number_key ON public.bank_transfer_payments USING btree (reference_number);
CREATE UNIQUE INDEX bank_transfer_payments_transaction_id_key ON public.bank_transfer_payments USING btree (transaction_id);
CREATE INDEX idx_bank_transfer_payments_created_at ON public.bank_transfer_payments USING btree (created_at);
CREATE INDEX idx_bank_transfer_payments_order_id ON public.bank_transfer_payments USING btree (order_id);
CREATE INDEX idx_bank_transfer_payments_reference_number ON public.bank_transfer_payments USING btree (reference_number);
CREATE INDEX idx_bank_transfer_payments_status ON public.bank_transfer_payments USING btree (status);
CREATE INDEX idx_bank_transfer_payments_transaction_id ON public.bank_transfer_payments USING btree (transaction_id);
CREATE INDEX idx_bank_transfer_payments_user_id ON public.bank_transfer_payments USING btree (user_id);
ALTER TABLE "bank_transfer_payments" ADD CONSTRAINT "bank_transfer_payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");
ALTER TABLE "bank_transfer_payments" ADD CONSTRAINT "bank_transfer_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "bank_transfer_payments" ADD CONSTRAINT "bank_transfer_payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users" ("id");

-- Table: bank_transfer_proofs
DROP TABLE IF EXISTS "bank_transfer_proofs" CASCADE;
CREATE TABLE "bank_transfer_proofs" (
  "id" integer(32) DEFAULT nextval('bank_transfer_proofs_id_seq'::regclass) NOT NULL,
  "transaction_id" character varying(255),
  "user_id" integer(32),
  "bank_name" character varying(255) NOT NULL,
  "account_number" character varying(50) NOT NULL,
  "account_name" character varying(255) NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "reference_number" character varying(255),
  "proof_image_url" text,
  "status" character varying(20) DEFAULT 'pending'::character varying,
  "admin_notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

ALTER TABLE "bank_transfer_proofs" ADD CONSTRAINT "bank_transfer_proofs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions" ("transaction_id");
ALTER TABLE "bank_transfer_proofs" ADD CONSTRAINT "bank_transfer_proofs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: bank_transfers
DROP TABLE IF EXISTS "bank_transfers" CASCADE;
CREATE TABLE "bank_transfers" (
  "id" integer(32) DEFAULT nextval('bank_transfers_id_seq'::regclass) NOT NULL,
  "order_id" integer(32),
  "user_id" integer(32),
  "transaction_reference" character varying(100) NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "currency" character varying(3) DEFAULT 'NGN'::character varying,
  "bank_name" character varying(100),
  "account_number" character varying(20),
  "account_name" character varying(100),
  "payment_date" timestamp without time zone,
  "status" character varying(20) DEFAULT 'pending'::character varying,
  "admin_notes" text,
  "verified_by" integer(32),
  "verified_at" timestamp without time zone,
  "expires_at" timestamp without time zone NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX bank_transfers_transaction_reference_key ON public.bank_transfers USING btree (transaction_reference);
CREATE INDEX idx_bank_transfers_expires_at ON public.bank_transfers USING btree (expires_at);
CREATE INDEX idx_bank_transfers_order_id ON public.bank_transfers USING btree (order_id);
CREATE INDEX idx_bank_transfers_status ON public.bank_transfers USING btree (status);
CREATE INDEX idx_bank_transfers_transaction_reference ON public.bank_transfers USING btree (transaction_reference);
CREATE INDEX idx_bank_transfers_user_id ON public.bank_transfers USING btree (user_id);
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users" ("id");

-- Table: blog_categories
DROP TABLE IF EXISTS "blog_categories" CASCADE;
CREATE TABLE "blog_categories" (
  "id" integer(32) DEFAULT nextval('blog_categories_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "slug" character varying(100) NOT NULL,
  "description" text,
  "color" character varying(7) DEFAULT '#3B82F6'::character varying,
  "icon" character varying(50),
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX blog_categories_name_key ON public.blog_categories USING btree (name);
CREATE UNIQUE INDEX blog_categories_slug_key ON public.blog_categories USING btree (slug);

-- Table: blog_comments
DROP TABLE IF EXISTS "blog_comments" CASCADE;
CREATE TABLE "blog_comments" (
  "id" integer(32) DEFAULT nextval('blog_comments_id_seq'::regclass) NOT NULL,
  "post_id" integer(32),
  "user_id" integer(32),
  "author_name" character varying(255) NOT NULL,
  "author_email" character varying(255) NOT NULL,
  "content" text NOT NULL,
  "status" character varying(50) DEFAULT 'pending'::character varying,
  "parent_id" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_blog_comments_post_id ON public.blog_comments USING btree (post_id);
CREATE INDEX idx_blog_comments_status ON public.blog_comments USING btree (status);
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "blog_comments" ("id");
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id");
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: blog_images
DROP TABLE IF EXISTS "blog_images" CASCADE;
CREATE TABLE "blog_images" (
  "id" integer(32) DEFAULT nextval('blog_images_id_seq'::regclass) NOT NULL,
  "post_id" integer(32),
  "filename" character varying(255) NOT NULL,
  "original_name" character varying(255) NOT NULL,
  "file_path" character varying(500) NOT NULL,
  "file_size" integer(32) NOT NULL,
  "mime_type" character varying(100) NOT NULL,
  "alt_text" character varying(255),
  "caption" text,
  "is_featured" boolean DEFAULT false,
  "sort_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_blog_images_post_id ON public.blog_images USING btree (post_id);
ALTER TABLE "blog_images" ADD CONSTRAINT "blog_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id");

-- Table: blog_likes
DROP TABLE IF EXISTS "blog_likes" CASCADE;
CREATE TABLE "blog_likes" (
  "id" integer(32) DEFAULT nextval('blog_likes_id_seq'::regclass) NOT NULL,
  "post_id" integer(32),
  "user_id" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX blog_likes_post_id_user_id_key ON public.blog_likes USING btree (post_id, user_id);
CREATE INDEX idx_blog_likes_post_id ON public.blog_likes USING btree (post_id);
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id");
ALTER TABLE "blog_likes" ADD CONSTRAINT "blog_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: blog_posts
DROP TABLE IF EXISTS "blog_posts" CASCADE;
CREATE TABLE "blog_posts" (
  "id" integer(32) DEFAULT nextval('blog_posts_id_seq'::regclass) NOT NULL,
  "title" character varying(255) NOT NULL,
  "slug" character varying(255) NOT NULL,
  "excerpt" text,
  "content" text NOT NULL,
  "author_id" integer(32),
  "author_name" character varying(255) NOT NULL,
  "status" character varying(50) DEFAULT 'draft'::character varying,
  "featured" boolean DEFAULT false,
  "category" character varying(100) DEFAULT 'general'::character varying,
  "tags" ARRAY DEFAULT '{}'::text[],
  "read_time" integer(32) DEFAULT 5,
  "views_count" integer(32) DEFAULT 0,
  "likes_count" integer(32) DEFAULT 0,
  "comments_count" integer(32) DEFAULT 0,
  "seo_title" character varying(255),
  "seo_description" text,
  "seo_keywords" ARRAY,
  "published_at" timestamp without time zone,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts USING btree (author_id);
CREATE INDEX idx_blog_posts_category ON public.blog_posts USING btree (category);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts USING btree (featured);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts USING btree (published_at);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id");

-- Table: blog_views
DROP TABLE IF EXISTS "blog_views" CASCADE;
CREATE TABLE "blog_views" (
  "id" integer(32) DEFAULT nextval('blog_views_id_seq'::regclass) NOT NULL,
  "post_id" integer(32),
  "user_id" integer(32),
  "ip_address" inet,
  "user_agent" text,
  "viewed_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_blog_views_post_id ON public.blog_views USING btree (post_id);
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts" ("id");
ALTER TABLE "blog_views" ADD CONSTRAINT "blog_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: book_reviews
DROP TABLE IF EXISTS "book_reviews" CASCADE;
CREATE TABLE "book_reviews" (
  "id" integer(32) DEFAULT nextval('book_reviews_id_seq'::regclass) NOT NULL,
  "book_id" integer(32),
  "user_id" integer(32),
  "rating" integer(32),
  "title" character varying(255),
  "review_text" text,
  "is_verified_purchase" boolean DEFAULT false,
  "is_helpful_count" integer(32) DEFAULT 0,
  "status" character varying(20) DEFAULT 'approved'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "is_featured" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX book_reviews_book_id_user_id_key ON public.book_reviews USING btree (book_id, user_id);
CREATE INDEX idx_book_reviews_book_id ON public.book_reviews USING btree (book_id);
CREATE INDEX idx_book_reviews_rating ON public.book_reviews USING btree (rating);
CREATE INDEX idx_book_reviews_user_id ON public.book_reviews USING btree (user_id);
ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "book_reviews" ADD CONSTRAINT "book_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: book_tag_relations
DROP TABLE IF EXISTS "book_tag_relations" CASCADE;
CREATE TABLE "book_tag_relations" (
  "book_id" integer(32) NOT NULL,
  "tag_id" integer(32) NOT NULL,
  PRIMARY KEY ("book_id", "tag_id")
);

ALTER TABLE "book_tag_relations" ADD CONSTRAINT "book_tag_relations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "book_tag_relations" ADD CONSTRAINT "book_tag_relations_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "book_tags" ("id");

-- Table: book_tags
DROP TABLE IF EXISTS "book_tags" CASCADE;
CREATE TABLE "book_tags" (
  "id" integer(32) DEFAULT nextval('book_tags_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "color" character varying(7) DEFAULT '#3B82F6'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX book_tags_name_key ON public.book_tags USING btree (name);

-- Table: books
DROP TABLE IF EXISTS "books" CASCADE;
CREATE TABLE "books" (
  "id" integer(32) DEFAULT nextval('books_id_seq'::regclass) NOT NULL,
  "title" character varying(255) NOT NULL,
  "subtitle" character varying(255),
  "author_id" integer(32),
  "category_id" integer(32),
  "isbn" character varying(20),
  "description" text,
  "short_description" character varying(500),
  "cover_image_url" text,
  "sample_pdf_url" text,
  "ebook_file_url" text,
  "format" character varying(20) DEFAULT 'ebook'::character varying,
  "language" character varying(10) DEFAULT 'en'::character varying,
  "pages" integer(32),
  "publication_date" date,
  "publisher" character varying(255),
  "price" numeric(10,2) NOT NULL,
  "original_price" numeric(10,2),
  "cost_price" numeric(10,2),
  "weight_grams" integer(32),
  "dimensions" jsonb,
  "stock_quantity" integer(32) DEFAULT 0,
  "low_stock_threshold" integer(32) DEFAULT 10,
  "is_featured" boolean DEFAULT false,
  "is_bestseller" boolean DEFAULT false,
  "is_new_release" boolean DEFAULT false,
  "status" character varying(20) DEFAULT 'published'::character varying,
  "seo_title" character varying(255),
  "seo_description" text,
  "seo_keywords" text,
  "view_count" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "inventory_enabled" boolean DEFAULT false,
  "delivery_type" character varying(20) DEFAULT 'instant'::character varying,
  "is_digital" boolean DEFAULT false,
  "is_physical" boolean DEFAULT false,
  "unlimited_stock" boolean DEFAULT false,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX books_isbn_key ON public.books USING btree (isbn);
CREATE INDEX idx_books_author_id ON public.books USING btree (author_id);
CREATE INDEX idx_books_category_id ON public.books USING btree (category_id);
CREATE INDEX idx_books_created_at ON public.books USING btree (created_at);
CREATE INDEX idx_books_delivery_type ON public.books USING btree (delivery_type);
CREATE INDEX idx_books_format ON public.books USING btree (format);
CREATE INDEX idx_books_inventory_enabled ON public.books USING btree (inventory_enabled);
CREATE INDEX idx_books_is_bestseller ON public.books USING btree (is_bestseller);
CREATE INDEX idx_books_is_digital ON public.books USING btree (is_digital);
CREATE INDEX idx_books_is_featured ON public.books USING btree (is_featured);
CREATE INDEX idx_books_is_new_release ON public.books USING btree (is_new_release);
CREATE INDEX idx_books_is_physical ON public.books USING btree (is_physical);
CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);
CREATE INDEX idx_books_price ON public.books USING btree (price);
CREATE INDEX idx_books_status ON public.books USING btree (status);
CREATE INDEX idx_books_stock_quantity ON public.books USING btree (stock_quantity);
CREATE INDEX idx_books_unlimited_stock ON public.books USING btree (unlimited_stock);
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors" ("id");
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id");

-- Table: cart_items
DROP TABLE IF EXISTS "cart_items" CASCADE;
CREATE TABLE "cart_items" (
  "id" integer(32) DEFAULT nextval('cart_items_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "quantity" integer(32) DEFAULT 1,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "format" character varying(20) DEFAULT 'physical'::character varying NOT NULL,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX cart_items_user_id_book_id_key ON public.cart_items USING btree (user_id, book_id);
CREATE INDEX idx_cart_items_added_at ON public.cart_items USING btree (created_at);
CREATE INDEX idx_cart_items_book_id ON public.cart_items USING btree (book_id);
CREATE INDEX idx_cart_items_user_book ON public.cart_items USING btree (user_id, book_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: categories
DROP TABLE IF EXISTS "categories" CASCADE;
CREATE TABLE "categories" (
  "id" integer(32) DEFAULT nextval('categories_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "slug" character varying(100) NOT NULL,
  "description" text,
  "parent_id" integer(32),
  "image_url" text,
  "is_active" boolean DEFAULT true,
  "sort_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);
CREATE INDEX idx_categories_is_active ON public.categories USING btree (is_active);
CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories" ("id");

-- Table: company_stats
DROP TABLE IF EXISTS "company_stats" CASCADE;
CREATE TABLE "company_stats" (
  "id" integer(32) DEFAULT nextval('company_stats_id_seq'::regclass) NOT NULL,
  "number" character varying(50) NOT NULL,
  "label" character varying(255) NOT NULL,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_company_stats_order ON public.company_stats USING btree (order_index);

-- Table: company_values
DROP TABLE IF EXISTS "company_values" CASCADE;
CREATE TABLE "company_values" (
  "id" integer(32) DEFAULT nextval('company_values_id_seq'::regclass) NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text,
  "icon" character varying(100),
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_company_values_order ON public.company_values USING btree (order_index);

-- Table: contact_faqs
DROP TABLE IF EXISTS "contact_faqs" CASCADE;
CREATE TABLE "contact_faqs" (
  "id" integer(32) DEFAULT nextval('contact_faqs_id_seq'::regclass) NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_contact_faqs_order ON public.contact_faqs USING btree (order_index);

-- Table: contact_methods
DROP TABLE IF EXISTS "contact_methods" CASCADE;
CREATE TABLE "contact_methods" (
  "id" integer(32) DEFAULT nextval('contact_methods_id_seq'::regclass) NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text,
  "contact_info" character varying(255) NOT NULL,
  "icon" character varying(100),
  "action_url" text,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_contact_methods_order ON public.contact_methods USING btree (order_index);

-- Table: contact_settings
DROP TABLE IF EXISTS "contact_settings" CASCADE;
CREATE TABLE "contact_settings" (
  "id" integer(32) DEFAULT nextval('contact_settings_id_seq'::regclass) NOT NULL,
  "setting_key" character varying(100) NOT NULL,
  "setting_value" text,
  "setting_type" character varying(50) DEFAULT 'text'::character varying,
  "is_active" boolean DEFAULT true,
  "display_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX contact_settings_setting_key_key ON public.contact_settings USING btree (setting_key);

-- Table: contact_subjects
DROP TABLE IF EXISTS "contact_subjects" CASCADE;
CREATE TABLE "contact_subjects" (
  "id" integer(32) DEFAULT nextval('contact_subjects_id_seq'::regclass) NOT NULL,
  "subject" character varying(255) NOT NULL,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_contact_subjects_order ON public.contact_subjects USING btree (order_index);

-- Table: contact_submissions
DROP TABLE IF EXISTS "contact_submissions" CASCADE;
CREATE TABLE "contact_submissions" (
  "id" integer(32) DEFAULT nextval('contact_submissions_id_seq'::regclass) NOT NULL,
  "name" character varying(255) NOT NULL,
  "email" character varying(255) NOT NULL,
  "subject" character varying(255) NOT NULL,
  "message" text NOT NULL,
  "status" character varying(20) DEFAULT 'new'::character varying,
  "priority" character varying(20) DEFAULT 'normal'::character varying,
  "assigned_to" integer(32),
  "ip_address" inet,
  "user_agent" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions USING btree (status);
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id");

-- Table: content_blocks
DROP TABLE IF EXISTS "content_blocks" CASCADE;
CREATE TABLE "content_blocks" (
  "id" integer(32) DEFAULT nextval('content_blocks_id_seq'::regclass) NOT NULL,
  "section_id" integer(32),
  "block_type" character varying(50) NOT NULL,
  "block_title" character varying(255),
  "block_content" text,
  "block_data" jsonb,
  "block_order" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_content_blocks_section_id ON public.content_blocks USING btree (section_id);
CREATE INDEX idx_content_blocks_type ON public.content_blocks USING btree (block_type);
ALTER TABLE "content_blocks" ADD CONSTRAINT "content_blocks_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "content_sections" ("id");

-- Table: content_images
DROP TABLE IF EXISTS "content_images" CASCADE;
CREATE TABLE "content_images" (
  "id" integer(32) DEFAULT nextval('content_images_id_seq'::regclass) NOT NULL,
  "block_id" integer(32),
  "filename" character varying(255) NOT NULL,
  "original_name" character varying(255) NOT NULL,
  "file_path" character varying(500) NOT NULL,
  "file_size" integer(32) NOT NULL,
  "mime_type" character varying(100) NOT NULL,
  "alt_text" character varying(255),
  "caption" text,
  "image_type" character varying(50) DEFAULT 'content'::character varying,
  "sort_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_content_images_block_id ON public.content_images USING btree (block_id);
ALTER TABLE "content_images" ADD CONSTRAINT "content_images_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "content_blocks" ("id");

-- Table: content_pages
DROP TABLE IF EXISTS "content_pages" CASCADE;
CREATE TABLE "content_pages" (
  "id" integer(32) DEFAULT nextval('content_pages_id_seq'::regclass) NOT NULL,
  "page_key" character varying(100) NOT NULL,
  "page_title" character varying(255) NOT NULL,
  "page_description" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX content_pages_page_key_key ON public.content_pages USING btree (page_key);
CREATE INDEX idx_content_pages_key ON public.content_pages USING btree (page_key);

-- Table: content_sections
DROP TABLE IF EXISTS "content_sections" CASCADE;
CREATE TABLE "content_sections" (
  "id" integer(32) DEFAULT nextval('content_sections_id_seq'::regclass) NOT NULL,
  "page_id" integer(32),
  "section_key" character varying(100) NOT NULL,
  "section_title" character varying(255),
  "section_content" text,
  "section_order" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX content_sections_page_id_section_key_key ON public.content_sections USING btree (page_id, section_key);
CREATE INDEX idx_content_sections_key ON public.content_sections USING btree (section_key);
CREATE INDEX idx_content_sections_page_id ON public.content_sections USING btree (page_id);
ALTER TABLE "content_sections" ADD CONSTRAINT "content_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "content_pages" ("id");

-- Table: content_versions
DROP TABLE IF EXISTS "content_versions" CASCADE;
CREATE TABLE "content_versions" (
  "id" integer(32) DEFAULT nextval('content_versions_id_seq'::regclass) NOT NULL,
  "content_type" character varying(50) NOT NULL,
  "content_id" integer(32) NOT NULL,
  "version_number" integer(32) NOT NULL,
  "content_data" jsonb NOT NULL,
  "changed_by" integer(32),
  "change_reason" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_content_versions_content_id ON public.content_versions USING btree (content_id);
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users" ("id");

-- Table: discounts
DROP TABLE IF EXISTS "discounts" CASCADE;
CREATE TABLE "discounts" (
  "id" integer(32) DEFAULT nextval('discounts_id_seq'::regclass) NOT NULL,
  "code" character varying(50),
  "name" character varying(255) NOT NULL,
  "description" text,
  "discount_type" character varying(20) DEFAULT 'percentage'::character varying,
  "discount_value" numeric(10,2) NOT NULL,
  "minimum_order_amount" numeric(10,2) DEFAULT 0,
  "maximum_discount_amount" numeric(10,2),
  "usage_limit" integer(32),
  "used_count" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "valid_from" timestamp without time zone,
  "valid_until" timestamp without time zone,
  "applicable_categories" ARRAY,
  "applicable_books" ARRAY,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX discounts_code_key ON public.discounts USING btree (code);

-- Table: ecommerce_settings
DROP TABLE IF EXISTS "ecommerce_settings" CASCADE;
CREATE TABLE "ecommerce_settings" (
  "id" integer(32) DEFAULT nextval('ecommerce_settings_id_seq'::regclass) NOT NULL,
  "setting_key" character varying(255) NOT NULL,
  "setting_value" text,
  "description" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX ecommerce_settings_setting_key_key ON public.ecommerce_settings USING btree (setting_key);

-- Table: email_function_assignments
DROP TABLE IF EXISTS "email_function_assignments" CASCADE;
CREATE TABLE "email_function_assignments" (
  "id" integer(32) DEFAULT nextval('email_function_assignments_id_seq'::regclass) NOT NULL,
  "function_id" integer(32),
  "template_id" integer(32),
  "is_active" boolean DEFAULT true,
  "priority" integer(32) DEFAULT 1,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX email_function_assignments_function_id_template_id_key ON public.email_function_assignments USING btree (function_id, template_id);
CREATE INDEX idx_email_function_assignments_function_id ON public.email_function_assignments USING btree (function_id);
CREATE INDEX idx_email_function_assignments_template_id ON public.email_function_assignments USING btree (template_id);
ALTER TABLE "email_function_assignments" ADD CONSTRAINT "email_function_assignments_function_id_fkey" FOREIGN KEY ("function_id") REFERENCES "email_functions" ("id");
ALTER TABLE "email_function_assignments" ADD CONSTRAINT "email_function_assignments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "email_templates" ("id");

-- Table: email_functions
DROP TABLE IF EXISTS "email_functions" CASCADE;
CREATE TABLE "email_functions" (
  "id" integer(32) DEFAULT nextval('email_functions_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "slug" character varying(100) NOT NULL,
  "description" text,
  "category" character varying(100) DEFAULT 'general'::character varying,
  "required_variables" jsonb DEFAULT '[]'::jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX email_functions_name_key ON public.email_functions USING btree (name);
CREATE UNIQUE INDEX email_functions_slug_key ON public.email_functions USING btree (slug);
CREATE INDEX idx_email_functions_category ON public.email_functions USING btree (category);
CREATE INDEX idx_email_functions_slug ON public.email_functions USING btree (slug);

-- Table: email_gateways
DROP TABLE IF EXISTS "email_gateways" CASCADE;
CREATE TABLE "email_gateways" (
  "id" integer(32) DEFAULT nextval('email_gateways_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "type" character varying(50) NOT NULL,
  "host" character varying(255),
  "port" integer(32),
  "username" character varying(255),
  "password" character varying(255),
  "api_key" character varying(255),
  "api_secret" character varying(255),
  "region" character varying(100),
  "is_active" boolean DEFAULT true,
  "is_default" boolean DEFAULT false,
  "settings" jsonb,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


-- Table: email_template_categories
DROP TABLE IF EXISTS "email_template_categories" CASCADE;
CREATE TABLE "email_template_categories" (
  "id" integer(32) DEFAULT nextval('email_template_categories_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "description" text,
  "color" character varying(7) DEFAULT '#3B82F6'::character varying,
  "icon" character varying(50),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX email_template_categories_name_key ON public.email_template_categories USING btree (name);

-- Table: email_templates
DROP TABLE IF EXISTS "email_templates" CASCADE;
CREATE TABLE "email_templates" (
  "id" integer(32) DEFAULT nextval('email_templates_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "subject" character varying(255) NOT NULL,
  "html_content" text NOT NULL,
  "text_content" text,
  "variables" jsonb,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "slug" character varying(255),
  "category" character varying(100) DEFAULT 'general'::character varying,
  "description" text,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX email_templates_name_key ON public.email_templates USING btree (name);
CREATE INDEX idx_email_templates_active ON public.email_templates USING btree (is_active);
CREATE INDEX idx_email_templates_category ON public.email_templates USING btree (category);
CREATE INDEX idx_email_templates_slug ON public.email_templates USING btree (slug);

-- Table: faqs
DROP TABLE IF EXISTS "faqs" CASCADE;
CREATE TABLE "faqs" (
  "id" integer(32) DEFAULT nextval('faqs_id_seq'::regclass) NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "category" character varying(100) DEFAULT 'general'::character varying,
  "is_active" boolean DEFAULT true,
  "display_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_faqs_active ON public.faqs USING btree (is_active);
CREATE INDEX idx_faqs_category ON public.faqs USING btree (category);

-- Table: inventory_transactions
DROP TABLE IF EXISTS "inventory_transactions" CASCADE;
CREATE TABLE "inventory_transactions" (
  "id" integer(32) DEFAULT nextval('inventory_transactions_id_seq'::regclass) NOT NULL,
  "book_id" integer(32),
  "transaction_type" character varying(20) NOT NULL,
  "quantity" integer(32) NOT NULL,
  "previous_stock" integer(32) NOT NULL,
  "new_stock" integer(32) NOT NULL,
  "reference_id" integer(32),
  "reference_type" character varying(50),
  "notes" text,
  "created_by" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_inventory_transactions_book_id ON public.inventory_transactions USING btree (book_id);
CREATE INDEX idx_inventory_transactions_created_at ON public.inventory_transactions USING btree (created_at);
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id");

-- Table: nigerian_lgas
DROP TABLE IF EXISTS "nigerian_lgas" CASCADE;
CREATE TABLE "nigerian_lgas" (
  "id" integer(32) DEFAULT nextval('nigerian_lgas_id_seq'::regclass) NOT NULL,
  "state_id" integer(32),
  "name" character varying(100) NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX nigerian_lgas_state_id_name_key ON public.nigerian_lgas USING btree (state_id, name);
ALTER TABLE "nigerian_lgas" ADD CONSTRAINT "nigerian_lgas_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "nigerian_states" ("id");

-- Table: nigerian_states
DROP TABLE IF EXISTS "nigerian_states" CASCADE;
CREATE TABLE "nigerian_states" (
  "id" integer(32) DEFAULT nextval('nigerian_states_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX nigerian_states_name_key ON public.nigerian_states USING btree (name);

-- Table: note_shares
DROP TABLE IF EXISTS "note_shares" CASCADE;
CREATE TABLE "note_shares" (
  "id" integer(32) DEFAULT nextval('note_shares_id_seq'::regclass) NOT NULL,
  "note_id" integer(32),
  "shared_by" integer(32),
  "shared_with" integer(32),
  "permission" character varying(20) DEFAULT 'read'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX note_shares_note_id_shared_with_key ON public.note_shares USING btree (note_id, shared_with);
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "reading_notes" ("id");
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "users" ("id");
ALTER TABLE "note_shares" ADD CONSTRAINT "note_shares_shared_with_fkey" FOREIGN KEY ("shared_with") REFERENCES "users" ("id");

-- Table: note_tag_assignments
DROP TABLE IF EXISTS "note_tag_assignments" CASCADE;
CREATE TABLE "note_tag_assignments" (
  "id" integer(32) DEFAULT nextval('note_tag_assignments_id_seq'::regclass) NOT NULL,
  "note_id" integer(32),
  "tag_id" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX note_tag_assignments_note_id_tag_id_key ON public.note_tag_assignments USING btree (note_id, tag_id);
ALTER TABLE "note_tag_assignments" ADD CONSTRAINT "note_tag_assignments_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "reading_notes" ("id");
ALTER TABLE "note_tag_assignments" ADD CONSTRAINT "note_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "note_tags" ("id");

-- Table: note_tags
DROP TABLE IF EXISTS "note_tags" CASCADE;
CREATE TABLE "note_tags" (
  "id" integer(32) DEFAULT nextval('note_tags_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "name" character varying(100) NOT NULL,
  "color" character varying(20) DEFAULT '#6B7280'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_note_tags_user ON public.note_tags USING btree (user_id);
CREATE UNIQUE INDEX note_tags_user_id_name_key ON public.note_tags USING btree (user_id, name);
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: notes
DROP TABLE IF EXISTS "notes" CASCADE;
CREATE TABLE "notes" (
  "id" integer(32) DEFAULT nextval('notes_id_seq'::regclass) NOT NULL,
  "user_id" integer(32) NOT NULL,
  "book_id" integer(32) NOT NULL,
  "page_number" integer(32),
  "chapter_title" character varying(255),
  "note_type" character varying(50) DEFAULT 'general'::character varying NOT NULL,
  "content" text NOT NULL,
  "color" character varying(7) DEFAULT '#3B82F6'::character varying,
  "is_public" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_notes_book_id ON public.notes USING btree (book_id);
CREATE INDEX idx_notes_note_type ON public.notes USING btree (note_type);
CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);
ALTER TABLE "notes" ADD CONSTRAINT "notes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: office_location
DROP TABLE IF EXISTS "office_location" CASCADE;
CREATE TABLE "office_location" (
  "id" integer(32) DEFAULT nextval('office_location_id_seq'::regclass) NOT NULL,
  "address" text NOT NULL,
  "hours" text,
  "parking_info" text,
  "map_url" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);


-- Table: order_items
DROP TABLE IF EXISTS "order_items" CASCADE;
CREATE TABLE "order_items" (
  "id" integer(32) DEFAULT nextval('order_items_id_seq'::regclass) NOT NULL,
  "order_id" integer(32),
  "book_id" integer(32),
  "title" character varying(255) NOT NULL,
  "author_name" character varying(255) NOT NULL,
  "price" numeric(10,2) NOT NULL,
  "quantity" integer(32) NOT NULL,
  "total_price" numeric(10,2) NOT NULL,
  "format" character varying(20) DEFAULT 'ebook'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_order_items_book_id ON public.order_items USING btree (book_id);
CREATE INDEX idx_order_items_format ON public.order_items USING btree (format);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

-- Table: order_notes
DROP TABLE IF EXISTS "order_notes" CASCADE;
CREATE TABLE "order_notes" (
  "id" integer(32) DEFAULT nextval('order_notes_id_seq'::regclass) NOT NULL,
  "order_id" integer(32),
  "user_id" integer(32),
  "note" text NOT NULL,
  "is_internal" boolean DEFAULT false,
  "note_type" character varying(50) DEFAULT 'general'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_order_notes_created_at ON public.order_notes USING btree (created_at);
CREATE INDEX idx_order_notes_is_internal ON public.order_notes USING btree (is_internal);
CREATE INDEX idx_order_notes_order_id ON public.order_notes USING btree (order_id);
CREATE INDEX idx_order_notes_user_id ON public.order_notes USING btree (user_id);
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: order_status_history
DROP TABLE IF EXISTS "order_status_history" CASCADE;
CREATE TABLE "order_status_history" (
  "id" integer(32) DEFAULT nextval('order_status_history_id_seq'::regclass) NOT NULL,
  "order_id" integer(32),
  "status" character varying(50) NOT NULL,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "created_by" integer(32),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_order_status_history_created_at ON public.order_status_history USING btree (created_at);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);
CREATE INDEX idx_order_status_history_status ON public.order_status_history USING btree (status);
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id");
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

-- Table: orders
DROP TABLE IF EXISTS "orders" CASCADE;
CREATE TABLE "orders" (
  "id" integer(32) DEFAULT nextval('orders_id_seq'::regclass) NOT NULL,
  "order_number" character varying(50) NOT NULL,
  "user_id" integer(32),
  "guest_email" character varying(255),
  "status" character varying(20) DEFAULT 'pending'::character varying,
  "subtotal" numeric(10,2) NOT NULL,
  "tax_amount" numeric(10,2) DEFAULT 0,
  "shipping_amount" numeric(10,2) DEFAULT 0,
  "discount_amount" numeric(10,2) DEFAULT 0,
  "total_amount" numeric(10,2) NOT NULL,
  "currency" character varying(3) DEFAULT 'NGN'::character varying,
  "payment_method" character varying(50),
  "payment_status" character varying(20) DEFAULT 'pending'::character varying,
  "payment_transaction_id" character varying(255),
  "shipping_address" jsonb,
  "billing_address" jsonb,
  "shipping_method" character varying(255),
  "tracking_number" character varying(255),
  "estimated_delivery_date" date,
  "notes" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "order_type" character varying(20) DEFAULT 'mixed'::character varying,
  "digital_items_count" integer(32) DEFAULT 0,
  "physical_items_count" integer(32) DEFAULT 0,
  "shipping_method_id" integer(32),
  "shipping_zone_id" integer(32),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);
CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);
CREATE INDEX idx_orders_order_type ON public.orders USING btree (order_type);
CREATE INDEX idx_orders_payment_method ON public.orders USING btree (payment_method);
CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);
CREATE INDEX idx_orders_shipping_method_id ON public.orders USING btree (shipping_method_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods" ("id");
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones" ("id");
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: page_content
DROP TABLE IF EXISTS "page_content" CASCADE;
CREATE TABLE "page_content" (
  "id" integer(32) DEFAULT nextval('page_content_id_seq'::regclass) NOT NULL,
  "page_type" character varying(50) NOT NULL,
  "hero_title" text,
  "hero_subtitle" text,
  "hero_background_image_url" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX page_content_page_type_key ON public.page_content USING btree (page_type);

-- Table: payment_analytics
DROP TABLE IF EXISTS "payment_analytics" CASCADE;
CREATE TABLE "payment_analytics" (
  "id" integer(32) DEFAULT nextval('payment_analytics_id_seq'::regclass) NOT NULL,
  "gateway_type" character varying(50) NOT NULL,
  "date" date NOT NULL,
  "total_transactions" integer(32) DEFAULT 0,
  "successful_transactions" integer(32) DEFAULT 0,
  "failed_transactions" integer(32) DEFAULT 0,
  "total_amount" numeric(12,2) DEFAULT 0,
  "successful_amount" numeric(12,2) DEFAULT 0,
  "failed_amount" numeric(12,2) DEFAULT 0,
  "average_transaction_time" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_analytics_date ON public.payment_analytics USING btree (date);
CREATE INDEX idx_payment_analytics_gateway_date ON public.payment_analytics USING btree (gateway_type, date);
CREATE UNIQUE INDEX payment_analytics_gateway_type_date_key ON public.payment_analytics USING btree (gateway_type, date);

-- Table: payment_gateway_tests
DROP TABLE IF EXISTS "payment_gateway_tests" CASCADE;
CREATE TABLE "payment_gateway_tests" (
  "id" integer(32) DEFAULT nextval('payment_gateway_tests_id_seq'::regclass) NOT NULL,
  "gateway_type" character varying(50) NOT NULL,
  "test_type" character varying(50) NOT NULL,
  "test_amount" numeric(10,2),
  "test_currency" character varying(3),
  "status" character varying(20) NOT NULL,
  "result" jsonb,
  "error_message" text,
  "response_time" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "completed_at" timestamp without time zone,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_gateway_tests_created_at ON public.payment_gateway_tests USING btree (created_at);
CREATE INDEX idx_payment_gateway_tests_gateway_type ON public.payment_gateway_tests USING btree (gateway_type);
CREATE INDEX idx_payment_gateway_tests_status ON public.payment_gateway_tests USING btree (status);

-- Table: payment_gateways
DROP TABLE IF EXISTS "payment_gateways" CASCADE;
CREATE TABLE "payment_gateways" (
  "id" integer(32) DEFAULT nextval('payment_gateways_id_seq'::regclass) NOT NULL,
  "gateway_id" character varying(50) NOT NULL,
  "name" character varying(100) NOT NULL,
  "description" text,
  "enabled" boolean DEFAULT false,
  "test_mode" boolean DEFAULT true,
  "public_key" text,
  "secret_key" text,
  "webhook_secret" text,
  "hash" text,
  "status" character varying(20) DEFAULT 'inactive'::character varying,
  "supported_currencies" ARRAY,
  "supported_payment_methods" ARRAY,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "icon" character varying(100),
  "features" ARRAY,
  "config" jsonb DEFAULT '{}'::jsonb,
  "type" character varying(50) DEFAULT 'online'::character varying,
  "sort_order" integer(32) DEFAULT 0,
  "is_manual_gateway" boolean DEFAULT false,
  "webhook_url" character varying(500),
  "test_webhook_url" character varying(500),
  "last_webhook_test" timestamp without time zone,
  "webhook_test_status" character varying(20),
  "transaction_count" integer(32) DEFAULT 0,
  "success_rate" numeric(5,2) DEFAULT 0,
  "average_response_time" integer(32) DEFAULT 0,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_gateways_enabled ON public.payment_gateways USING btree (enabled);
CREATE INDEX idx_payment_gateways_gateway_id ON public.payment_gateways USING btree (gateway_id);
CREATE INDEX idx_payment_gateways_status ON public.payment_gateways USING btree (status);
CREATE UNIQUE INDEX payment_gateways_gateway_id_key ON public.payment_gateways USING btree (gateway_id);

-- Table: payment_method_preferences
DROP TABLE IF EXISTS "payment_method_preferences" CASCADE;
CREATE TABLE "payment_method_preferences" (
  "id" integer(32) DEFAULT nextval('payment_method_preferences_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "gateway_type" character varying(50) NOT NULL,
  "is_preferred" boolean DEFAULT false,
  "last_used" timestamp without time zone,
  "success_count" integer(32) DEFAULT 0,
  "failure_count" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_method_preferences_preferred ON public.payment_method_preferences USING btree (is_preferred);
CREATE INDEX idx_payment_method_preferences_user_id ON public.payment_method_preferences USING btree (user_id);
CREATE UNIQUE INDEX payment_method_preferences_user_id_gateway_type_key ON public.payment_method_preferences USING btree (user_id, gateway_type);
ALTER TABLE "payment_method_preferences" ADD CONSTRAINT "payment_method_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: payment_proofs
DROP TABLE IF EXISTS "payment_proofs" CASCADE;
CREATE TABLE "payment_proofs" (
  "id" integer(32) DEFAULT nextval('payment_proofs_id_seq'::regclass) NOT NULL,
  "bank_transfer_id" integer(32),
  "file_name" character varying(255) NOT NULL,
  "file_path" character varying(500) NOT NULL,
  "file_size" integer(32),
  "file_type" character varying(50),
  "upload_date" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "is_verified" boolean DEFAULT false,
  "verified_by" integer(32),
  "verified_at" timestamp without time zone,
  "admin_notes" text,
  "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_proofs_bank_transfer_id ON public.payment_proofs USING btree (bank_transfer_id);
CREATE INDEX idx_payment_proofs_status ON public.payment_proofs USING btree (status);
CREATE INDEX idx_payment_proofs_upload_date ON public.payment_proofs USING btree (upload_date);
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_bank_transfer_id_fkey" FOREIGN KEY ("bank_transfer_id") REFERENCES "bank_transfers" ("id");
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users" ("id");

-- Table: payment_refunds
DROP TABLE IF EXISTS "payment_refunds" CASCADE;
CREATE TABLE "payment_refunds" (
  "id" integer(32) DEFAULT nextval('payment_refunds_id_seq'::regclass) NOT NULL,
  "refund_id" character varying(255) NOT NULL,
  "transaction_id" character varying(255) NOT NULL,
  "order_id" character varying(255) NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "currency" character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
  "reason" text,
  "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
  "gateway_response" jsonb,
  "processed_by" integer(32),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_refunds_order_id ON public.payment_refunds USING btree (order_id);
CREATE INDEX idx_payment_refunds_status ON public.payment_refunds USING btree (status);
CREATE INDEX idx_payment_refunds_transaction_id ON public.payment_refunds USING btree (transaction_id);
CREATE UNIQUE INDEX payment_refunds_refund_id_key ON public.payment_refunds USING btree (refund_id);
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users" ("id");

-- Table: payment_settings
DROP TABLE IF EXISTS "payment_settings" CASCADE;
CREATE TABLE "payment_settings" (
  "id" integer(32) DEFAULT nextval('payment_settings_id_seq'::regclass) NOT NULL,
  "setting_key" character varying(255) NOT NULL,
  "setting_value" text,
  "description" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX payment_settings_setting_key_key ON public.payment_settings USING btree (setting_key);

-- Table: payment_transactions
DROP TABLE IF EXISTS "payment_transactions" CASCADE;
CREATE TABLE "payment_transactions" (
  "id" integer(32) DEFAULT nextval('payment_transactions_id_seq'::regclass) NOT NULL,
  "transaction_id" character varying(255) NOT NULL,
  "order_id" character varying(255) NOT NULL,
  "user_id" integer(32),
  "gateway_type" character varying(50) NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "currency" character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
  "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
  "gateway_response" jsonb,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "gateway_id" character varying(50),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions USING btree (created_at);
CREATE INDEX idx_payment_transactions_gateway_type ON public.payment_transactions USING btree (gateway_type);
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions USING btree (order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);
CREATE INDEX idx_payment_transactions_transaction_id ON public.payment_transactions USING btree (transaction_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions USING btree (user_id);
CREATE UNIQUE INDEX payment_transactions_transaction_id_key ON public.payment_transactions USING btree (transaction_id);
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: payment_webhooks
DROP TABLE IF EXISTS "payment_webhooks" CASCADE;
CREATE TABLE "payment_webhooks" (
  "id" integer(32) DEFAULT nextval('payment_webhooks_id_seq'::regclass) NOT NULL,
  "gateway_id" character varying(50) NOT NULL,
  "event_id" character varying(100) NOT NULL,
  "event_type" character varying(100) NOT NULL,
  "payload" jsonb NOT NULL,
  "processed" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_payment_webhooks_created_at ON public.payment_webhooks USING btree (created_at);
CREATE INDEX idx_payment_webhooks_event_id ON public.payment_webhooks USING btree (event_id);
CREATE INDEX idx_payment_webhooks_gateway_id ON public.payment_webhooks USING btree (gateway_id);
CREATE INDEX idx_payment_webhooks_processed ON public.payment_webhooks USING btree (processed);
CREATE UNIQUE INDEX payment_webhooks_event_id_key ON public.payment_webhooks USING btree (event_id);

-- Table: permissions
DROP TABLE IF EXISTS "permissions" CASCADE;
CREATE TABLE "permissions" (
  "id" integer(32) DEFAULT nextval('permissions_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "display_name" character varying(100) NOT NULL,
  "description" text,
  "resource" character varying(50) NOT NULL,
  "action" character varying(50) NOT NULL,
  "scope" character varying(20) DEFAULT 'global'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);

-- Table: public_pages
DROP TABLE IF EXISTS "public_pages" CASCADE;
CREATE TABLE "public_pages" (
  "id" integer(32) DEFAULT nextval('public_pages_id_seq'::regclass) NOT NULL,
  "page_type" character varying(50) NOT NULL,
  "content" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_public_pages_type ON public.public_pages USING btree (page_type);
CREATE UNIQUE INDEX public_pages_page_type_key ON public.public_pages USING btree (page_type);

-- Table: reading_goal_progress
DROP TABLE IF EXISTS "reading_goal_progress" CASCADE;
CREATE TABLE "reading_goal_progress" (
  "id" integer(32) DEFAULT nextval('reading_goal_progress_id_seq'::regclass) NOT NULL,
  "goal_id" integer(32),
  "user_id" integer(32),
  "date" date NOT NULL,
  "value" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_goal_progress_date ON public.reading_goal_progress USING btree (date);
CREATE INDEX idx_reading_goal_progress_goal_id ON public.reading_goal_progress USING btree (goal_id);
CREATE INDEX idx_reading_goal_progress_user_id ON public.reading_goal_progress USING btree (user_id);
CREATE UNIQUE INDEX reading_goal_progress_goal_id_date_key ON public.reading_goal_progress USING btree (goal_id, date);
ALTER TABLE "reading_goal_progress" ADD CONSTRAINT "reading_goal_progress_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "reading_goals" ("id");
ALTER TABLE "reading_goal_progress" ADD CONSTRAINT "reading_goal_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_goals
DROP TABLE IF EXISTS "reading_goals" CASCADE;
CREATE TABLE "reading_goals" (
  "id" integer(32) DEFAULT nextval('reading_goals_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "goal_type" character varying(50) NOT NULL,
  "target_value" integer(32) NOT NULL,
  "current_value" integer(32) DEFAULT 0,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_goals_end_date ON public.reading_goals USING btree (end_date);
CREATE INDEX idx_reading_goals_goal_type ON public.reading_goals USING btree (goal_type);
CREATE INDEX idx_reading_goals_is_active ON public.reading_goals USING btree (is_active);
CREATE INDEX idx_reading_goals_start_date ON public.reading_goals USING btree (start_date);
CREATE INDEX idx_reading_goals_user_id ON public.reading_goals USING btree (user_id);
CREATE UNIQUE INDEX reading_goals_user_id_goal_type_start_date_key ON public.reading_goals USING btree (user_id, goal_type, start_date);
ALTER TABLE "reading_goals" ADD CONSTRAINT "reading_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_highlights
DROP TABLE IF EXISTS "reading_highlights" CASCADE;
CREATE TABLE "reading_highlights" (
  "id" integer(32) DEFAULT nextval('reading_highlights_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "page_number" integer(32) NOT NULL,
  "highlight_text" text NOT NULL,
  "start_position" integer(32),
  "end_position" integer(32),
  "color" character varying(7) DEFAULT '#FFD700'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_highlights_book_id ON public.reading_highlights USING btree (book_id);
CREATE INDEX idx_reading_highlights_page_number ON public.reading_highlights USING btree (page_number);
CREATE INDEX idx_reading_highlights_user_id ON public.reading_highlights USING btree (user_id);
ALTER TABLE "reading_highlights" ADD CONSTRAINT "reading_highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "reading_highlights" ADD CONSTRAINT "reading_highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_notes
DROP TABLE IF EXISTS "reading_notes" CASCADE;
CREATE TABLE "reading_notes" (
  "id" integer(32) DEFAULT nextval('reading_notes_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "page_number" integer(32),
  "chapter_title" character varying(255),
  "note_type" character varying(50) DEFAULT 'general'::character varying,
  "content" text NOT NULL,
  "color" character varying(20) DEFAULT '#3B82F6'::character varying,
  "is_public" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_notes_book_id ON public.reading_notes USING btree (book_id);
CREATE INDEX idx_reading_notes_page ON public.reading_notes USING btree (book_id, page_number);
CREATE INDEX idx_reading_notes_page_number ON public.reading_notes USING btree (page_number);
CREATE INDEX idx_reading_notes_type ON public.reading_notes USING btree (note_type);
CREATE INDEX idx_reading_notes_user_book ON public.reading_notes USING btree (user_id, book_id);
CREATE INDEX idx_reading_notes_user_id ON public.reading_notes USING btree (user_id);
CREATE UNIQUE INDEX reading_notes_user_id_book_id_page_number_note_type_content_key ON public.reading_notes USING btree (user_id, book_id, page_number, note_type, content);
ALTER TABLE "reading_notes" ADD CONSTRAINT "reading_notes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "reading_notes" ADD CONSTRAINT "reading_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_progress
DROP TABLE IF EXISTS "reading_progress" CASCADE;
CREATE TABLE "reading_progress" (
  "id" integer(32) DEFAULT nextval('reading_progress_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "current_page" integer(32) DEFAULT 0,
  "total_pages" integer(32),
  "progress_percentage" numeric(5,2) DEFAULT 0,
  "last_read_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_progress_book_id ON public.reading_progress USING btree (book_id);
CREATE INDEX idx_reading_progress_user_id ON public.reading_progress USING btree (user_id);
CREATE UNIQUE INDEX reading_progress_user_id_book_id_key ON public.reading_progress USING btree (user_id, book_id);
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_sessions
DROP TABLE IF EXISTS "reading_sessions" CASCADE;
CREATE TABLE "reading_sessions" (
  "id" integer(32) DEFAULT nextval('reading_sessions_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "session_start" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "session_end" timestamp without time zone,
  "pages_read" integer(32) DEFAULT 0,
  "reading_time_minutes" integer(32) DEFAULT 0,
  "reading_speed_pages_per_hour" numeric(8,2),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_sessions_book_id ON public.reading_sessions USING btree (book_id);
CREATE INDEX idx_reading_sessions_session_start ON public.reading_sessions USING btree (session_start);
CREATE INDEX idx_reading_sessions_user_id ON public.reading_sessions USING btree (user_id);
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_speed_tracking
DROP TABLE IF EXISTS "reading_speed_tracking" CASCADE;
CREATE TABLE "reading_speed_tracking" (
  "id" integer(32) DEFAULT nextval('reading_speed_tracking_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "session_id" integer(32),
  "page_number" integer(32) NOT NULL,
  "words_on_page" integer(32) NOT NULL,
  "time_spent_seconds" integer(32) NOT NULL,
  "reading_speed_wpm" numeric(8,2),
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_speed_tracking_user_id ON public.reading_speed_tracking USING btree (user_id);
ALTER TABLE "reading_speed_tracking" ADD CONSTRAINT "reading_speed_tracking_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "reading_speed_tracking" ADD CONSTRAINT "reading_speed_tracking_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "reading_sessions" ("id");
ALTER TABLE "reading_speed_tracking" ADD CONSTRAINT "reading_speed_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: reading_streaks
DROP TABLE IF EXISTS "reading_streaks" CASCADE;
CREATE TABLE "reading_streaks" (
  "id" integer(32) DEFAULT nextval('reading_streaks_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "current_streak" integer(32) DEFAULT 0,
  "longest_streak" integer(32) DEFAULT 0,
  "last_read_date" date,
  "streak_start_date" date,
  "total_reading_days" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_reading_streaks_last_read_date ON public.reading_streaks USING btree (last_read_date);
CREATE INDEX idx_reading_streaks_user_id ON public.reading_streaks USING btree (user_id);
CREATE UNIQUE INDEX reading_streaks_user_id_key ON public.reading_streaks USING btree (user_id);
ALTER TABLE "reading_streaks" ADD CONSTRAINT "reading_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: role_permissions
DROP TABLE IF EXISTS "role_permissions" CASCADE;
CREATE TABLE "role_permissions" (
  "id" integer(32) DEFAULT nextval('role_permissions_id_seq'::regclass) NOT NULL,
  "role_id" integer(32),
  "permission_id" integer(32),
  "granted_by" integer(32),
  "granted_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);
CREATE UNIQUE INDEX role_permissions_role_id_permission_id_key ON public.role_permissions USING btree (role_id, permission_id);
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users" ("id");
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id");
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

-- Table: roles
DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE "roles" (
  "id" integer(32) DEFAULT nextval('roles_id_seq'::regclass) NOT NULL,
  "name" character varying(50) NOT NULL,
  "display_name" character varying(100) NOT NULL,
  "description" text,
  "priority" integer(32) DEFAULT 0,
  "is_system_role" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

-- Table: sessions
DROP TABLE IF EXISTS "sessions" CASCADE;
CREATE TABLE "sessions" (
  "id" integer(32) DEFAULT nextval('sessions_id_seq'::regclass) NOT NULL,
  "session_token" character varying(255) NOT NULL,
  "user_id" integer(32),
  "expires_at" timestamp without time zone NOT NULL,
  "last_activity" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "ip_address" inet,
  "user_agent" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);
CREATE INDEX idx_sessions_last_activity ON public.sessions USING btree (last_activity);
CREATE INDEX idx_sessions_token ON public.sessions USING btree (session_token);
CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);
CREATE UNIQUE INDEX sessions_session_token_key ON public.sessions USING btree (session_token);
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: shipping_details
DROP TABLE IF EXISTS "shipping_details" CASCADE;
CREATE TABLE "shipping_details" (
  "id" integer(32) DEFAULT nextval('shipping_details_id_seq'::regclass) NOT NULL,
  "order_id" integer(32),
  "recipient_name" character varying(255) NOT NULL,
  "phone" character varying(20) NOT NULL,
  "address_line1" character varying(255) NOT NULL,
  "address_line2" character varying(255),
  "city" character varying(100) NOT NULL,
  "state" character varying(100) NOT NULL,
  "postal_code" character varying(20),
  "country" character varying(100) DEFAULT 'Nigeria'::character varying,
  "shipping_method" character varying(100),
  "tracking_number" character varying(255),
  "status" character varying(20) DEFAULT 'pending'::character varying,
  "shipped_at" timestamp without time zone,
  "delivered_at" timestamp without time zone,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_shipping_details_order_id ON public.shipping_details USING btree (order_id);
CREATE INDEX idx_shipping_details_status ON public.shipping_details USING btree (status);
ALTER TABLE "shipping_details" ADD CONSTRAINT "shipping_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");

-- Table: shipping_method_zones
DROP TABLE IF EXISTS "shipping_method_zones" CASCADE;
CREATE TABLE "shipping_method_zones" (
  "id" integer(32) DEFAULT nextval('shipping_method_zones_id_seq'::regclass) NOT NULL,
  "shipping_method_id" integer(32),
  "shipping_zone_id" integer(32),
  "is_available" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_shipping_method_zones_method ON public.shipping_method_zones USING btree (shipping_method_id);
CREATE INDEX idx_shipping_method_zones_zone ON public.shipping_method_zones USING btree (shipping_zone_id);
CREATE UNIQUE INDEX shipping_method_zones_shipping_method_id_shipping_zone_id_key ON public.shipping_method_zones USING btree (shipping_method_id, shipping_zone_id);
ALTER TABLE "shipping_method_zones" ADD CONSTRAINT "shipping_method_zones_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods" ("id");
ALTER TABLE "shipping_method_zones" ADD CONSTRAINT "shipping_method_zones_shipping_zone_id_fkey" FOREIGN KEY ("shipping_zone_id") REFERENCES "shipping_zones" ("id");

-- Table: shipping_methods
DROP TABLE IF EXISTS "shipping_methods" CASCADE;
CREATE TABLE "shipping_methods" (
  "id" integer(32) DEFAULT nextval('shipping_methods_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "description" text,
  "base_cost" numeric(10,2) DEFAULT 0,
  "cost_per_item" numeric(10,2) DEFAULT 0,
  "free_shipping_threshold" numeric(10,2),
  "estimated_days_min" integer(32),
  "estimated_days_max" integer(32),
  "is_active" boolean DEFAULT true,
  "sort_order" integer(32) DEFAULT 0,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_shipping_methods_active ON public.shipping_methods USING btree (is_active);
CREATE INDEX idx_shipping_methods_sort ON public.shipping_methods USING btree (sort_order);

-- Table: shipping_rates
DROP TABLE IF EXISTS "shipping_rates" CASCADE;
CREATE TABLE "shipping_rates" (
  "id" integer(32) DEFAULT nextval('shipping_rates_id_seq'::regclass) NOT NULL,
  "zone_id" integer(32),
  "method_id" integer(32),
  "min_order_value" numeric(10,2) DEFAULT 0,
  "max_order_value" numeric(10,2) DEFAULT 999999.99,
  "rate" numeric(10,2) NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_shipping_rates_is_active ON public.shipping_rates USING btree (is_active);
CREATE INDEX idx_shipping_rates_method_id ON public.shipping_rates USING btree (method_id);
CREATE INDEX idx_shipping_rates_order_value_range ON public.shipping_rates USING btree (min_order_value, max_order_value);
CREATE INDEX idx_shipping_rates_zone_id ON public.shipping_rates USING btree (zone_id);
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "shipping_methods" ("id");
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "shipping_zones" ("id");

-- Table: shipping_zones
DROP TABLE IF EXISTS "shipping_zones" CASCADE;
CREATE TABLE "shipping_zones" (
  "id" integer(32) DEFAULT nextval('shipping_zones_id_seq'::regclass) NOT NULL,
  "name" character varying(100) NOT NULL,
  "countries" ARRAY,
  "states" ARRAY,
  "postal_codes" ARRAY,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_shipping_zones_active ON public.shipping_zones USING btree (is_active);
CREATE INDEX idx_shipping_zones_is_active ON public.shipping_zones USING btree (is_active);

-- Table: system_settings
DROP TABLE IF EXISTS "system_settings" CASCADE;
CREATE TABLE "system_settings" (
  "id" integer(32) DEFAULT nextval('system_settings_id_seq'::regclass) NOT NULL,
  "setting_key" character varying(255) NOT NULL,
  "setting_value" text,
  "description" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (setting_key);
CREATE UNIQUE INDEX system_settings_setting_key_key ON public.system_settings USING btree (setting_key);

-- Table: tax_rates
DROP TABLE IF EXISTS "tax_rates" CASCADE;
CREATE TABLE "tax_rates" (
  "id" integer(32) DEFAULT nextval('tax_rates_id_seq'::regclass) NOT NULL,
  "country" character varying(2) NOT NULL,
  "state" character varying(100),
  "city" character varying(100),
  "postal_code" character varying(20),
  "rate" numeric(5,4) NOT NULL,
  "tax_name" character varying(100) NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);


-- Table: team_members
DROP TABLE IF EXISTS "team_members" CASCADE;
CREATE TABLE "team_members" (
  "id" integer(32) DEFAULT nextval('team_members_id_seq'::regclass) NOT NULL,
  "name" character varying(255) NOT NULL,
  "role" character varying(255) NOT NULL,
  "bio" text,
  "image_url" text,
  "linkedin_url" text,
  "twitter_url" text,
  "order_index" integer(32) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_team_members_order ON public.team_members USING btree (order_index);

-- Table: user_achievements
DROP TABLE IF EXISTS "user_achievements" CASCADE;
CREATE TABLE "user_achievements" (
  "id" integer(32) DEFAULT nextval('user_achievements_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "achievement_type" character varying(50) NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text,
  "icon" character varying(100),
  "earned_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "metadata" jsonb,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_achievements_achievement_type ON public.user_achievements USING btree (achievement_type);
CREATE INDEX idx_user_achievements_earned_at ON public.user_achievements USING btree (earned_at);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id);
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_activity
DROP TABLE IF EXISTS "user_activity" CASCADE;
CREATE TABLE "user_activity" (
  "id" integer(32) DEFAULT nextval('user_activity_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "activity_type" character varying(50) NOT NULL,
  "title" character varying(255) NOT NULL,
  "description" text,
  "book_id" integer(32),
  "metadata" jsonb,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_activity_activity_type ON public.user_activity USING btree (activity_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity USING btree (created_at);
CREATE INDEX idx_user_activity_user_id ON public.user_activity USING btree (user_id);
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_bookmarks
DROP TABLE IF EXISTS "user_bookmarks" CASCADE;
CREATE TABLE "user_bookmarks" (
  "id" integer(32) DEFAULT nextval('user_bookmarks_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "page_number" integer(32) NOT NULL,
  "title" character varying(255),
  "description" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_bookmarks_book_id ON public.user_bookmarks USING btree (book_id);
CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks USING btree (user_id);
CREATE UNIQUE INDEX user_bookmarks_user_id_book_id_page_number_key ON public.user_bookmarks USING btree (user_id, book_id, page_number);
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "user_bookmarks" ADD CONSTRAINT "user_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_highlights
DROP TABLE IF EXISTS "user_highlights" CASCADE;
CREATE TABLE "user_highlights" (
  "id" integer(32) DEFAULT nextval('user_highlights_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "page_number" integer(32) NOT NULL,
  "start_position" integer(32) NOT NULL,
  "end_position" integer(32) NOT NULL,
  "highlighted_text" text NOT NULL,
  "highlight_color" character varying(20) DEFAULT 'yellow'::character varying,
  "note_text" text,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_highlights_book_id ON public.user_highlights USING btree (book_id);
CREATE INDEX idx_user_highlights_user_id ON public.user_highlights USING btree (user_id);
ALTER TABLE "user_highlights" ADD CONSTRAINT "user_highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "user_highlights" ADD CONSTRAINT "user_highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_library
DROP TABLE IF EXISTS "user_library" CASCADE;
CREATE TABLE "user_library" (
  "id" integer(32) DEFAULT nextval('user_library_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "order_id" integer(32),
  "purchase_date" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "is_favorite" boolean DEFAULT false,
  "download_count" integer(32) DEFAULT 0,
  "last_downloaded_at" timestamp without time zone,
  "reading_progress" integer(32) DEFAULT 0,
  "last_read_at" timestamp without time zone,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_library_book_id ON public.user_library USING btree (book_id);
CREATE INDEX idx_user_library_user_id ON public.user_library USING btree (user_id);
CREATE UNIQUE INDEX user_library_user_id_book_id_key ON public.user_library USING btree (user_id, book_id);
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id");
ALTER TABLE "user_library" ADD CONSTRAINT "user_library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_notes
DROP TABLE IF EXISTS "user_notes" CASCADE;
CREATE TABLE "user_notes" (
  "id" integer(32) DEFAULT nextval('user_notes_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "page_number" integer(32) NOT NULL,
  "note_text" text NOT NULL,
  "note_type" character varying(20) DEFAULT 'general'::character varying,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_notes_book_id ON public.user_notes USING btree (book_id);
CREATE INDEX idx_user_notes_user_id ON public.user_notes USING btree (user_id);
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_notes_tags
DROP TABLE IF EXISTS "user_notes_tags" CASCADE;
CREATE TABLE "user_notes_tags" (
  "id" integer(32) DEFAULT nextval('user_notes_tags_id_seq'::regclass) NOT NULL,
  "note_id" integer(32) NOT NULL,
  "tag_id" integer(32) NOT NULL,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_notes_tags_note_id ON public.user_notes_tags USING btree (note_id);
CREATE INDEX idx_user_notes_tags_tag_id ON public.user_notes_tags USING btree (tag_id);
CREATE UNIQUE INDEX user_notes_tags_note_id_tag_id_key ON public.user_notes_tags USING btree (note_id, tag_id);
ALTER TABLE "user_notes_tags" ADD CONSTRAINT "user_notes_tags_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes" ("id");
ALTER TABLE "user_notes_tags" ADD CONSTRAINT "user_notes_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "note_tags" ("id");

-- Table: user_notifications
DROP TABLE IF EXISTS "user_notifications" CASCADE;
CREATE TABLE "user_notifications" (
  "id" integer(32) DEFAULT nextval('user_notifications_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "type" character varying(50) NOT NULL,
  "title" character varying(255) NOT NULL,
  "message" text NOT NULL,
  "is_read" boolean DEFAULT false,
  "metadata" jsonb,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_notifications_created_at ON public.user_notifications USING btree (created_at);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications USING btree (is_read);
CREATE INDEX idx_user_notifications_type ON public.user_notifications USING btree (type);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications USING btree (user_id);
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_permission_cache
DROP TABLE IF EXISTS "user_permission_cache" CASCADE;
CREATE TABLE "user_permission_cache" (
  "id" integer(32) DEFAULT nextval('user_permission_cache_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "permission_name" character varying(100) NOT NULL,
  "is_active" boolean DEFAULT true,
  "cached_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_permission_cache_user_id ON public.user_permission_cache USING btree (user_id);
CREATE UNIQUE INDEX user_permission_cache_user_id_permission_name_key ON public.user_permission_cache USING btree (user_id, permission_name);
ALTER TABLE "user_permission_cache" ADD CONSTRAINT "user_permission_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_roles
DROP TABLE IF EXISTS "user_roles" CASCADE;
CREATE TABLE "user_roles" (
  "id" integer(32) DEFAULT nextval('user_roles_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "role_id" integer(32),
  "assigned_by" integer(32),
  "assigned_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "expires_at" timestamp without time zone,
  "is_active" boolean DEFAULT true,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE UNIQUE INDEX user_roles_user_id_role_id_key ON public.user_roles USING btree (user_id, role_id);
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users" ("id");
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id");
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: user_shipping_addresses
DROP TABLE IF EXISTS "user_shipping_addresses" CASCADE;
CREATE TABLE "user_shipping_addresses" (
  "id" integer(32) DEFAULT nextval('user_shipping_addresses_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "first_name" character varying(100),
  "last_name" character varying(100),
  "email" character varying(255),
  "phone" character varying(20),
  "address_line_1" character varying(255),
  "address_line_2" character varying(255),
  "city" character varying(100),
  "state" character varying(100),
  "postal_code" character varying(20),
  "country" character varying(100),
  "is_default" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_user_shipping_addresses_default ON public.user_shipping_addresses USING btree (user_id, is_default);
CREATE INDEX idx_user_shipping_addresses_user ON public.user_shipping_addresses USING btree (user_id);
ALTER TABLE "user_shipping_addresses" ADD CONSTRAINT "user_shipping_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Table: users
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" integer(32) DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  "email" character varying(255) NOT NULL,
  "username" character varying(100) NOT NULL,
  "password_hash" character varying(255) NOT NULL,
  "first_name" character varying(100),
  "last_name" character varying(100),
  "avatar_url" text,
  "status" character varying(20) DEFAULT 'active'::character varying,
  "email_verified" boolean DEFAULT false,
  "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "last_login" timestamp without time zone,
  "email_verification_token" character varying(255),
  "email_verification_expires" timestamp without time zone,
  "welcome_email_sent" boolean DEFAULT false,
  "date_of_birth" date,
  "preferred_language" character varying(10) DEFAULT 'en'::character varying,
  "newsletter_subscription" boolean DEFAULT false,
  "total_orders" integer(32) DEFAULT 0,
  "total_spent" numeric(10,2) DEFAULT 0,
  "is_student" boolean DEFAULT false,
  "matriculation_number" character varying(50),
  "course" character varying(100),
  "department" character varying(100),
  "school_name" character varying(200),
  PRIMARY KEY ("id")
);

CREATE INDEX idx_users_course ON public.users USING btree (course);
CREATE INDEX idx_users_department ON public.users USING btree (department);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_is_student ON public.users USING btree (is_student);
CREATE INDEX idx_users_matriculation_number ON public.users USING btree (matriculation_number);
CREATE INDEX idx_users_school_name ON public.users USING btree (school_name);
CREATE INDEX idx_users_status ON public.users USING btree (status);
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);
CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

-- Table: wishlist_items
DROP TABLE IF EXISTS "wishlist_items" CASCADE;
CREATE TABLE "wishlist_items" (
  "id" integer(32) DEFAULT nextval('wishlist_items_id_seq'::regclass) NOT NULL,
  "user_id" integer(32),
  "book_id" integer(32),
  "added_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items USING btree (user_id);
CREATE UNIQUE INDEX wishlist_items_user_id_book_id_key ON public.wishlist_items USING btree (user_id, book_id);
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books" ("id");
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id");


--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

-- Started on 2025-08-13 02:37:59 WAT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_shipping_addresses DROP CONSTRAINT IF EXISTS user_shipping_addresses_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.user_permission_cache DROP CONSTRAINT IF EXISTS user_permission_cache_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notes DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notes_tags DROP CONSTRAINT IF EXISTS user_notes_tags_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notes_tags DROP CONSTRAINT IF EXISTS user_notes_tags_note_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_notes DROP CONSTRAINT IF EXISTS user_notes_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_library DROP CONSTRAINT IF EXISTS user_library_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_library DROP CONSTRAINT IF EXISTS user_library_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_library DROP CONSTRAINT IF EXISTS user_library_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_highlights DROP CONSTRAINT IF EXISTS user_highlights_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_highlights DROP CONSTRAINT IF EXISTS user_highlights_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_activity DROP CONSTRAINT IF EXISTS user_activity_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_activity DROP CONSTRAINT IF EXISTS user_activity_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_method_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shipping_method_zones DROP CONSTRAINT IF EXISTS shipping_method_zones_shipping_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shipping_method_zones DROP CONSTRAINT IF EXISTS shipping_method_zones_shipping_method_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shipping_details DROP CONSTRAINT IF EXISTS shipping_details_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_granted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_streaks DROP CONSTRAINT IF EXISTS reading_streaks_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_speed_tracking DROP CONSTRAINT IF EXISTS reading_speed_tracking_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_speed_tracking DROP CONSTRAINT IF EXISTS reading_speed_tracking_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_speed_tracking DROP CONSTRAINT IF EXISTS reading_speed_tracking_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_notes DROP CONSTRAINT IF EXISTS reading_notes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_notes DROP CONSTRAINT IF EXISTS reading_notes_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_highlights DROP CONSTRAINT IF EXISTS reading_highlights_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_highlights DROP CONSTRAINT IF EXISTS reading_highlights_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_goals DROP CONSTRAINT IF EXISTS reading_goals_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_goal_progress DROP CONSTRAINT IF EXISTS reading_goal_progress_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reading_goal_progress DROP CONSTRAINT IF EXISTS reading_goal_progress_goal_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_refunds DROP CONSTRAINT IF EXISTS payment_refunds_processed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_proofs DROP CONSTRAINT IF EXISTS payment_proofs_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_proofs DROP CONSTRAINT IF EXISTS payment_proofs_bank_transfer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payment_method_preferences DROP CONSTRAINT IF EXISTS payment_method_preferences_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_shipping_zone_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_shipping_method_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.order_notes DROP CONSTRAINT IF EXISTS order_notes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_notes DROP CONSTRAINT IF EXISTS order_notes_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notes DROP CONSTRAINT IF EXISTS notes_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.note_tags DROP CONSTRAINT IF EXISTS note_tags_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.note_tag_assignments DROP CONSTRAINT IF EXISTS note_tag_assignments_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.note_tag_assignments DROP CONSTRAINT IF EXISTS note_tag_assignments_note_id_fkey;
ALTER TABLE IF EXISTS ONLY public.note_shares DROP CONSTRAINT IF EXISTS note_shares_shared_with_fkey;
ALTER TABLE IF EXISTS ONLY public.note_shares DROP CONSTRAINT IF EXISTS note_shares_shared_by_fkey;
ALTER TABLE IF EXISTS ONLY public.note_shares DROP CONSTRAINT IF EXISTS note_shares_note_id_fkey;
ALTER TABLE IF EXISTS ONLY public.nigerian_lgas DROP CONSTRAINT IF EXISTS nigerian_lgas_state_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.email_retry_queue DROP CONSTRAINT IF EXISTS email_retry_queue_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.email_function_assignments DROP CONSTRAINT IF EXISTS email_function_assignments_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.email_function_assignments DROP CONSTRAINT IF EXISTS email_function_assignments_function_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_versions DROP CONSTRAINT IF EXISTS content_versions_changed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.content_sections DROP CONSTRAINT IF EXISTS content_sections_page_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_images DROP CONSTRAINT IF EXISTS content_images_block_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_section_id_fkey;
ALTER TABLE IF EXISTS ONLY public.contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_tag_relations DROP CONSTRAINT IF EXISTS book_tag_relations_tag_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_tag_relations DROP CONSTRAINT IF EXISTS book_tag_relations_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_reviews DROP CONSTRAINT IF EXISTS book_reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.book_reviews DROP CONSTRAINT IF EXISTS book_reviews_book_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_views DROP CONSTRAINT IF EXISTS blog_views_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_views DROP CONSTRAINT IF EXISTS blog_views_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_likes DROP CONSTRAINT IF EXISTS blog_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_likes DROP CONSTRAINT IF EXISTS blog_likes_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_images DROP CONSTRAINT IF EXISTS blog_images_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_comments DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_comments DROP CONSTRAINT IF EXISTS blog_comments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.blog_comments DROP CONSTRAINT IF EXISTS blog_comments_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfers DROP CONSTRAINT IF EXISTS bank_transfers_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfers DROP CONSTRAINT IF EXISTS bank_transfers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfers DROP CONSTRAINT IF EXISTS bank_transfers_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_proofs DROP CONSTRAINT IF EXISTS bank_transfer_proofs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_proofs DROP CONSTRAINT IF EXISTS bank_transfer_proofs_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_notifications DROP CONSTRAINT IF EXISTS bank_transfer_notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_notifications DROP CONSTRAINT IF EXISTS bank_transfer_notifications_bank_transfer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_admin_user_id_fkey;
DROP TRIGGER IF EXISTS update_payment_proofs_updated_at ON public.payment_proofs;
DROP TRIGGER IF EXISTS update_email_function_assignments_updated_at ON public.email_function_assignments;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
DROP TRIGGER IF EXISTS update_blog_like_count_trigger ON public.blog_likes;
DROP TRIGGER IF EXISTS update_blog_comment_count_trigger ON public.blog_comments;
DROP TRIGGER IF EXISTS update_bank_transfers_updated_at ON public.bank_transfers;
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
DROP INDEX IF EXISTS public.idx_wishlist_items_user_id;
DROP INDEX IF EXISTS public.idx_users_username;
DROP INDEX IF EXISTS public.idx_users_status;
DROP INDEX IF EXISTS public.idx_users_school_name;
DROP INDEX IF EXISTS public.idx_users_matriculation_number;
DROP INDEX IF EXISTS public.idx_users_is_student;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_department;
DROP INDEX IF EXISTS public.idx_users_course;
DROP INDEX IF EXISTS public.idx_user_shipping_addresses_user;
DROP INDEX IF EXISTS public.idx_user_shipping_addresses_default;
DROP INDEX IF EXISTS public.idx_user_roles_user_id;
DROP INDEX IF EXISTS public.idx_user_roles_role_id;
DROP INDEX IF EXISTS public.idx_user_permission_cache_user_id;
DROP INDEX IF EXISTS public.idx_user_notifications_user_id;
DROP INDEX IF EXISTS public.idx_user_notifications_type;
DROP INDEX IF EXISTS public.idx_user_notifications_is_read;
DROP INDEX IF EXISTS public.idx_user_notifications_created_at;
DROP INDEX IF EXISTS public.idx_user_notes_user_id;
DROP INDEX IF EXISTS public.idx_user_notes_tags_tag_id;
DROP INDEX IF EXISTS public.idx_user_notes_tags_note_id;
DROP INDEX IF EXISTS public.idx_user_notes_book_id;
DROP INDEX IF EXISTS public.idx_user_library_user_id;
DROP INDEX IF EXISTS public.idx_user_library_book_id;
DROP INDEX IF EXISTS public.idx_user_highlights_user_id;
DROP INDEX IF EXISTS public.idx_user_highlights_book_id;
DROP INDEX IF EXISTS public.idx_user_bookmarks_user_id;
DROP INDEX IF EXISTS public.idx_user_bookmarks_book_id;
DROP INDEX IF EXISTS public.idx_user_activity_user_id;
DROP INDEX IF EXISTS public.idx_user_activity_created_at;
DROP INDEX IF EXISTS public.idx_user_activity_activity_type;
DROP INDEX IF EXISTS public.idx_user_achievements_user_id;
DROP INDEX IF EXISTS public.idx_user_achievements_earned_at;
DROP INDEX IF EXISTS public.idx_user_achievements_achievement_type;
DROP INDEX IF EXISTS public.idx_team_members_order;
DROP INDEX IF EXISTS public.idx_system_settings_key;
DROP INDEX IF EXISTS public.idx_shipping_zones_is_active;
DROP INDEX IF EXISTS public.idx_shipping_zones_active;
DROP INDEX IF EXISTS public.idx_shipping_rates_zone_id;
DROP INDEX IF EXISTS public.idx_shipping_rates_order_value_range;
DROP INDEX IF EXISTS public.idx_shipping_rates_method_id;
DROP INDEX IF EXISTS public.idx_shipping_rates_is_active;
DROP INDEX IF EXISTS public.idx_shipping_methods_sort;
DROP INDEX IF EXISTS public.idx_shipping_methods_active;
DROP INDEX IF EXISTS public.idx_shipping_method_zones_zone;
DROP INDEX IF EXISTS public.idx_shipping_method_zones_method;
DROP INDEX IF EXISTS public.idx_shipping_details_status;
DROP INDEX IF EXISTS public.idx_shipping_details_order_id;
DROP INDEX IF EXISTS public.idx_sessions_user_id;
DROP INDEX IF EXISTS public.idx_sessions_token;
DROP INDEX IF EXISTS public.idx_sessions_last_activity;
DROP INDEX IF EXISTS public.idx_sessions_expires_at;
DROP INDEX IF EXISTS public.idx_role_permissions_role_id;
DROP INDEX IF EXISTS public.idx_role_permissions_permission_id;
DROP INDEX IF EXISTS public.idx_reading_streaks_user_id;
DROP INDEX IF EXISTS public.idx_reading_streaks_last_read_date;
DROP INDEX IF EXISTS public.idx_reading_speed_tracking_user_id;
DROP INDEX IF EXISTS public.idx_reading_sessions_user_id;
DROP INDEX IF EXISTS public.idx_reading_sessions_session_start;
DROP INDEX IF EXISTS public.idx_reading_sessions_book_id;
DROP INDEX IF EXISTS public.idx_reading_progress_user_id;
DROP INDEX IF EXISTS public.idx_reading_progress_book_id;
DROP INDEX IF EXISTS public.idx_reading_notes_user_id;
DROP INDEX IF EXISTS public.idx_reading_notes_user_book;
DROP INDEX IF EXISTS public.idx_reading_notes_type;
DROP INDEX IF EXISTS public.idx_reading_notes_page_number;
DROP INDEX IF EXISTS public.idx_reading_notes_page;
DROP INDEX IF EXISTS public.idx_reading_notes_book_id;
DROP INDEX IF EXISTS public.idx_reading_highlights_user_id;
DROP INDEX IF EXISTS public.idx_reading_highlights_page_number;
DROP INDEX IF EXISTS public.idx_reading_highlights_book_id;
DROP INDEX IF EXISTS public.idx_reading_goals_user_id;
DROP INDEX IF EXISTS public.idx_reading_goals_start_date;
DROP INDEX IF EXISTS public.idx_reading_goals_is_active;
DROP INDEX IF EXISTS public.idx_reading_goals_goal_type;
DROP INDEX IF EXISTS public.idx_reading_goals_end_date;
DROP INDEX IF EXISTS public.idx_reading_goal_progress_user_id;
DROP INDEX IF EXISTS public.idx_reading_goal_progress_goal_id;
DROP INDEX IF EXISTS public.idx_reading_goal_progress_date;
DROP INDEX IF EXISTS public.idx_public_pages_type;
DROP INDEX IF EXISTS public.idx_payment_webhooks_processed;
DROP INDEX IF EXISTS public.idx_payment_webhooks_gateway_id;
DROP INDEX IF EXISTS public.idx_payment_webhooks_event_id;
DROP INDEX IF EXISTS public.idx_payment_webhooks_created_at;
DROP INDEX IF EXISTS public.idx_payment_transactions_user_id;
DROP INDEX IF EXISTS public.idx_payment_transactions_transaction_id;
DROP INDEX IF EXISTS public.idx_payment_transactions_status;
DROP INDEX IF EXISTS public.idx_payment_transactions_order_id;
DROP INDEX IF EXISTS public.idx_payment_transactions_gateway_type;
DROP INDEX IF EXISTS public.idx_payment_transactions_created_at;
DROP INDEX IF EXISTS public.idx_payment_refunds_transaction_id;
DROP INDEX IF EXISTS public.idx_payment_refunds_status;
DROP INDEX IF EXISTS public.idx_payment_refunds_order_id;
DROP INDEX IF EXISTS public.idx_payment_proofs_upload_date;
DROP INDEX IF EXISTS public.idx_payment_proofs_status;
DROP INDEX IF EXISTS public.idx_payment_proofs_bank_transfer_id;
DROP INDEX IF EXISTS public.idx_payment_method_preferences_user_id;
DROP INDEX IF EXISTS public.idx_payment_method_preferences_preferred;
DROP INDEX IF EXISTS public.idx_payment_gateways_status;
DROP INDEX IF EXISTS public.idx_payment_gateways_gateway_id;
DROP INDEX IF EXISTS public.idx_payment_gateways_enabled;
DROP INDEX IF EXISTS public.idx_payment_gateway_tests_status;
DROP INDEX IF EXISTS public.idx_payment_gateway_tests_gateway_type;
DROP INDEX IF EXISTS public.idx_payment_gateway_tests_created_at;
DROP INDEX IF EXISTS public.idx_payment_analytics_gateway_date;
DROP INDEX IF EXISTS public.idx_payment_analytics_date;
DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_shipping_method_id;
DROP INDEX IF EXISTS public.idx_orders_payment_status;
DROP INDEX IF EXISTS public.idx_orders_payment_method;
DROP INDEX IF EXISTS public.idx_orders_order_type;
DROP INDEX IF EXISTS public.idx_orders_order_number;
DROP INDEX IF EXISTS public.idx_orders_created_at;
DROP INDEX IF EXISTS public.idx_order_status_history_status;
DROP INDEX IF EXISTS public.idx_order_status_history_order_id;
DROP INDEX IF EXISTS public.idx_order_status_history_created_at;
DROP INDEX IF EXISTS public.idx_order_notes_user_id;
DROP INDEX IF EXISTS public.idx_order_notes_order_id;
DROP INDEX IF EXISTS public.idx_order_notes_is_internal;
DROP INDEX IF EXISTS public.idx_order_notes_created_at;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_order_items_format;
DROP INDEX IF EXISTS public.idx_order_items_book_id;
DROP INDEX IF EXISTS public.idx_notes_user_id;
DROP INDEX IF EXISTS public.idx_notes_note_type;
DROP INDEX IF EXISTS public.idx_notes_book_id;
DROP INDEX IF EXISTS public.idx_note_tags_user;
DROP INDEX IF EXISTS public.idx_inventory_transactions_created_at;
DROP INDEX IF EXISTS public.idx_inventory_transactions_book_id;
DROP INDEX IF EXISTS public.idx_faqs_category;
DROP INDEX IF EXISTS public.idx_faqs_active;
DROP INDEX IF EXISTS public.idx_email_templates_slug;
DROP INDEX IF EXISTS public.idx_email_templates_category;
DROP INDEX IF EXISTS public.idx_email_templates_active;
DROP INDEX IF EXISTS public.idx_email_functions_slug;
DROP INDEX IF EXISTS public.idx_email_functions_category;
DROP INDEX IF EXISTS public.idx_email_function_assignments_template_id;
DROP INDEX IF EXISTS public.idx_email_function_assignments_function_id;
DROP INDEX IF EXISTS public.idx_content_versions_content_id;
DROP INDEX IF EXISTS public.idx_content_sections_page_id;
DROP INDEX IF EXISTS public.idx_content_sections_key;
DROP INDEX IF EXISTS public.idx_content_pages_key;
DROP INDEX IF EXISTS public.idx_content_images_block_id;
DROP INDEX IF EXISTS public.idx_content_blocks_type;
DROP INDEX IF EXISTS public.idx_content_blocks_section_id;
DROP INDEX IF EXISTS public.idx_contact_submissions_status;
DROP INDEX IF EXISTS public.idx_contact_submissions_created_at;
DROP INDEX IF EXISTS public.idx_contact_subjects_order;
DROP INDEX IF EXISTS public.idx_contact_methods_order;
DROP INDEX IF EXISTS public.idx_contact_faqs_order;
DROP INDEX IF EXISTS public.idx_company_values_order;
DROP INDEX IF EXISTS public.idx_company_stats_order;
DROP INDEX IF EXISTS public.idx_categories_slug;
DROP INDEX IF EXISTS public.idx_categories_is_active;
DROP INDEX IF EXISTS public.idx_cart_items_user_id;
DROP INDEX IF EXISTS public.idx_cart_items_user_book;
DROP INDEX IF EXISTS public.idx_cart_items_book_id;
DROP INDEX IF EXISTS public.idx_cart_items_added_at;
DROP INDEX IF EXISTS public.idx_books_unlimited_stock;
DROP INDEX IF EXISTS public.idx_books_stock_quantity;
DROP INDEX IF EXISTS public.idx_books_status;
DROP INDEX IF EXISTS public.idx_books_price;
DROP INDEX IF EXISTS public.idx_books_isbn;
DROP INDEX IF EXISTS public.idx_books_is_physical;
DROP INDEX IF EXISTS public.idx_books_is_new_release;
DROP INDEX IF EXISTS public.idx_books_is_featured;
DROP INDEX IF EXISTS public.idx_books_is_digital;
DROP INDEX IF EXISTS public.idx_books_is_bestseller;
DROP INDEX IF EXISTS public.idx_books_inventory_enabled;
DROP INDEX IF EXISTS public.idx_books_format;
DROP INDEX IF EXISTS public.idx_books_delivery_type;
DROP INDEX IF EXISTS public.idx_books_created_at;
DROP INDEX IF EXISTS public.idx_books_category_id;
DROP INDEX IF EXISTS public.idx_books_author_id;
DROP INDEX IF EXISTS public.idx_book_reviews_user_id;
DROP INDEX IF EXISTS public.idx_book_reviews_rating;
DROP INDEX IF EXISTS public.idx_book_reviews_book_id;
DROP INDEX IF EXISTS public.idx_blog_views_post_id;
DROP INDEX IF EXISTS public.idx_blog_posts_status;
DROP INDEX IF EXISTS public.idx_blog_posts_slug;
DROP INDEX IF EXISTS public.idx_blog_posts_published_at;
DROP INDEX IF EXISTS public.idx_blog_posts_featured;
DROP INDEX IF EXISTS public.idx_blog_posts_category;
DROP INDEX IF EXISTS public.idx_blog_posts_author_id;
DROP INDEX IF EXISTS public.idx_blog_likes_post_id;
DROP INDEX IF EXISTS public.idx_blog_images_post_id;
DROP INDEX IF EXISTS public.idx_blog_comments_status;
DROP INDEX IF EXISTS public.idx_blog_comments_post_id;
DROP INDEX IF EXISTS public.idx_bank_transfers_user_id;
DROP INDEX IF EXISTS public.idx_bank_transfers_transaction_reference;
DROP INDEX IF EXISTS public.idx_bank_transfers_status;
DROP INDEX IF EXISTS public.idx_bank_transfers_order_id;
DROP INDEX IF EXISTS public.idx_bank_transfers_expires_at;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_user_id;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_transaction_id;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_status;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_reference_number;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_order_id;
DROP INDEX IF EXISTS public.idx_bank_transfer_payments_created_at;
DROP INDEX IF EXISTS public.idx_bank_transfer_notifications_user_id;
DROP INDEX IF EXISTS public.idx_bank_transfer_notifications_is_read;
DROP INDEX IF EXISTS public.idx_bank_accounts_is_default;
DROP INDEX IF EXISTS public.idx_bank_accounts_is_active;
DROP INDEX IF EXISTS public.idx_authors_status;
DROP INDEX IF EXISTS public.idx_authors_is_verified;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_about_us_sections_type;
DROP INDEX IF EXISTS public.idx_about_us_sections_order;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_user_id_book_id_key;
ALTER TABLE IF EXISTS ONLY public.wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.user_shipping_addresses DROP CONSTRAINT IF EXISTS user_shipping_addresses_pkey;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_id_key;
ALTER TABLE IF EXISTS ONLY public.user_roles DROP CONSTRAINT IF EXISTS user_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.user_permission_cache DROP CONSTRAINT IF EXISTS user_permission_cache_user_id_permission_name_key;
ALTER TABLE IF EXISTS ONLY public.user_permission_cache DROP CONSTRAINT IF EXISTS user_permission_cache_pkey;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.user_notes_tags DROP CONSTRAINT IF EXISTS user_notes_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.user_notes_tags DROP CONSTRAINT IF EXISTS user_notes_tags_note_id_tag_id_key;
ALTER TABLE IF EXISTS ONLY public.user_notes DROP CONSTRAINT IF EXISTS user_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.user_library DROP CONSTRAINT IF EXISTS user_library_user_id_book_id_key;
ALTER TABLE IF EXISTS ONLY public.user_library DROP CONSTRAINT IF EXISTS user_library_pkey;
ALTER TABLE IF EXISTS ONLY public.user_highlights DROP CONSTRAINT IF EXISTS user_highlights_pkey;
ALTER TABLE IF EXISTS ONLY public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_user_id_book_id_page_number_key;
ALTER TABLE IF EXISTS ONLY public.user_bookmarks DROP CONSTRAINT IF EXISTS user_bookmarks_pkey;
ALTER TABLE IF EXISTS ONLY public.user_activity DROP CONSTRAINT IF EXISTS user_activity_pkey;
ALTER TABLE IF EXISTS ONLY public.user_achievements DROP CONSTRAINT IF EXISTS user_achievements_pkey;
ALTER TABLE IF EXISTS ONLY public.team_members DROP CONSTRAINT IF EXISTS team_members_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_rates DROP CONSTRAINT IF EXISTS tax_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.system_settings DROP CONSTRAINT IF EXISTS system_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_zones DROP CONSTRAINT IF EXISTS shipping_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_rates DROP CONSTRAINT IF EXISTS shipping_rates_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_methods DROP CONSTRAINT IF EXISTS shipping_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_method_zones DROP CONSTRAINT IF EXISTS shipping_method_zones_shipping_method_id_shipping_zone_id_key;
ALTER TABLE IF EXISTS ONLY public.shipping_method_zones DROP CONSTRAINT IF EXISTS shipping_method_zones_pkey;
ALTER TABLE IF EXISTS ONLY public.shipping_details DROP CONSTRAINT IF EXISTS shipping_details_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_session_token_key;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_key;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_permission_id_key;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_streaks DROP CONSTRAINT IF EXISTS reading_streaks_user_id_key;
ALTER TABLE IF EXISTS ONLY public.reading_streaks DROP CONSTRAINT IF EXISTS reading_streaks_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_speed_tracking DROP CONSTRAINT IF EXISTS reading_speed_tracking_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_sessions DROP CONSTRAINT IF EXISTS reading_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_user_id_book_id_key;
ALTER TABLE IF EXISTS ONLY public.reading_progress DROP CONSTRAINT IF EXISTS reading_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_notes DROP CONSTRAINT IF EXISTS reading_notes_user_id_book_id_page_number_note_type_content_key;
ALTER TABLE IF EXISTS ONLY public.reading_notes DROP CONSTRAINT IF EXISTS reading_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_highlights DROP CONSTRAINT IF EXISTS reading_highlights_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_goals DROP CONSTRAINT IF EXISTS reading_goals_user_id_goal_type_start_date_key;
ALTER TABLE IF EXISTS ONLY public.reading_goals DROP CONSTRAINT IF EXISTS reading_goals_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_goal_progress DROP CONSTRAINT IF EXISTS reading_goal_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.reading_goal_progress DROP CONSTRAINT IF EXISTS reading_goal_progress_goal_id_date_key;
ALTER TABLE IF EXISTS ONLY public.public_pages DROP CONSTRAINT IF EXISTS public_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.public_pages DROP CONSTRAINT IF EXISTS public_pages_page_type_key;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_key;
ALTER TABLE IF EXISTS ONLY public.payment_webhooks DROP CONSTRAINT IF EXISTS payment_webhooks_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_webhooks DROP CONSTRAINT IF EXISTS payment_webhooks_event_id_key;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_transaction_id_key;
ALTER TABLE IF EXISTS ONLY public.payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_settings DROP CONSTRAINT IF EXISTS payment_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.payment_settings DROP CONSTRAINT IF EXISTS payment_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_refunds DROP CONSTRAINT IF EXISTS payment_refunds_refund_id_key;
ALTER TABLE IF EXISTS ONLY public.payment_refunds DROP CONSTRAINT IF EXISTS payment_refunds_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_proofs DROP CONSTRAINT IF EXISTS payment_proofs_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_method_preferences DROP CONSTRAINT IF EXISTS payment_method_preferences_user_id_gateway_type_key;
ALTER TABLE IF EXISTS ONLY public.payment_method_preferences DROP CONSTRAINT IF EXISTS payment_method_preferences_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_gateways DROP CONSTRAINT IF EXISTS payment_gateways_gateway_id_key;
ALTER TABLE IF EXISTS ONLY public.payment_gateway_tests DROP CONSTRAINT IF EXISTS payment_gateway_tests_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_analytics DROP CONSTRAINT IF EXISTS payment_analytics_pkey;
ALTER TABLE IF EXISTS ONLY public.payment_analytics DROP CONSTRAINT IF EXISTS payment_analytics_gateway_type_date_key;
ALTER TABLE IF EXISTS ONLY public.page_content DROP CONSTRAINT IF EXISTS page_content_pkey;
ALTER TABLE IF EXISTS ONLY public.page_content DROP CONSTRAINT IF EXISTS page_content_page_type_key;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;
ALTER TABLE IF EXISTS ONLY public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.order_notes DROP CONSTRAINT IF EXISTS order_notes_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.office_location DROP CONSTRAINT IF EXISTS office_location_pkey;
ALTER TABLE IF EXISTS ONLY public.notes DROP CONSTRAINT IF EXISTS notes_pkey;
ALTER TABLE IF EXISTS ONLY public.note_tags DROP CONSTRAINT IF EXISTS note_tags_user_id_name_key;
ALTER TABLE IF EXISTS ONLY public.note_tags DROP CONSTRAINT IF EXISTS note_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.note_tag_assignments DROP CONSTRAINT IF EXISTS note_tag_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.note_tag_assignments DROP CONSTRAINT IF EXISTS note_tag_assignments_note_id_tag_id_key;
ALTER TABLE IF EXISTS ONLY public.note_shares DROP CONSTRAINT IF EXISTS note_shares_pkey;
ALTER TABLE IF EXISTS ONLY public.note_shares DROP CONSTRAINT IF EXISTS note_shares_note_id_shared_with_key;
ALTER TABLE IF EXISTS ONLY public.nigerian_states DROP CONSTRAINT IF EXISTS nigerian_states_pkey;
ALTER TABLE IF EXISTS ONLY public.nigerian_states DROP CONSTRAINT IF EXISTS nigerian_states_name_key;
ALTER TABLE IF EXISTS ONLY public.nigerian_lgas DROP CONSTRAINT IF EXISTS nigerian_lgas_state_id_name_key;
ALTER TABLE IF EXISTS ONLY public.nigerian_lgas DROP CONSTRAINT IF EXISTS nigerian_lgas_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_transactions DROP CONSTRAINT IF EXISTS inventory_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.faqs DROP CONSTRAINT IF EXISTS faqs_pkey;
ALTER TABLE IF EXISTS ONLY public.email_templates DROP CONSTRAINT IF EXISTS email_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.email_templates DROP CONSTRAINT IF EXISTS email_templates_name_key;
ALTER TABLE IF EXISTS ONLY public.email_template_categories DROP CONSTRAINT IF EXISTS email_template_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.email_template_categories DROP CONSTRAINT IF EXISTS email_template_categories_name_key;
ALTER TABLE IF EXISTS ONLY public.email_retry_queue DROP CONSTRAINT IF EXISTS email_retry_queue_pkey;
ALTER TABLE IF EXISTS ONLY public.email_gateways DROP CONSTRAINT IF EXISTS email_gateways_pkey;
ALTER TABLE IF EXISTS ONLY public.email_functions DROP CONSTRAINT IF EXISTS email_functions_slug_key;
ALTER TABLE IF EXISTS ONLY public.email_functions DROP CONSTRAINT IF EXISTS email_functions_pkey;
ALTER TABLE IF EXISTS ONLY public.email_functions DROP CONSTRAINT IF EXISTS email_functions_name_key;
ALTER TABLE IF EXISTS ONLY public.email_function_assignments DROP CONSTRAINT IF EXISTS email_function_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.email_function_assignments DROP CONSTRAINT IF EXISTS email_function_assignments_function_id_template_id_key;
ALTER TABLE IF EXISTS ONLY public.ecommerce_settings DROP CONSTRAINT IF EXISTS ecommerce_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.ecommerce_settings DROP CONSTRAINT IF EXISTS ecommerce_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS discounts_pkey;
ALTER TABLE IF EXISTS ONLY public.discounts DROP CONSTRAINT IF EXISTS discounts_code_key;
ALTER TABLE IF EXISTS ONLY public.content_versions DROP CONSTRAINT IF EXISTS content_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.content_sections DROP CONSTRAINT IF EXISTS content_sections_pkey;
ALTER TABLE IF EXISTS ONLY public.content_sections DROP CONSTRAINT IF EXISTS content_sections_page_id_section_key_key;
ALTER TABLE IF EXISTS ONLY public.content_pages DROP CONSTRAINT IF EXISTS content_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.content_pages DROP CONSTRAINT IF EXISTS content_pages_page_key_key;
ALTER TABLE IF EXISTS ONLY public.content_images DROP CONSTRAINT IF EXISTS content_images_pkey;
ALTER TABLE IF EXISTS ONLY public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_subjects DROP CONSTRAINT IF EXISTS contact_subjects_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_settings DROP CONSTRAINT IF EXISTS contact_settings_setting_key_key;
ALTER TABLE IF EXISTS ONLY public.contact_settings DROP CONSTRAINT IF EXISTS contact_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_methods DROP CONSTRAINT IF EXISTS contact_methods_pkey;
ALTER TABLE IF EXISTS ONLY public.contact_faqs DROP CONSTRAINT IF EXISTS contact_faqs_pkey;
ALTER TABLE IF EXISTS ONLY public.company_values DROP CONSTRAINT IF EXISTS company_values_pkey;
ALTER TABLE IF EXISTS ONLY public.company_stats DROP CONSTRAINT IF EXISTS company_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_book_id_key;
ALTER TABLE IF EXISTS ONLY public.cart_items DROP CONSTRAINT IF EXISTS cart_items_pkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_pkey;
ALTER TABLE IF EXISTS ONLY public.books DROP CONSTRAINT IF EXISTS books_isbn_key;
ALTER TABLE IF EXISTS ONLY public.book_tags DROP CONSTRAINT IF EXISTS book_tags_pkey;
ALTER TABLE IF EXISTS ONLY public.book_tags DROP CONSTRAINT IF EXISTS book_tags_name_key;
ALTER TABLE IF EXISTS ONLY public.book_tag_relations DROP CONSTRAINT IF EXISTS book_tag_relations_pkey;
ALTER TABLE IF EXISTS ONLY public.book_reviews DROP CONSTRAINT IF EXISTS book_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.book_reviews DROP CONSTRAINT IF EXISTS book_reviews_book_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.blog_views DROP CONSTRAINT IF EXISTS blog_views_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_key;
ALTER TABLE IF EXISTS ONLY public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_likes DROP CONSTRAINT IF EXISTS blog_likes_post_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.blog_likes DROP CONSTRAINT IF EXISTS blog_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_images DROP CONSTRAINT IF EXISTS blog_images_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_comments DROP CONSTRAINT IF EXISTS blog_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_categories DROP CONSTRAINT IF EXISTS blog_categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.blog_categories DROP CONSTRAINT IF EXISTS blog_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.blog_categories DROP CONSTRAINT IF EXISTS blog_categories_name_key;
ALTER TABLE IF EXISTS ONLY public.bank_transfers DROP CONSTRAINT IF EXISTS bank_transfers_transaction_reference_key;
ALTER TABLE IF EXISTS ONLY public.bank_transfers DROP CONSTRAINT IF EXISTS bank_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_proofs DROP CONSTRAINT IF EXISTS bank_transfer_proofs_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_transaction_id_key;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_reference_number_key;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_payments DROP CONSTRAINT IF EXISTS bank_transfer_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_transfer_notifications DROP CONSTRAINT IF EXISTS bank_transfer_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.authors DROP CONSTRAINT IF EXISTS authors_pkey;
ALTER TABLE IF EXISTS ONLY public.authors DROP CONSTRAINT IF EXISTS authors_email_key;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_pkey;
ALTER TABLE IF EXISTS ONLY public.achievements DROP CONSTRAINT IF EXISTS achievements_achievement_type_key;
ALTER TABLE IF EXISTS ONLY public.about_us_sections DROP CONSTRAINT IF EXISTS about_us_sections_pkey;
ALTER TABLE IF EXISTS public.wishlist_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_shipping_addresses ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_permission_cache ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_notes_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_notes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_library ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_highlights ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_bookmarks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_activity ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_achievements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.team_members ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tax_rates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_rates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_methods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_method_zones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.shipping_details ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.role_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_streaks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_speed_tracking ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_notes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_highlights ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_goals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reading_goal_progress ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.public_pages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_webhooks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_refunds ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_proofs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_method_preferences ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_gateways ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_gateway_tests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.payment_analytics ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.page_content ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_notes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.office_location ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.note_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.note_tag_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.note_shares ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.nigerian_states ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.nigerian_lgas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.inventory_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.faqs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_templates ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_template_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_retry_queue ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_gateways ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_functions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.email_function_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ecommerce_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.discounts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_versions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_sections ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_pages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_blocks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_submissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_subjects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_methods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.contact_faqs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_values ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.company_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cart_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.books ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.book_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.book_reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_views ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_posts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_likes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_comments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.blog_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_transfers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_transfer_proofs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_transfer_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_transfer_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.bank_accounts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.authors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.achievements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.about_us_sections ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.wishlist_items_id_seq;
DROP TABLE IF EXISTS public.wishlist_items;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_shipping_addresses_id_seq;
DROP TABLE IF EXISTS public.user_shipping_addresses;
DROP SEQUENCE IF EXISTS public.user_roles_id_seq;
DROP TABLE IF EXISTS public.user_roles;
DROP SEQUENCE IF EXISTS public.user_permission_cache_id_seq;
DROP TABLE IF EXISTS public.user_permission_cache;
DROP SEQUENCE IF EXISTS public.user_notifications_id_seq;
DROP TABLE IF EXISTS public.user_notifications;
DROP SEQUENCE IF EXISTS public.user_notes_tags_id_seq;
DROP TABLE IF EXISTS public.user_notes_tags;
DROP SEQUENCE IF EXISTS public.user_notes_id_seq;
DROP TABLE IF EXISTS public.user_notes;
DROP SEQUENCE IF EXISTS public.user_library_id_seq;
DROP TABLE IF EXISTS public.user_library;
DROP SEQUENCE IF EXISTS public.user_highlights_id_seq;
DROP TABLE IF EXISTS public.user_highlights;
DROP SEQUENCE IF EXISTS public.user_bookmarks_id_seq;
DROP TABLE IF EXISTS public.user_bookmarks;
DROP SEQUENCE IF EXISTS public.user_activity_id_seq;
DROP TABLE IF EXISTS public.user_activity;
DROP SEQUENCE IF EXISTS public.user_achievements_id_seq;
DROP TABLE IF EXISTS public.user_achievements;
DROP SEQUENCE IF EXISTS public.team_members_id_seq;
DROP TABLE IF EXISTS public.team_members;
DROP SEQUENCE IF EXISTS public.tax_rates_id_seq;
DROP TABLE IF EXISTS public.tax_rates;
DROP SEQUENCE IF EXISTS public.system_settings_id_seq;
DROP TABLE IF EXISTS public.system_settings;
DROP SEQUENCE IF EXISTS public.shipping_zones_id_seq;
DROP TABLE IF EXISTS public.shipping_zones;
DROP SEQUENCE IF EXISTS public.shipping_rates_id_seq;
DROP TABLE IF EXISTS public.shipping_rates;
DROP SEQUENCE IF EXISTS public.shipping_methods_id_seq;
DROP TABLE IF EXISTS public.shipping_methods;
DROP SEQUENCE IF EXISTS public.shipping_method_zones_id_seq;
DROP TABLE IF EXISTS public.shipping_method_zones;
DROP SEQUENCE IF EXISTS public.shipping_details_id_seq;
DROP TABLE IF EXISTS public.shipping_details;
DROP SEQUENCE IF EXISTS public.sessions_id_seq;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.role_permissions_id_seq;
DROP TABLE IF EXISTS public.role_permissions;
DROP SEQUENCE IF EXISTS public.reading_streaks_id_seq;
DROP TABLE IF EXISTS public.reading_streaks;
DROP SEQUENCE IF EXISTS public.reading_speed_tracking_id_seq;
DROP TABLE IF EXISTS public.reading_speed_tracking;
DROP SEQUENCE IF EXISTS public.reading_sessions_id_seq;
DROP TABLE IF EXISTS public.reading_sessions;
DROP SEQUENCE IF EXISTS public.reading_progress_id_seq;
DROP TABLE IF EXISTS public.reading_progress;
DROP SEQUENCE IF EXISTS public.reading_notes_id_seq;
DROP TABLE IF EXISTS public.reading_notes;
DROP SEQUENCE IF EXISTS public.reading_highlights_id_seq;
DROP TABLE IF EXISTS public.reading_highlights;
DROP SEQUENCE IF EXISTS public.reading_goals_id_seq;
DROP TABLE IF EXISTS public.reading_goals;
DROP SEQUENCE IF EXISTS public.reading_goal_progress_id_seq;
DROP TABLE IF EXISTS public.reading_goal_progress;
DROP SEQUENCE IF EXISTS public.public_pages_id_seq;
DROP TABLE IF EXISTS public.public_pages;
DROP SEQUENCE IF EXISTS public.permissions_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.payment_webhooks_id_seq;
DROP TABLE IF EXISTS public.payment_webhooks;
DROP SEQUENCE IF EXISTS public.payment_transactions_id_seq;
DROP TABLE IF EXISTS public.payment_transactions;
DROP SEQUENCE IF EXISTS public.payment_settings_id_seq;
DROP TABLE IF EXISTS public.payment_settings;
DROP SEQUENCE IF EXISTS public.payment_refunds_id_seq;
DROP TABLE IF EXISTS public.payment_refunds;
DROP SEQUENCE IF EXISTS public.payment_proofs_id_seq;
DROP TABLE IF EXISTS public.payment_proofs;
DROP SEQUENCE IF EXISTS public.payment_method_preferences_id_seq;
DROP TABLE IF EXISTS public.payment_method_preferences;
DROP SEQUENCE IF EXISTS public.payment_gateways_id_seq;
DROP TABLE IF EXISTS public.payment_gateways;
DROP SEQUENCE IF EXISTS public.payment_gateway_tests_id_seq;
DROP TABLE IF EXISTS public.payment_gateway_tests;
DROP SEQUENCE IF EXISTS public.payment_analytics_id_seq;
DROP TABLE IF EXISTS public.payment_analytics;
DROP SEQUENCE IF EXISTS public.page_content_id_seq;
DROP TABLE IF EXISTS public.page_content;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_status_history_id_seq;
DROP TABLE IF EXISTS public.order_status_history;
DROP SEQUENCE IF EXISTS public.order_notes_id_seq;
DROP TABLE IF EXISTS public.order_notes;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.office_location_id_seq;
DROP TABLE IF EXISTS public.office_location;
DROP SEQUENCE IF EXISTS public.notes_id_seq;
DROP TABLE IF EXISTS public.notes;
DROP SEQUENCE IF EXISTS public.note_tags_id_seq;
DROP TABLE IF EXISTS public.note_tags;
DROP SEQUENCE IF EXISTS public.note_tag_assignments_id_seq;
DROP TABLE IF EXISTS public.note_tag_assignments;
DROP SEQUENCE IF EXISTS public.note_shares_id_seq;
DROP TABLE IF EXISTS public.note_shares;
DROP SEQUENCE IF EXISTS public.nigerian_states_id_seq;
DROP TABLE IF EXISTS public.nigerian_states;
DROP SEQUENCE IF EXISTS public.nigerian_lgas_id_seq;
DROP TABLE IF EXISTS public.nigerian_lgas;
DROP SEQUENCE IF EXISTS public.inventory_transactions_id_seq;
DROP TABLE IF EXISTS public.inventory_transactions;
DROP SEQUENCE IF EXISTS public.faqs_id_seq;
DROP TABLE IF EXISTS public.faqs;
DROP SEQUENCE IF EXISTS public.email_templates_id_seq;
DROP TABLE IF EXISTS public.email_templates;
DROP SEQUENCE IF EXISTS public.email_template_categories_id_seq;
DROP TABLE IF EXISTS public.email_template_categories;
DROP SEQUENCE IF EXISTS public.email_retry_queue_id_seq;
DROP TABLE IF EXISTS public.email_retry_queue;
DROP SEQUENCE IF EXISTS public.email_gateways_id_seq;
DROP TABLE IF EXISTS public.email_gateways;
DROP SEQUENCE IF EXISTS public.email_functions_id_seq;
DROP TABLE IF EXISTS public.email_functions;
DROP SEQUENCE IF EXISTS public.email_function_assignments_id_seq;
DROP TABLE IF EXISTS public.email_function_assignments;
DROP SEQUENCE IF EXISTS public.ecommerce_settings_id_seq;
DROP TABLE IF EXISTS public.ecommerce_settings;
DROP SEQUENCE IF EXISTS public.discounts_id_seq;
DROP TABLE IF EXISTS public.discounts;
DROP SEQUENCE IF EXISTS public.content_versions_id_seq;
DROP TABLE IF EXISTS public.content_versions;
DROP SEQUENCE IF EXISTS public.content_sections_id_seq;
DROP TABLE IF EXISTS public.content_sections;
DROP SEQUENCE IF EXISTS public.content_pages_id_seq;
DROP TABLE IF EXISTS public.content_pages;
DROP SEQUENCE IF EXISTS public.content_images_id_seq;
DROP TABLE IF EXISTS public.content_images;
DROP SEQUENCE IF EXISTS public.content_blocks_id_seq;
DROP TABLE IF EXISTS public.content_blocks;
DROP SEQUENCE IF EXISTS public.contact_submissions_id_seq;
DROP TABLE IF EXISTS public.contact_submissions;
DROP SEQUENCE IF EXISTS public.contact_subjects_id_seq;
DROP TABLE IF EXISTS public.contact_subjects;
DROP SEQUENCE IF EXISTS public.contact_settings_id_seq;
DROP TABLE IF EXISTS public.contact_settings;
DROP SEQUENCE IF EXISTS public.contact_methods_id_seq;
DROP TABLE IF EXISTS public.contact_methods;
DROP SEQUENCE IF EXISTS public.contact_faqs_id_seq;
DROP TABLE IF EXISTS public.contact_faqs;
DROP SEQUENCE IF EXISTS public.company_values_id_seq;
DROP TABLE IF EXISTS public.company_values;
DROP SEQUENCE IF EXISTS public.company_stats_id_seq;
DROP TABLE IF EXISTS public.company_stats;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.cart_items_id_seq;
DROP TABLE IF EXISTS public.cart_items;
DROP SEQUENCE IF EXISTS public.books_id_seq;
DROP TABLE IF EXISTS public.books;
DROP SEQUENCE IF EXISTS public.book_tags_id_seq;
DROP TABLE IF EXISTS public.book_tags;
DROP TABLE IF EXISTS public.book_tag_relations;
DROP SEQUENCE IF EXISTS public.book_reviews_id_seq;
DROP TABLE IF EXISTS public.book_reviews;
DROP SEQUENCE IF EXISTS public.blog_views_id_seq;
DROP TABLE IF EXISTS public.blog_views;
DROP SEQUENCE IF EXISTS public.blog_posts_id_seq;
DROP TABLE IF EXISTS public.blog_posts;
DROP SEQUENCE IF EXISTS public.blog_likes_id_seq;
DROP TABLE IF EXISTS public.blog_likes;
DROP SEQUENCE IF EXISTS public.blog_images_id_seq;
DROP TABLE IF EXISTS public.blog_images;
DROP SEQUENCE IF EXISTS public.blog_comments_id_seq;
DROP TABLE IF EXISTS public.blog_comments;
DROP SEQUENCE IF EXISTS public.blog_categories_id_seq;
DROP TABLE IF EXISTS public.blog_categories;
DROP SEQUENCE IF EXISTS public.bank_transfers_id_seq;
DROP TABLE IF EXISTS public.bank_transfers;
DROP SEQUENCE IF EXISTS public.bank_transfer_proofs_id_seq;
DROP TABLE IF EXISTS public.bank_transfer_proofs;
DROP SEQUENCE IF EXISTS public.bank_transfer_payments_id_seq;
DROP TABLE IF EXISTS public.bank_transfer_payments;
DROP SEQUENCE IF EXISTS public.bank_transfer_notifications_id_seq;
DROP TABLE IF EXISTS public.bank_transfer_notifications;
DROP SEQUENCE IF EXISTS public.bank_accounts_id_seq;
DROP TABLE IF EXISTS public.bank_accounts;
DROP SEQUENCE IF EXISTS public.authors_id_seq;
DROP TABLE IF EXISTS public.authors;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.achievements_id_seq;
DROP TABLE IF EXISTS public.achievements;
DROP SEQUENCE IF EXISTS public.about_us_sections_id_seq;
DROP TABLE IF EXISTS public.about_us_sections;
DROP FUNCTION IF EXISTS public.user_has_permission(user_id_param integer, permission_name_param character varying);
DROP FUNCTION IF EXISTS public.update_user_permission_cache(user_id_param integer);
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_session_activity(session_token_param character varying);
DROP FUNCTION IF EXISTS public.update_payment_proofs_updated_at();
DROP FUNCTION IF EXISTS public.update_payment_analytics();
DROP FUNCTION IF EXISTS public.update_email_function_assignments_updated_at();
DROP FUNCTION IF EXISTS public.update_blog_posts_updated_at();
DROP FUNCTION IF EXISTS public.update_blog_like_count();
DROP FUNCTION IF EXISTS public.update_blog_comment_count();
DROP FUNCTION IF EXISTS public.refresh_user_permission_cache();
DROP FUNCTION IF EXISTS public.get_gateway_stats(days_back integer);
DROP FUNCTION IF EXISTS public.extend_session(session_token_param character varying, extension_minutes integer);
DROP FUNCTION IF EXISTS public.expire_old_bank_transfers();
DROP FUNCTION IF EXISTS public.cleanup_expired_sessions();
--
-- TOC entry 426 (class 1255 OID 18014)
-- Name: cleanup_expired_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cleanup_expired_sessions() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM sessions 
  WHERE expires_at < CURRENT_TIMESTAMP 
     OR last_activity < CURRENT_TIMESTAMP - INTERVAL '15 minutes';
END;
$$;


--
-- TOC entry 434 (class 1255 OID 18948)
-- Name: expire_old_bank_transfers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.expire_old_bank_transfers() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE bank_transfer_payments 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;


--
-- TOC entry 428 (class 1255 OID 18016)
-- Name: extend_session(character varying, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.extend_session(session_token_param character varying, extension_minutes integer DEFAULT 15) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE sessions 
  SET expires_at = CURRENT_TIMESTAMP + (extension_minutes || ' minutes')::INTERVAL,
      last_activity = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE session_token = session_token_param;
END;
$$;


--
-- TOC entry 435 (class 1255 OID 18949)
-- Name: get_gateway_stats(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_gateway_stats(days_back integer DEFAULT 30) RETURNS TABLE(gateway_type character varying, total_transactions bigint, successful_transactions bigint, failed_transactions bigint, success_rate numeric, total_amount numeric, average_amount numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.gateway_type,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN pt.status = 'completed' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN pt.status = 'failed' THEN 1 END) as failed_transactions,
    ROUND(
      (COUNT(CASE WHEN pt.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as success_rate,
    SUM(pt.amount) as total_amount,
    AVG(pt.amount) as average_amount
  FROM payment_transactions pt
  WHERE pt.created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  GROUP BY pt.gateway_type
  ORDER BY total_transactions DESC;
END;
$$;


--
-- TOC entry 425 (class 1255 OID 16923)
-- Name: refresh_user_permission_cache(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_user_permission_cache() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          PERFORM update_user_permission_cache(NEW.user_id);
          RETURN NEW;
        ELSIF TG_OP = 'UPDATE' THEN
          PERFORM update_user_permission_cache(NEW.user_id);
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          PERFORM update_user_permission_cache(OLD.user_id);
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$;


--
-- TOC entry 430 (class 1255 OID 18158)
-- Name: update_blog_comment_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_blog_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


--
-- TOC entry 431 (class 1255 OID 18160)
-- Name: update_blog_like_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_blog_like_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE blog_posts 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


--
-- TOC entry 429 (class 1255 OID 18156)
-- Name: update_blog_posts_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_blog_posts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- TOC entry 432 (class 1255 OID 18228)
-- Name: update_email_function_assignments_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_email_function_assignments_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;


--
-- TOC entry 433 (class 1255 OID 18946)
-- Name: update_payment_analytics(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payment_analytics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update daily analytics
  INSERT INTO payment_analytics (
    gateway_type, 
    date, 
    total_transactions, 
    successful_transactions, 
    failed_transactions,
    total_amount,
    successful_amount,
    failed_amount
  )
  VALUES (
    NEW.gateway_type,
    DATE(NEW.created_at),
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    NEW.amount,
    CASE WHEN NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN NEW.amount ELSE 0 END
  )
  ON CONFLICT (gateway_type, date)
  DO UPDATE SET
    total_transactions = payment_analytics.total_transactions + 1,
    successful_transactions = payment_analytics.successful_transactions + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_transactions = payment_analytics.failed_transactions + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    total_amount = payment_analytics.total_amount + NEW.amount,
    successful_amount = payment_analytics.successful_amount + 
      CASE WHEN NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
    failed_amount = payment_analytics.failed_amount + 
      CASE WHEN NEW.status = 'failed' THEN NEW.amount ELSE 0 END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;


--
-- TOC entry 437 (class 1255 OID 19776)
-- Name: update_payment_proofs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_payment_proofs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$;


--
-- TOC entry 427 (class 1255 OID 18015)
-- Name: update_session_activity(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_session_activity(session_token_param character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE sessions 
  SET last_activity = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE session_token = session_token_param;
END;
$$;


--
-- TOC entry 436 (class 1255 OID 19510)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- TOC entry 423 (class 1255 OID 16921)
-- Name: update_user_permission_cache(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_permission_cache(user_id_param integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
      BEGIN
        -- Clear existing cache for this user
        DELETE FROM user_permission_cache WHERE user_id = user_id_param;
        
        -- Insert new permissions from user's roles
        INSERT INTO user_permission_cache (user_id, permission_name, is_active)
        SELECT DISTINCT 
          ur.user_id,
          p.name as permission_name,
          true as is_active
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_id_param 
          AND ur.is_active = true 
          AND rp.expires_at IS NULL OR rp.expires_at > NOW()
          AND p.is_active = true;
      END;
      $$;


--
-- TOC entry 424 (class 1255 OID 16922)
-- Name: user_has_permission(integer, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_has_permission(user_id_param integer, permission_name_param character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
      DECLARE
        has_perm BOOLEAN;
      BEGIN
        SELECT EXISTS(
          SELECT 1 FROM user_permission_cache 
          WHERE user_id = user_id_param 
            AND permission_name = permission_name_param 
            AND is_active = true
        ) INTO has_perm;
        
        RETURN COALESCE(has_perm, false);
      END;
      $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 341 (class 1259 OID 19068)
-- Name: about_us_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.about_us_sections (
    id integer NOT NULL,
    section_type character varying(50) NOT NULL,
    title text,
    subtitle text,
    content text,
    image_url text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 340 (class 1259 OID 19067)
-- Name: about_us_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.about_us_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6235 (class 0 OID 0)
-- Dependencies: 340
-- Name: about_us_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.about_us_sections_id_seq OWNED BY public.about_us_sections.id;


--
-- TOC entry 405 (class 1259 OID 19732)
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    achievement_type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    icon character varying(100) NOT NULL,
    condition_type character varying(50) NOT NULL,
    condition_value integer NOT NULL,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 404 (class 1259 OID 19731)
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6236 (class 0 OID 0)
-- Dependencies: 404
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- TOC entry 230 (class 1259 OID 17042)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    resource_type character varying(50),
    resource_id integer,
    details jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    admin_user_id integer
);


--
-- TOC entry 229 (class 1259 OID 17041)
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6237 (class 0 OID 0)
-- Dependencies: 229
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- TOC entry 236 (class 1259 OID 17480)
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authors (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    bio text,
    avatar_url text,
    website_url text,
    social_media jsonb,
    is_verified boolean DEFAULT false,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT authors_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying])::text[])))
);


--
-- TOC entry 235 (class 1259 OID 17479)
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.authors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6238 (class 0 OID 0)
-- Dependencies: 235
-- Name: authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.authors_id_seq OWNED BY public.authors.id;


--
-- TOC entry 383 (class 1259 OID 19467)
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_number character varying(20) NOT NULL,
    account_name character varying(100) NOT NULL,
    account_type character varying(20) DEFAULT 'current'::character varying,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 382 (class 1259 OID 19466)
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6239 (class 0 OID 0)
-- Dependencies: 382
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- TOC entry 385 (class 1259 OID 19480)
-- Name: bank_transfer_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transfer_notifications (
    id integer NOT NULL,
    bank_transfer_id integer,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_transfer_notifications_type_check CHECK (((type)::text = ANY ((ARRAY['initiated'::character varying, 'proof_uploaded'::character varying, 'verified'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


--
-- TOC entry 384 (class 1259 OID 19479)
-- Name: bank_transfer_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_transfer_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6240 (class 0 OID 0)
-- Dependencies: 384
-- Name: bank_transfer_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_transfer_notifications_id_seq OWNED BY public.bank_transfer_notifications.id;


--
-- TOC entry 301 (class 1259 OID 18407)
-- Name: bank_transfer_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transfer_payments (
    id integer NOT NULL,
    transaction_id character varying(255) NOT NULL,
    user_id integer,
    order_id integer,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_number character varying(50) NOT NULL,
    account_name character varying(100) NOT NULL,
    reference_number character varying(100) NOT NULL,
    proof_of_payment_url text,
    status character varying(20) DEFAULT 'pending'::character varying,
    submitted_at timestamp without time zone,
    verified_at timestamp without time zone,
    verified_by integer,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_transaction_id character varying(255),
    verification_attempts integer DEFAULT 0,
    last_verification_attempt timestamp without time zone,
    auto_expire_at timestamp without time zone,
    notification_sent boolean DEFAULT false,
    admin_notified boolean DEFAULT false,
    CONSTRAINT bank_transfer_payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'submitted'::character varying, 'verified'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


--
-- TOC entry 300 (class 1259 OID 18406)
-- Name: bank_transfer_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_transfer_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6241 (class 0 OID 0)
-- Dependencies: 300
-- Name: bank_transfer_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_transfer_payments_id_seq OWNED BY public.bank_transfer_payments.id;


--
-- TOC entry 389 (class 1259 OID 19538)
-- Name: bank_transfer_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transfer_proofs (
    id integer NOT NULL,
    transaction_id character varying(255),
    user_id integer,
    bank_name character varying(255) NOT NULL,
    account_number character varying(50) NOT NULL,
    account_name character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    reference_number character varying(255),
    proof_image_url text,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_transfer_proofs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


--
-- TOC entry 388 (class 1259 OID 19537)
-- Name: bank_transfer_proofs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_transfer_proofs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6242 (class 0 OID 0)
-- Dependencies: 388
-- Name: bank_transfer_proofs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_transfer_proofs_id_seq OWNED BY public.bank_transfer_proofs.id;


--
-- TOC entry 381 (class 1259 OID 19436)
-- Name: bank_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bank_transfers (
    id integer NOT NULL,
    order_id integer,
    user_id integer,
    transaction_reference character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying,
    bank_name character varying(100),
    account_number character varying(20),
    account_name character varying(100),
    payment_date timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    admin_notes text,
    verified_by integer,
    verified_at timestamp without time zone,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_transfers_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);


--
-- TOC entry 380 (class 1259 OID 19435)
-- Name: bank_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bank_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6243 (class 0 OID 0)
-- Dependencies: 380
-- Name: bank_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bank_transfers_id_seq OWNED BY public.bank_transfers.id;


--
-- TOC entry 275 (class 1259 OID 18045)
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 274 (class 1259 OID 18044)
-- Name: blog_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6244 (class 0 OID 0)
-- Dependencies: 274
-- Name: blog_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_categories_id_seq OWNED BY public.blog_categories.id;


--
-- TOC entry 279 (class 1259 OID 18078)
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_comments (
    id integer NOT NULL,
    post_id integer,
    user_id integer,
    author_name character varying(255) NOT NULL,
    author_email character varying(255) NOT NULL,
    content text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    parent_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT blog_comments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'spam'::character varying])::text[])))
);


--
-- TOC entry 278 (class 1259 OID 18077)
-- Name: blog_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6245 (class 0 OID 0)
-- Dependencies: 278
-- Name: blog_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_comments_id_seq OWNED BY public.blog_comments.id;


--
-- TOC entry 277 (class 1259 OID 18061)
-- Name: blog_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_images (
    id integer NOT NULL,
    post_id integer,
    filename character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    alt_text character varying(255),
    caption text,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 276 (class 1259 OID 18060)
-- Name: blog_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6246 (class 0 OID 0)
-- Dependencies: 276
-- Name: blog_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_images_id_seq OWNED BY public.blog_images.id;


--
-- TOC entry 281 (class 1259 OID 18106)
-- Name: blog_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_likes (
    id integer NOT NULL,
    post_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 280 (class 1259 OID 18105)
-- Name: blog_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6247 (class 0 OID 0)
-- Dependencies: 280
-- Name: blog_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_likes_id_seq OWNED BY public.blog_likes.id;


--
-- TOC entry 273 (class 1259 OID 18018)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    excerpt text,
    content text NOT NULL,
    author_id integer,
    author_name character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    featured boolean DEFAULT false,
    category character varying(100) DEFAULT 'general'::character varying,
    tags text[] DEFAULT '{}'::text[],
    read_time integer DEFAULT 5,
    views_count integer DEFAULT 0,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    seo_title character varying(255),
    seo_description text,
    seo_keywords text[],
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT blog_posts_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


--
-- TOC entry 272 (class 1259 OID 18017)
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6248 (class 0 OID 0)
-- Dependencies: 272
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- TOC entry 283 (class 1259 OID 18126)
-- Name: blog_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_views (
    id integer NOT NULL,
    post_id integer,
    user_id integer,
    ip_address inet,
    user_agent text,
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 282 (class 1259 OID 18125)
-- Name: blog_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6249 (class 0 OID 0)
-- Dependencies: 282
-- Name: blog_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_views_id_seq OWNED BY public.blog_views.id;


--
-- TOC entry 243 (class 1259 OID 17556)
-- Name: book_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_reviews (
    id integer NOT NULL,
    book_id integer,
    user_id integer,
    rating integer,
    title character varying(255),
    review_text text,
    is_verified_purchase boolean DEFAULT false,
    is_helpful_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'approved'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_featured boolean DEFAULT false,
    CONSTRAINT book_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT book_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- TOC entry 242 (class 1259 OID 17555)
-- Name: book_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6250 (class 0 OID 0)
-- Dependencies: 242
-- Name: book_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_reviews_id_seq OWNED BY public.book_reviews.id;


--
-- TOC entry 241 (class 1259 OID 17540)
-- Name: book_tag_relations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_tag_relations (
    book_id integer NOT NULL,
    tag_id integer NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 17530)
-- Name: book_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 239 (class 1259 OID 17529)
-- Name: book_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6251 (class 0 OID 0)
-- Dependencies: 239
-- Name: book_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_tags_id_seq OWNED BY public.book_tags.id;


--
-- TOC entry 238 (class 1259 OID 17496)
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    author_id integer,
    category_id integer,
    isbn character varying(20),
    description text,
    short_description character varying(500),
    cover_image_url text,
    sample_pdf_url text,
    ebook_file_url text,
    format character varying(20) DEFAULT 'ebook'::character varying,
    language character varying(10) DEFAULT 'en'::character varying,
    pages integer,
    publication_date date,
    publisher character varying(255),
    price numeric(10,2) NOT NULL,
    original_price numeric(10,2),
    cost_price numeric(10,2),
    weight_grams integer,
    dimensions jsonb,
    stock_quantity integer DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    is_featured boolean DEFAULT false,
    is_bestseller boolean DEFAULT false,
    is_new_release boolean DEFAULT false,
    status character varying(20) DEFAULT 'published'::character varying,
    seo_title character varying(255),
    seo_description text,
    seo_keywords text,
    view_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    inventory_enabled boolean DEFAULT false,
    delivery_type character varying(20) DEFAULT 'instant'::character varying,
    is_digital boolean DEFAULT false,
    is_physical boolean DEFAULT false,
    unlimited_stock boolean DEFAULT false,
    CONSTRAINT books_delivery_type_check CHECK (((delivery_type)::text = ANY ((ARRAY['instant'::character varying, 'shipping'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT books_format_check CHECK (((format)::text = ANY ((ARRAY['ebook'::character varying, 'physical'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT books_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying, 'out_of_stock'::character varying])::text[])))
);


--
-- TOC entry 237 (class 1259 OID 17495)
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6252 (class 0 OID 0)
-- Dependencies: 237
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- TOC entry 245 (class 1259 OID 17584)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    quantity integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    format character varying(20) DEFAULT 'physical'::character varying NOT NULL,
    CONSTRAINT cart_items_quantity_check CHECK ((quantity > 0))
);


--
-- TOC entry 244 (class 1259 OID 17583)
-- Name: cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6253 (class 0 OID 0)
-- Dependencies: 244
-- Name: cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- TOC entry 234 (class 1259 OID 17460)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    parent_id integer,
    image_url text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 233 (class 1259 OID 17459)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6254 (class 0 OID 0)
-- Dependencies: 233
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 347 (class 1259 OID 19107)
-- Name: company_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_stats (
    id integer NOT NULL,
    number character varying(50) NOT NULL,
    label character varying(255) NOT NULL,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 346 (class 1259 OID 19106)
-- Name: company_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6255 (class 0 OID 0)
-- Dependencies: 346
-- Name: company_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_stats_id_seq OWNED BY public.company_stats.id;


--
-- TOC entry 345 (class 1259 OID 19094)
-- Name: company_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_values (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    icon character varying(100),
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 344 (class 1259 OID 19093)
-- Name: company_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.company_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6256 (class 0 OID 0)
-- Dependencies: 344
-- Name: company_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.company_values_id_seq OWNED BY public.company_values.id;


--
-- TOC entry 351 (class 1259 OID 19131)
-- Name: contact_faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 350 (class 1259 OID 19130)
-- Name: contact_faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6257 (class 0 OID 0)
-- Dependencies: 350
-- Name: contact_faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_faqs_id_seq OWNED BY public.contact_faqs.id;


--
-- TOC entry 349 (class 1259 OID 19118)
-- Name: contact_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_methods (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    contact_info character varying(255) NOT NULL,
    icon character varying(100),
    action_url text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 348 (class 1259 OID 19117)
-- Name: contact_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6258 (class 0 OID 0)
-- Dependencies: 348
-- Name: contact_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_methods_id_seq OWNED BY public.contact_methods.id;


--
-- TOC entry 369 (class 1259 OID 19289)
-- Name: contact_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'text'::character varying,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 368 (class 1259 OID 19288)
-- Name: contact_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6259 (class 0 OID 0)
-- Dependencies: 368
-- Name: contact_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_settings_id_seq OWNED BY public.contact_settings.id;


--
-- TOC entry 353 (class 1259 OID 19144)
-- Name: contact_subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_subjects (
    id integer NOT NULL,
    subject character varying(255) NOT NULL,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 352 (class 1259 OID 19143)
-- Name: contact_subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_subjects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6260 (class 0 OID 0)
-- Dependencies: 352
-- Name: contact_subjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_subjects_id_seq OWNED BY public.contact_subjects.id;


--
-- TOC entry 367 (class 1259 OID 19269)
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    status character varying(20) DEFAULT 'new'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    assigned_to integer,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_submissions_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT contact_submissions_status_check CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'read'::character varying, 'replied'::character varying, 'closed'::character varying])::text[])))
);


--
-- TOC entry 366 (class 1259 OID 19268)
-- Name: contact_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6261 (class 0 OID 0)
-- Dependencies: 366
-- Name: contact_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_submissions_id_seq OWNED BY public.contact_submissions.id;


--
-- TOC entry 361 (class 1259 OID 19219)
-- Name: content_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_blocks (
    id integer NOT NULL,
    section_id integer,
    block_type character varying(50) NOT NULL,
    block_title character varying(255),
    block_content text,
    block_data jsonb,
    block_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 360 (class 1259 OID 19218)
-- Name: content_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6262 (class 0 OID 0)
-- Dependencies: 360
-- Name: content_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_blocks_id_seq OWNED BY public.content_blocks.id;


--
-- TOC entry 363 (class 1259 OID 19237)
-- Name: content_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_images (
    id integer NOT NULL,
    block_id integer,
    filename character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    alt_text character varying(255),
    caption text,
    image_type character varying(50) DEFAULT 'content'::character varying,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 362 (class 1259 OID 19236)
-- Name: content_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6263 (class 0 OID 0)
-- Dependencies: 362
-- Name: content_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_images_id_seq OWNED BY public.content_images.id;


--
-- TOC entry 357 (class 1259 OID 19185)
-- Name: content_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_pages (
    id integer NOT NULL,
    page_key character varying(100) NOT NULL,
    page_title character varying(255) NOT NULL,
    page_description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 356 (class 1259 OID 19184)
-- Name: content_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6264 (class 0 OID 0)
-- Dependencies: 356
-- Name: content_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_pages_id_seq OWNED BY public.content_pages.id;


--
-- TOC entry 359 (class 1259 OID 19199)
-- Name: content_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_sections (
    id integer NOT NULL,
    page_id integer,
    section_key character varying(100) NOT NULL,
    section_title character varying(255),
    section_content text,
    section_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 358 (class 1259 OID 19198)
-- Name: content_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6265 (class 0 OID 0)
-- Dependencies: 358
-- Name: content_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_sections_id_seq OWNED BY public.content_sections.id;


--
-- TOC entry 365 (class 1259 OID 19254)
-- Name: content_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_versions (
    id integer NOT NULL,
    content_type character varying(50) NOT NULL,
    content_id integer NOT NULL,
    version_number integer NOT NULL,
    content_data jsonb NOT NULL,
    changed_by integer,
    change_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 364 (class 1259 OID 19253)
-- Name: content_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6266 (class 0 OID 0)
-- Dependencies: 364
-- Name: content_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_versions_id_seq OWNED BY public.content_versions.id;


--
-- TOC entry 251 (class 1259 OID 17653)
-- Name: discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    code character varying(50),
    name character varying(255) NOT NULL,
    description text,
    discount_type character varying(20) DEFAULT 'percentage'::character varying,
    discount_value numeric(10,2) NOT NULL,
    minimum_order_amount numeric(10,2) DEFAULT 0,
    maximum_discount_amount numeric(10,2),
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    applicable_categories integer[],
    applicable_books integer[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT discounts_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying])::text[])))
);


--
-- TOC entry 250 (class 1259 OID 17652)
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6267 (class 0 OID 0)
-- Dependencies: 250
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- TOC entry 263 (class 1259 OID 17800)
-- Name: ecommerce_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecommerce_settings (
    id integer NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 262 (class 1259 OID 17799)
-- Name: ecommerce_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ecommerce_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6268 (class 0 OID 0)
-- Dependencies: 262
-- Name: ecommerce_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ecommerce_settings_id_seq OWNED BY public.ecommerce_settings.id;


--
-- TOC entry 289 (class 1259 OID 18202)
-- Name: email_function_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_function_assignments (
    id integer NOT NULL,
    function_id integer,
    template_id integer,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 288 (class 1259 OID 18201)
-- Name: email_function_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_function_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6269 (class 0 OID 0)
-- Dependencies: 288
-- Name: email_function_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_function_assignments_id_seq OWNED BY public.email_function_assignments.id;


--
-- TOC entry 287 (class 1259 OID 18185)
-- Name: email_functions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_functions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    category character varying(100) DEFAULT 'general'::character varying,
    required_variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 286 (class 1259 OID 18184)
-- Name: email_functions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_functions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6270 (class 0 OID 0)
-- Dependencies: 286
-- Name: email_functions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_functions_id_seq OWNED BY public.email_functions.id;


--
-- TOC entry 403 (class 1259 OID 19709)
-- Name: email_gateways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_gateways (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    host character varying(255),
    port integer,
    username character varying(255),
    password character varying(255),
    api_key character varying(255),
    api_secret character varying(255),
    region character varying(100),
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    settings jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_gateways_type_check CHECK (((type)::text = ANY ((ARRAY['smtp'::character varying, 'sendgrid'::character varying, 'mailgun'::character varying, 'ses'::character varying, 'custom'::character varying])::text[])))
);


--
-- TOC entry 402 (class 1259 OID 19708)
-- Name: email_gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_gateways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6271 (class 0 OID 0)
-- Dependencies: 402
-- Name: email_gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_gateways_id_seq OWNED BY public.email_gateways.id;


--
-- TOC entry 411 (class 1259 OID 19813)
-- Name: email_retry_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_retry_queue (
    id integer NOT NULL,
    user_id integer,
    email_type character varying(50) NOT NULL,
    email_address character varying(255) NOT NULL,
    user_name character varying(255),
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    next_retry_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    CONSTRAINT email_retry_queue_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))
);


--
-- TOC entry 410 (class 1259 OID 19812)
-- Name: email_retry_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_retry_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6272 (class 0 OID 0)
-- Dependencies: 410
-- Name: email_retry_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_retry_queue_id_seq OWNED BY public.email_retry_queue.id;


--
-- TOC entry 285 (class 1259 OID 18165)
-- Name: email_template_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_template_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 284 (class 1259 OID 18164)
-- Name: email_template_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_template_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6273 (class 0 OID 0)
-- Dependencies: 284
-- Name: email_template_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_template_categories_id_seq OWNED BY public.email_template_categories.id;


--
-- TOC entry 261 (class 1259 OID 17786)
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    html_content text NOT NULL,
    text_content text,
    variables jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    slug character varying(255),
    category character varying(100) DEFAULT 'general'::character varying,
    description text
);


--
-- TOC entry 260 (class 1259 OID 17785)
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6274 (class 0 OID 0)
-- Dependencies: 260
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- TOC entry 371 (class 1259 OID 19305)
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) DEFAULT 'general'::character varying,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 370 (class 1259 OID 19304)
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6275 (class 0 OID 0)
-- Dependencies: 370
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- TOC entry 399 (class 1259 OID 19668)
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id integer NOT NULL,
    book_id integer,
    transaction_type character varying(20) NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer NOT NULL,
    new_stock integer NOT NULL,
    reference_id integer,
    reference_type character varying(50),
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['purchase'::character varying, 'sale'::character varying, 'adjustment'::character varying, 'return'::character varying])::text[])))
);


--
-- TOC entry 398 (class 1259 OID 19667)
-- Name: inventory_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6276 (class 0 OID 0)
-- Dependencies: 398
-- Name: inventory_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_transactions_id_seq OWNED BY public.inventory_transactions.id;


--
-- TOC entry 311 (class 1259 OID 18520)
-- Name: nigerian_lgas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nigerian_lgas (
    id integer NOT NULL,
    state_id integer,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 310 (class 1259 OID 18519)
-- Name: nigerian_lgas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nigerian_lgas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6277 (class 0 OID 0)
-- Dependencies: 310
-- Name: nigerian_lgas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nigerian_lgas_id_seq OWNED BY public.nigerian_lgas.id;


--
-- TOC entry 309 (class 1259 OID 18510)
-- Name: nigerian_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nigerian_states (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 308 (class 1259 OID 18509)
-- Name: nigerian_states_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nigerian_states_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6278 (class 0 OID 0)
-- Dependencies: 308
-- Name: nigerian_states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nigerian_states_id_seq OWNED BY public.nigerian_states.id;


--
-- TOC entry 321 (class 1259 OID 18618)
-- Name: note_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note_shares (
    id integer NOT NULL,
    note_id integer,
    shared_by integer,
    shared_with integer,
    permission character varying(20) DEFAULT 'read'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT note_shares_permission_check CHECK (((permission)::text = ANY ((ARRAY['read'::character varying, 'edit'::character varying, 'admin'::character varying])::text[])))
);


--
-- TOC entry 320 (class 1259 OID 18617)
-- Name: note_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.note_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6279 (class 0 OID 0)
-- Dependencies: 320
-- Name: note_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.note_shares_id_seq OWNED BY public.note_shares.id;


--
-- TOC entry 319 (class 1259 OID 18598)
-- Name: note_tag_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note_tag_assignments (
    id integer NOT NULL,
    note_id integer,
    tag_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 318 (class 1259 OID 18597)
-- Name: note_tag_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.note_tag_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6280 (class 0 OID 0)
-- Dependencies: 318
-- Name: note_tag_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.note_tag_assignments_id_seq OWNED BY public.note_tag_assignments.id;


--
-- TOC entry 317 (class 1259 OID 18582)
-- Name: note_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.note_tags (
    id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    color character varying(20) DEFAULT '#6B7280'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 316 (class 1259 OID 18581)
-- Name: note_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.note_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6281 (class 0 OID 0)
-- Dependencies: 316
-- Name: note_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.note_tags_id_seq OWNED BY public.note_tags.id;


--
-- TOC entry 323 (class 1259 OID 18659)
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    book_id integer NOT NULL,
    page_number integer,
    chapter_title character varying(255),
    note_type character varying(50) DEFAULT 'general'::character varying NOT NULL,
    content text NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 322 (class 1259 OID 18658)
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6282 (class 0 OID 0)
-- Dependencies: 322
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- TOC entry 355 (class 1259 OID 19155)
-- Name: office_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.office_location (
    id integer NOT NULL,
    address text NOT NULL,
    hours text,
    parking_info text,
    map_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 354 (class 1259 OID 19154)
-- Name: office_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.office_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6283 (class 0 OID 0)
-- Dependencies: 354
-- Name: office_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.office_location_id_seq OWNED BY public.office_location.id;


--
-- TOC entry 249 (class 1259 OID 17632)
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    book_id integer,
    title character varying(255) NOT NULL,
    author_name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    format character varying(20) DEFAULT 'ebook'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 248 (class 1259 OID 17631)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6284 (class 0 OID 0)
-- Dependencies: 248
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 267 (class 1259 OID 17867)
-- Name: order_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_notes (
    id integer NOT NULL,
    order_id integer,
    user_id integer,
    note text NOT NULL,
    is_internal boolean DEFAULT false,
    note_type character varying(50) DEFAULT 'general'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 6285 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE order_notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.order_notes IS 'Admin notes for orders';


--
-- TOC entry 6286 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN order_notes.order_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_notes.order_id IS 'Reference to the order';


--
-- TOC entry 6287 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN order_notes.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_notes.created_at IS 'When the note was created';


--
-- TOC entry 266 (class 1259 OID 17866)
-- Name: order_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6288 (class 0 OID 0)
-- Dependencies: 266
-- Name: order_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_notes_id_seq OWNED BY public.order_notes.id;


--
-- TOC entry 265 (class 1259 OID 17847)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id integer NOT NULL,
    order_id integer,
    status character varying(50) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer
);


--
-- TOC entry 264 (class 1259 OID 17846)
-- Name: order_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6289 (class 0 OID 0)
-- Dependencies: 264
-- Name: order_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_status_history_id_seq OWNED BY public.order_status_history.id;


--
-- TOC entry 247 (class 1259 OID 17606)
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id integer,
    guest_email character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0,
    shipping_amount numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying,
    payment_method character varying(50),
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_transaction_id character varying(255),
    shipping_address jsonb,
    billing_address jsonb,
    shipping_method character varying(255),
    tracking_number character varying(255),
    estimated_delivery_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    order_type character varying(20) DEFAULT 'mixed'::character varying,
    digital_items_count integer DEFAULT 0,
    physical_items_count integer DEFAULT 0,
    shipping_method_id integer,
    shipping_zone_id integer,
    CONSTRAINT orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['digital_only'::character varying, 'physical_only'::character varying, 'mixed'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying, 'refunded'::character varying])::text[])))
);


--
-- TOC entry 246 (class 1259 OID 17605)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6290 (class 0 OID 0)
-- Dependencies: 246
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 339 (class 1259 OID 19055)
-- Name: page_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_content (
    id integer NOT NULL,
    page_type character varying(50) NOT NULL,
    hero_title text,
    hero_subtitle text,
    hero_background_image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 338 (class 1259 OID 19054)
-- Name: page_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.page_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6291 (class 0 OID 0)
-- Dependencies: 338
-- Name: page_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.page_content_id_seq OWNED BY public.page_content.id;


--
-- TOC entry 327 (class 1259 OID 18860)
-- Name: payment_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_analytics (
    id integer NOT NULL,
    gateway_type character varying(50) NOT NULL,
    date date NOT NULL,
    total_transactions integer DEFAULT 0,
    successful_transactions integer DEFAULT 0,
    failed_transactions integer DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    successful_amount numeric(12,2) DEFAULT 0,
    failed_amount numeric(12,2) DEFAULT 0,
    average_transaction_time integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 6292 (class 0 OID 0)
-- Dependencies: 327
-- Name: TABLE payment_analytics; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_analytics IS 'Daily payment analytics and metrics';


--
-- TOC entry 326 (class 1259 OID 18859)
-- Name: payment_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6293 (class 0 OID 0)
-- Dependencies: 326
-- Name: payment_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_analytics_id_seq OWNED BY public.payment_analytics.id;


--
-- TOC entry 331 (class 1259 OID 18906)
-- Name: payment_gateway_tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_gateway_tests (
    id integer NOT NULL,
    gateway_type character varying(50) NOT NULL,
    test_type character varying(50) NOT NULL,
    test_amount numeric(10,2),
    test_currency character varying(3),
    status character varying(20) NOT NULL,
    result jsonb,
    error_message text,
    response_time integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    CONSTRAINT payment_gateway_tests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'passed'::character varying, 'failed'::character varying])::text[])))
);


--
-- TOC entry 6294 (class 0 OID 0)
-- Dependencies: 331
-- Name: TABLE payment_gateway_tests; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_gateway_tests IS 'Stores payment gateway test results';


--
-- TOC entry 330 (class 1259 OID 18905)
-- Name: payment_gateway_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_gateway_tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6295 (class 0 OID 0)
-- Dependencies: 330
-- Name: payment_gateway_tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_gateway_tests_id_seq OWNED BY public.payment_gateway_tests.id;


--
-- TOC entry 299 (class 1259 OID 18365)
-- Name: payment_gateways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_gateways (
    id integer NOT NULL,
    gateway_id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    enabled boolean DEFAULT false,
    test_mode boolean DEFAULT true,
    public_key text,
    secret_key text,
    webhook_secret text,
    hash text,
    status character varying(20) DEFAULT 'inactive'::character varying,
    supported_currencies text[],
    supported_payment_methods text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    icon character varying(100),
    features text[],
    config jsonb DEFAULT '{}'::jsonb,
    type character varying(50) DEFAULT 'online'::character varying,
    sort_order integer DEFAULT 0,
    is_manual_gateway boolean DEFAULT false,
    webhook_url character varying(500),
    test_webhook_url character varying(500),
    last_webhook_test timestamp without time zone,
    webhook_test_status character varying(20),
    transaction_count integer DEFAULT 0,
    success_rate numeric(5,2) DEFAULT 0,
    average_response_time integer DEFAULT 0,
    CONSTRAINT payment_gateways_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'error'::character varying, 'testing'::character varying])::text[])))
);


--
-- TOC entry 298 (class 1259 OID 18364)
-- Name: payment_gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_gateways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6296 (class 0 OID 0)
-- Dependencies: 298
-- Name: payment_gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_gateways_id_seq OWNED BY public.payment_gateways.id;


--
-- TOC entry 333 (class 1259 OID 18917)
-- Name: payment_method_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_method_preferences (
    id integer NOT NULL,
    user_id integer,
    gateway_type character varying(50) NOT NULL,
    is_preferred boolean DEFAULT false,
    last_used timestamp without time zone,
    success_count integer DEFAULT 0,
    failure_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 6297 (class 0 OID 0)
-- Dependencies: 333
-- Name: TABLE payment_method_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_method_preferences IS 'User payment method preferences';


--
-- TOC entry 332 (class 1259 OID 18916)
-- Name: payment_method_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_method_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6298 (class 0 OID 0)
-- Dependencies: 332
-- Name: payment_method_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_method_preferences_id_seq OWNED BY public.payment_method_preferences.id;


--
-- TOC entry 387 (class 1259 OID 19514)
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_proofs (
    id integer NOT NULL,
    bank_transfer_id integer,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    file_type character varying(50),
    upload_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    verified_by integer,
    verified_at timestamp without time zone,
    admin_notes text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_proofs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[])))
);


--
-- TOC entry 386 (class 1259 OID 19513)
-- Name: payment_proofs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_proofs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6299 (class 0 OID 0)
-- Dependencies: 386
-- Name: payment_proofs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_proofs_id_seq OWNED BY public.payment_proofs.id;


--
-- TOC entry 329 (class 1259 OID 18885)
-- Name: payment_refunds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_refunds (
    id integer NOT NULL,
    refund_id character varying(255) NOT NULL,
    transaction_id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    gateway_response jsonb,
    processed_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_refunds_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- TOC entry 6300 (class 0 OID 0)
-- Dependencies: 329
-- Name: TABLE payment_refunds; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_refunds IS 'Tracks payment refunds';


--
-- TOC entry 328 (class 1259 OID 18884)
-- Name: payment_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_refunds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6301 (class 0 OID 0)
-- Dependencies: 328
-- Name: payment_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_refunds_id_seq OWNED BY public.payment_refunds.id;


--
-- TOC entry 303 (class 1259 OID 18439)
-- Name: payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_settings (
    id integer NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 302 (class 1259 OID 18438)
-- Name: payment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6302 (class 0 OID 0)
-- Dependencies: 302
-- Name: payment_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_settings_id_seq OWNED BY public.payment_settings.id;


--
-- TOC entry 335 (class 1259 OID 18952)
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id integer NOT NULL,
    transaction_id character varying(255) NOT NULL,
    order_id character varying(255) NOT NULL,
    user_id integer,
    gateway_type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'NGN'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    gateway_response jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gateway_id character varying(50),
    CONSTRAINT payment_transactions_gateway_type_check CHECK (((gateway_type)::text = ANY ((ARRAY['flutterwave'::character varying, 'bank_transfer'::character varying, 'paystack'::character varying, 'stripe'::character varying, 'paypal'::character varying, 'square'::character varying])::text[]))),
    CONSTRAINT payment_transactions_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying, 'refunded'::character varying, 'expired'::character varying])::text[])))
);


--
-- TOC entry 334 (class 1259 OID 18951)
-- Name: payment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6303 (class 0 OID 0)
-- Dependencies: 334
-- Name: payment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_transactions_id_seq OWNED BY public.payment_transactions.id;


--
-- TOC entry 269 (class 1259 OID 17974)
-- Name: payment_webhooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_webhooks (
    id integer NOT NULL,
    gateway_id character varying(50) NOT NULL,
    event_id character varying(100) NOT NULL,
    event_type character varying(100) NOT NULL,
    payload jsonb NOT NULL,
    processed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 6304 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE payment_webhooks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.payment_webhooks IS 'Stores webhook events from payment gateways';


--
-- TOC entry 268 (class 1259 OID 17973)
-- Name: payment_webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6305 (class 0 OID 0)
-- Dependencies: 268
-- Name: payment_webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_webhooks_id_seq OWNED BY public.payment_webhooks.id;


--
-- TOC entry 222 (class 1259 OID 16961)
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    resource character varying(50) NOT NULL,
    action character varying(50) NOT NULL,
    scope character varying(20) DEFAULT 'global'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT permissions_scope_check CHECK (((scope)::text = ANY ((ARRAY['global'::character varying, 'user'::character varying, 'organization'::character varying])::text[])))
);


--
-- TOC entry 221 (class 1259 OID 16960)
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6306 (class 0 OID 0)
-- Dependencies: 221
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- TOC entry 313 (class 1259 OID 18536)
-- Name: public_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.public_pages (
    id integer NOT NULL,
    page_type character varying(50) NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 312 (class 1259 OID 18535)
-- Name: public_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.public_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6307 (class 0 OID 0)
-- Dependencies: 312
-- Name: public_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.public_pages_id_seq OWNED BY public.public_pages.id;


--
-- TOC entry 379 (class 1259 OID 19408)
-- Name: reading_goal_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_goal_progress (
    id integer NOT NULL,
    goal_id integer,
    user_id integer,
    date date NOT NULL,
    value integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 378 (class 1259 OID 19407)
-- Name: reading_goal_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_goal_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6308 (class 0 OID 0)
-- Dependencies: 378
-- Name: reading_goal_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_goal_progress_id_seq OWNED BY public.reading_goal_progress.id;


--
-- TOC entry 291 (class 1259 OID 18231)
-- Name: reading_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_goals (
    id integer NOT NULL,
    user_id integer,
    goal_type character varying(50) NOT NULL,
    target_value integer NOT NULL,
    current_value integer DEFAULT 0,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reading_goals_goal_type_check CHECK (((goal_type)::text = ANY ((ARRAY['annual_books'::character varying, 'monthly_pages'::character varying, 'reading_streak'::character varying, 'daily_hours'::character varying])::text[])))
);


--
-- TOC entry 290 (class 1259 OID 18230)
-- Name: reading_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6309 (class 0 OID 0)
-- Dependencies: 290
-- Name: reading_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_goals_id_seq OWNED BY public.reading_goals.id;


--
-- TOC entry 373 (class 1259 OID 19337)
-- Name: reading_highlights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_highlights (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    page_number integer NOT NULL,
    highlight_text text NOT NULL,
    start_position integer,
    end_position integer,
    color character varying(7) DEFAULT '#FFD700'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 372 (class 1259 OID 19336)
-- Name: reading_highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_highlights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6310 (class 0 OID 0)
-- Dependencies: 372
-- Name: reading_highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_highlights_id_seq OWNED BY public.reading_highlights.id;


--
-- TOC entry 315 (class 1259 OID 18555)
-- Name: reading_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_notes (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    page_number integer,
    chapter_title character varying(255),
    note_type character varying(50) DEFAULT 'general'::character varying,
    content text NOT NULL,
    color character varying(20) DEFAULT '#3B82F6'::character varying,
    is_public boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reading_notes_note_type_check CHECK (((note_type)::text = ANY ((ARRAY['general'::character varying, 'highlight'::character varying, 'bookmark'::character varying, 'question'::character varying, 'insight'::character varying])::text[])))
);


--
-- TOC entry 314 (class 1259 OID 18554)
-- Name: reading_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6311 (class 0 OID 0)
-- Dependencies: 314
-- Name: reading_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_notes_id_seq OWNED BY public.reading_notes.id;


--
-- TOC entry 253 (class 1259 OID 17691)
-- Name: reading_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_progress (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    current_page integer DEFAULT 0,
    total_pages integer,
    progress_percentage numeric(5,2) DEFAULT 0,
    last_read_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 252 (class 1259 OID 17690)
-- Name: reading_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6312 (class 0 OID 0)
-- Dependencies: 252
-- Name: reading_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_progress_id_seq OWNED BY public.reading_progress.id;


--
-- TOC entry 375 (class 1259 OID 19359)
-- Name: reading_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_sessions (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    session_start timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    session_end timestamp without time zone,
    pages_read integer DEFAULT 0,
    reading_time_minutes integer DEFAULT 0,
    reading_speed_pages_per_hour numeric(8,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 374 (class 1259 OID 19358)
-- Name: reading_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6313 (class 0 OID 0)
-- Dependencies: 374
-- Name: reading_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_sessions_id_seq OWNED BY public.reading_sessions.id;


--
-- TOC entry 397 (class 1259 OID 19645)
-- Name: reading_speed_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_speed_tracking (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    session_id integer,
    page_number integer NOT NULL,
    words_on_page integer NOT NULL,
    time_spent_seconds integer NOT NULL,
    reading_speed_wpm numeric(8,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 396 (class 1259 OID 19644)
-- Name: reading_speed_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_speed_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6314 (class 0 OID 0)
-- Dependencies: 396
-- Name: reading_speed_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_speed_tracking_id_seq OWNED BY public.reading_speed_tracking.id;


--
-- TOC entry 377 (class 1259 OID 19389)
-- Name: reading_streaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reading_streaks (
    id integer NOT NULL,
    user_id integer,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_read_date date,
    streak_start_date date,
    total_reading_days integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 376 (class 1259 OID 19388)
-- Name: reading_streaks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reading_streaks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6315 (class 0 OID 0)
-- Dependencies: 376
-- Name: reading_streaks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reading_streaks_id_seq OWNED BY public.reading_streaks.id;


--
-- TOC entry 226 (class 1259 OID 17001)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer,
    permission_id integer,
    granted_by integer,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 225 (class 1259 OID 17000)
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6316 (class 0 OID 0)
-- Dependencies: 225
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- TOC entry 220 (class 1259 OID 16947)
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    priority integer DEFAULT 0,
    is_system_role boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 219 (class 1259 OID 16946)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6317 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 271 (class 1259 OID 17992)
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    session_token character varying(255) NOT NULL,
    user_id integer,
    expires_at timestamp without time zone NOT NULL,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 270 (class 1259 OID 17991)
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6318 (class 0 OID 0)
-- Dependencies: 270
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- TOC entry 337 (class 1259 OID 19002)
-- Name: shipping_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_details (
    id integer NOT NULL,
    order_id integer,
    recipient_name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20),
    country character varying(100) DEFAULT 'Nigeria'::character varying,
    shipping_method character varying(100),
    tracking_number character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying,
    shipped_at timestamp without time zone,
    delivered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shipping_details_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'failed'::character varying])::text[])))
);


--
-- TOC entry 336 (class 1259 OID 19001)
-- Name: shipping_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6319 (class 0 OID 0)
-- Dependencies: 336
-- Name: shipping_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_details_id_seq OWNED BY public.shipping_details.id;


--
-- TOC entry 409 (class 1259 OID 19779)
-- Name: shipping_method_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_method_zones (
    id integer NOT NULL,
    shipping_method_id integer,
    shipping_zone_id integer,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 408 (class 1259 OID 19778)
-- Name: shipping_method_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_method_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6320 (class 0 OID 0)
-- Dependencies: 408
-- Name: shipping_method_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_method_zones_id_seq OWNED BY public.shipping_method_zones.id;


--
-- TOC entry 257 (class 1259 OID 17763)
-- Name: shipping_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_methods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    base_cost numeric(10,2) DEFAULT 0,
    cost_per_item numeric(10,2) DEFAULT 0,
    free_shipping_threshold numeric(10,2),
    estimated_days_min integer,
    estimated_days_max integer,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 256 (class 1259 OID 17762)
-- Name: shipping_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6321 (class 0 OID 0)
-- Dependencies: 256
-- Name: shipping_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_methods_id_seq OWNED BY public.shipping_methods.id;


--
-- TOC entry 307 (class 1259 OID 18479)
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_rates (
    id integer NOT NULL,
    zone_id integer,
    method_id integer,
    min_order_value numeric(10,2) DEFAULT 0,
    max_order_value numeric(10,2) DEFAULT 999999.99,
    rate numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 306 (class 1259 OID 18478)
-- Name: shipping_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6322 (class 0 OID 0)
-- Dependencies: 306
-- Name: shipping_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_rates_id_seq OWNED BY public.shipping_rates.id;


--
-- TOC entry 305 (class 1259 OID 18467)
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_zones (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    countries text[],
    states text[],
    postal_codes text[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 304 (class 1259 OID 18466)
-- Name: shipping_zones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_zones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6323 (class 0 OID 0)
-- Dependencies: 304
-- Name: shipping_zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_zones_id_seq OWNED BY public.shipping_zones.id;


--
-- TOC entry 232 (class 1259 OID 17067)
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 231 (class 1259 OID 17066)
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6324 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- TOC entry 259 (class 1259 OID 17777)
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rates (
    id integer NOT NULL,
    country character varying(2) NOT NULL,
    state character varying(100),
    city character varying(100),
    postal_code character varying(20),
    rate numeric(5,4) NOT NULL,
    tax_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 258 (class 1259 OID 17776)
-- Name: tax_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tax_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6325 (class 0 OID 0)
-- Dependencies: 258
-- Name: tax_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tax_rates_id_seq OWNED BY public.tax_rates.id;


--
-- TOC entry 343 (class 1259 OID 19081)
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    bio text,
    image_url text,
    linkedin_url text,
    twitter_url text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 342 (class 1259 OID 19080)
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6326 (class 0 OID 0)
-- Dependencies: 342
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- TOC entry 297 (class 1259 OID 18288)
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer,
    achievement_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    icon character varying(100),
    earned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metadata jsonb
);


--
-- TOC entry 296 (class 1259 OID 18287)
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6327 (class 0 OID 0)
-- Dependencies: 296
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- TOC entry 293 (class 1259 OID 18250)
-- Name: user_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_activity (
    id integer NOT NULL,
    user_id integer,
    activity_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    book_id integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_activity_activity_type_check CHECK (((activity_type)::text = ANY ((ARRAY['completed'::character varying, 'review'::character varying, 'started'::character varying, 'achievement'::character varying, 'purchase'::character varying, 'bookmark'::character varying, 'goal_reached'::character varying])::text[])))
);


--
-- TOC entry 292 (class 1259 OID 18249)
-- Name: user_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6328 (class 0 OID 0)
-- Dependencies: 292
-- Name: user_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_activity_id_seq OWNED BY public.user_activity.id;


--
-- TOC entry 391 (class 1259 OID 19578)
-- Name: user_bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_bookmarks (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    page_number integer NOT NULL,
    title character varying(255),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 390 (class 1259 OID 19577)
-- Name: user_bookmarks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_bookmarks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6329 (class 0 OID 0)
-- Dependencies: 390
-- Name: user_bookmarks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_bookmarks_id_seq OWNED BY public.user_bookmarks.id;


--
-- TOC entry 395 (class 1259 OID 19623)
-- Name: user_highlights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_highlights (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    page_number integer NOT NULL,
    start_position integer NOT NULL,
    end_position integer NOT NULL,
    highlighted_text text NOT NULL,
    highlight_color character varying(20) DEFAULT 'yellow'::character varying,
    note_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_highlights_highlight_color_check CHECK (((highlight_color)::text = ANY ((ARRAY['yellow'::character varying, 'green'::character varying, 'blue'::character varying, 'pink'::character varying, 'orange'::character varying])::text[])))
);


--
-- TOC entry 394 (class 1259 OID 19622)
-- Name: user_highlights_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_highlights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6330 (class 0 OID 0)
-- Dependencies: 394
-- Name: user_highlights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_highlights_id_seq OWNED BY public.user_highlights.id;


--
-- TOC entry 255 (class 1259 OID 17715)
-- Name: user_library; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_library (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    order_id integer,
    purchase_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_favorite boolean DEFAULT false,
    download_count integer DEFAULT 0,
    last_downloaded_at timestamp without time zone,
    reading_progress integer DEFAULT 0,
    last_read_at timestamp without time zone
);


--
-- TOC entry 254 (class 1259 OID 17714)
-- Name: user_library_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_library_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6331 (class 0 OID 0)
-- Dependencies: 254
-- Name: user_library_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_library_id_seq OWNED BY public.user_library.id;


--
-- TOC entry 393 (class 1259 OID 19600)
-- Name: user_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notes (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    page_number integer NOT NULL,
    note_text text NOT NULL,
    note_type character varying(20) DEFAULT 'general'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_notes_note_type_check CHECK (((note_type)::text = ANY ((ARRAY['general'::character varying, 'summary'::character varying, 'question'::character varying, 'insight'::character varying])::text[])))
);


--
-- TOC entry 392 (class 1259 OID 19599)
-- Name: user_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6332 (class 0 OID 0)
-- Dependencies: 392
-- Name: user_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notes_id_seq OWNED BY public.user_notes.id;


--
-- TOC entry 325 (class 1259 OID 18683)
-- Name: user_notes_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notes_tags (
    id integer NOT NULL,
    note_id integer NOT NULL,
    tag_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 324 (class 1259 OID 18682)
-- Name: user_notes_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notes_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6333 (class 0 OID 0)
-- Dependencies: 324
-- Name: user_notes_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notes_tags_id_seq OWNED BY public.user_notes_tags.id;


--
-- TOC entry 295 (class 1259 OID 18271)
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notifications (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_notifications_type_check CHECK (((type)::text = ANY ((ARRAY['achievement'::character varying, 'book'::character varying, 'social'::character varying, 'reminder'::character varying, 'system'::character varying])::text[])))
);


--
-- TOC entry 294 (class 1259 OID 18270)
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6334 (class 0 OID 0)
-- Dependencies: 294
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- TOC entry 228 (class 1259 OID 17026)
-- Name: user_permission_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_permission_cache (
    id integer NOT NULL,
    user_id integer,
    permission_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    cached_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 227 (class 1259 OID 17025)
-- Name: user_permission_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_permission_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6335 (class 0 OID 0)
-- Dependencies: 227
-- Name: user_permission_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_permission_cache_id_seq OWNED BY public.user_permission_cache.id;


--
-- TOC entry 224 (class 1259 OID 16975)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer,
    role_id integer,
    assigned_by integer,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true
);


--
-- TOC entry 223 (class 1259 OID 16974)
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6336 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- TOC entry 407 (class 1259 OID 19754)
-- Name: user_shipping_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_shipping_addresses (
    id integer NOT NULL,
    user_id integer,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(255),
    phone character varying(20),
    address_line_1 character varying(255),
    address_line_2 character varying(255),
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    country character varying(100),
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 406 (class 1259 OID 19753)
-- Name: user_shipping_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_shipping_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6337 (class 0 OID 0)
-- Dependencies: 406
-- Name: user_shipping_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_shipping_addresses_id_seq OWNED BY public.user_shipping_addresses.id;


--
-- TOC entry 218 (class 1259 OID 16929)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar_url text,
    status character varying(20) DEFAULT 'active'::character varying,
    email_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    email_verification_token character varying(255),
    email_verification_expires timestamp without time zone,
    welcome_email_sent boolean DEFAULT false,
    date_of_birth date,
    preferred_language character varying(10) DEFAULT 'en'::character varying,
    newsletter_subscription boolean DEFAULT false,
    total_orders integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0,
    is_student boolean DEFAULT false,
    matriculation_number character varying(50),
    course character varying(100),
    department character varying(100),
    school_name character varying(200),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'banned'::character varying, 'pending'::character varying])::text[])))
);


--
-- TOC entry 217 (class 1259 OID 16928)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6338 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 401 (class 1259 OID 19689)
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_items (
    id integer NOT NULL,
    user_id integer,
    book_id integer,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 400 (class 1259 OID 19688)
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 6339 (class 0 OID 0)
-- Dependencies: 400
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- TOC entry 5060 (class 2604 OID 19071)
-- Name: about_us_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_us_sections ALTER COLUMN id SET DEFAULT nextval('public.about_us_sections_id_seq'::regclass);


--
-- TOC entry 5198 (class 2604 OID 19735)
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- TOC entry 4800 (class 2604 OID 17045)
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 17483)
-- Name: authors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors ALTER COLUMN id SET DEFAULT nextval('public.authors_id_seq'::regclass);


--
-- TOC entry 5159 (class 2604 OID 19470)
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- TOC entry 5166 (class 2604 OID 19483)
-- Name: bank_transfer_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_notifications ALTER COLUMN id SET DEFAULT nextval('public.bank_transfer_notifications_id_seq'::regclass);


--
-- TOC entry 4974 (class 2604 OID 18410)
-- Name: bank_transfer_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments ALTER COLUMN id SET DEFAULT nextval('public.bank_transfer_payments_id_seq'::regclass);


--
-- TOC entry 5174 (class 2604 OID 19541)
-- Name: bank_transfer_proofs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_proofs ALTER COLUMN id SET DEFAULT nextval('public.bank_transfer_proofs_id_seq'::regclass);


--
-- TOC entry 5154 (class 2604 OID 19439)
-- Name: bank_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers ALTER COLUMN id SET DEFAULT nextval('public.bank_transfers_id_seq'::regclass);


--
-- TOC entry 4920 (class 2604 OID 18048)
-- Name: blog_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories ALTER COLUMN id SET DEFAULT nextval('public.blog_categories_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 18081)
-- Name: blog_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN id SET DEFAULT nextval('public.blog_comments_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 18064)
-- Name: blog_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_images ALTER COLUMN id SET DEFAULT nextval('public.blog_images_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 18109)
-- Name: blog_likes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes ALTER COLUMN id SET DEFAULT nextval('public.blog_likes_id_seq'::regclass);


--
-- TOC entry 4909 (class 2604 OID 18021)
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 18129)
-- Name: blog_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_views ALTER COLUMN id SET DEFAULT nextval('public.blog_views_id_seq'::regclass);


--
-- TOC entry 4835 (class 2604 OID 17559)
-- Name: book_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_reviews ALTER COLUMN id SET DEFAULT nextval('public.book_reviews_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 17533)
-- Name: book_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tags ALTER COLUMN id SET DEFAULT nextval('public.book_tags_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 17499)
-- Name: books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- TOC entry 4842 (class 2604 OID 17587)
-- Name: cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 17463)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 5075 (class 2604 OID 19110)
-- Name: company_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_stats ALTER COLUMN id SET DEFAULT nextval('public.company_stats_id_seq'::regclass);


--
-- TOC entry 5070 (class 2604 OID 19097)
-- Name: company_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_values ALTER COLUMN id SET DEFAULT nextval('public.company_values_id_seq'::regclass);


--
-- TOC entry 5085 (class 2604 OID 19134)
-- Name: contact_faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_faqs ALTER COLUMN id SET DEFAULT nextval('public.contact_faqs_id_seq'::regclass);


--
-- TOC entry 5080 (class 2604 OID 19121)
-- Name: contact_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_methods ALTER COLUMN id SET DEFAULT nextval('public.contact_methods_id_seq'::regclass);


--
-- TOC entry 5124 (class 2604 OID 19292)
-- Name: contact_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_settings ALTER COLUMN id SET DEFAULT nextval('public.contact_settings_id_seq'::regclass);


--
-- TOC entry 5090 (class 2604 OID 19147)
-- Name: contact_subjects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_subjects ALTER COLUMN id SET DEFAULT nextval('public.contact_subjects_id_seq'::regclass);


--
-- TOC entry 5119 (class 2604 OID 19272)
-- Name: contact_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions ALTER COLUMN id SET DEFAULT nextval('public.contact_submissions_id_seq'::regclass);


--
-- TOC entry 5108 (class 2604 OID 19222)
-- Name: content_blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_blocks ALTER COLUMN id SET DEFAULT nextval('public.content_blocks_id_seq'::regclass);


--
-- TOC entry 5113 (class 2604 OID 19240)
-- Name: content_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_images ALTER COLUMN id SET DEFAULT nextval('public.content_images_id_seq'::regclass);


--
-- TOC entry 5099 (class 2604 OID 19188)
-- Name: content_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_pages ALTER COLUMN id SET DEFAULT nextval('public.content_pages_id_seq'::regclass);


--
-- TOC entry 5103 (class 2604 OID 19202)
-- Name: content_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections ALTER COLUMN id SET DEFAULT nextval('public.content_sections_id_seq'::regclass);


--
-- TOC entry 5117 (class 2604 OID 19257)
-- Name: content_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_versions ALTER COLUMN id SET DEFAULT nextval('public.content_versions_id_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 17656)
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 17803)
-- Name: ecommerce_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_settings ALTER COLUMN id SET DEFAULT nextval('public.ecommerce_settings_id_seq'::regclass);


--
-- TOC entry 4944 (class 2604 OID 18205)
-- Name: email_function_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_function_assignments ALTER COLUMN id SET DEFAULT nextval('public.email_function_assignments_id_seq'::regclass);


--
-- TOC entry 4939 (class 2604 OID 18188)
-- Name: email_functions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_functions ALTER COLUMN id SET DEFAULT nextval('public.email_functions_id_seq'::regclass);


--
-- TOC entry 5193 (class 2604 OID 19712)
-- Name: email_gateways id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_gateways ALTER COLUMN id SET DEFAULT nextval('public.email_gateways_id_seq'::regclass);


--
-- TOC entry 5208 (class 2604 OID 19816)
-- Name: email_retry_queue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_retry_queue ALTER COLUMN id SET DEFAULT nextval('public.email_retry_queue_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 18168)
-- Name: email_template_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_template_categories ALTER COLUMN id SET DEFAULT nextval('public.email_template_categories_id_seq'::regclass);


--
-- TOC entry 4888 (class 2604 OID 17789)
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- TOC entry 5130 (class 2604 OID 19308)
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- TOC entry 5189 (class 2604 OID 19671)
-- Name: inventory_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions ALTER COLUMN id SET DEFAULT nextval('public.inventory_transactions_id_seq'::regclass);


--
-- TOC entry 4996 (class 2604 OID 18523)
-- Name: nigerian_lgas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_lgas ALTER COLUMN id SET DEFAULT nextval('public.nigerian_lgas_id_seq'::regclass);


--
-- TOC entry 4994 (class 2604 OID 18513)
-- Name: nigerian_states id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_states ALTER COLUMN id SET DEFAULT nextval('public.nigerian_states_id_seq'::regclass);


--
-- TOC entry 5012 (class 2604 OID 18621)
-- Name: note_shares id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares ALTER COLUMN id SET DEFAULT nextval('public.note_shares_id_seq'::regclass);


--
-- TOC entry 5010 (class 2604 OID 18601)
-- Name: note_tag_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tag_assignments ALTER COLUMN id SET DEFAULT nextval('public.note_tag_assignments_id_seq'::regclass);


--
-- TOC entry 5007 (class 2604 OID 18585)
-- Name: note_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tags ALTER COLUMN id SET DEFAULT nextval('public.note_tags_id_seq'::regclass);


--
-- TOC entry 5015 (class 2604 OID 18662)
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- TOC entry 5095 (class 2604 OID 19158)
-- Name: office_location id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.office_location ALTER COLUMN id SET DEFAULT nextval('public.office_location_id_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 17635)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 17870)
-- Name: order_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes ALTER COLUMN id SET DEFAULT nextval('public.order_notes_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 17850)
-- Name: order_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN id SET DEFAULT nextval('public.order_status_history_id_seq'::regclass);


--
-- TOC entry 4846 (class 2604 OID 17609)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 5057 (class 2604 OID 19058)
-- Name: page_content id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_content ALTER COLUMN id SET DEFAULT nextval('public.page_content_id_seq'::regclass);


--
-- TOC entry 5023 (class 2604 OID 18863)
-- Name: payment_analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics ALTER COLUMN id SET DEFAULT nextval('public.payment_analytics_id_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 18909)
-- Name: payment_gateway_tests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateway_tests ALTER COLUMN id SET DEFAULT nextval('public.payment_gateway_tests_id_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 18368)
-- Name: payment_gateways id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways ALTER COLUMN id SET DEFAULT nextval('public.payment_gateways_id_seq'::regclass);


--
-- TOC entry 5040 (class 2604 OID 18920)
-- Name: payment_method_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_method_preferences ALTER COLUMN id SET DEFAULT nextval('public.payment_method_preferences_id_seq'::regclass);


--
-- TOC entry 5169 (class 2604 OID 19517)
-- Name: payment_proofs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs ALTER COLUMN id SET DEFAULT nextval('public.payment_proofs_id_seq'::regclass);


--
-- TOC entry 5033 (class 2604 OID 18888)
-- Name: payment_refunds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds ALTER COLUMN id SET DEFAULT nextval('public.payment_refunds_id_seq'::regclass);


--
-- TOC entry 4981 (class 2604 OID 18442)
-- Name: payment_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings ALTER COLUMN id SET DEFAULT nextval('public.payment_settings_id_seq'::regclass);


--
-- TOC entry 5046 (class 2604 OID 18955)
-- Name: payment_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions ALTER COLUMN id SET DEFAULT nextval('public.payment_transactions_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 17977)
-- Name: payment_webhooks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_webhooks ALTER COLUMN id SET DEFAULT nextval('public.payment_webhooks_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 16964)
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 18539)
-- Name: public_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_pages ALTER COLUMN id SET DEFAULT nextval('public.public_pages_id_seq'::regclass);


--
-- TOC entry 5151 (class 2604 OID 19411)
-- Name: reading_goal_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goal_progress ALTER COLUMN id SET DEFAULT nextval('public.reading_goal_progress_id_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 18234)
-- Name: reading_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goals ALTER COLUMN id SET DEFAULT nextval('public.reading_goals_id_seq'::regclass);


--
-- TOC entry 5136 (class 2604 OID 19340)
-- Name: reading_highlights id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_highlights ALTER COLUMN id SET DEFAULT nextval('public.reading_highlights_id_seq'::regclass);


--
-- TOC entry 5001 (class 2604 OID 18558)
-- Name: reading_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_notes ALTER COLUMN id SET DEFAULT nextval('public.reading_notes_id_seq'::regclass);


--
-- TOC entry 4868 (class 2604 OID 17694)
-- Name: reading_progress id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress ALTER COLUMN id SET DEFAULT nextval('public.reading_progress_id_seq'::regclass);


--
-- TOC entry 5140 (class 2604 OID 19362)
-- Name: reading_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions ALTER COLUMN id SET DEFAULT nextval('public.reading_sessions_id_seq'::regclass);


--
-- TOC entry 5187 (class 2604 OID 19648)
-- Name: reading_speed_tracking id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_speed_tracking ALTER COLUMN id SET DEFAULT nextval('public.reading_speed_tracking_id_seq'::regclass);


--
-- TOC entry 5145 (class 2604 OID 19392)
-- Name: reading_streaks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_streaks ALTER COLUMN id SET DEFAULT nextval('public.reading_streaks_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 17004)
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 16950)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 17995)
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- TOC entry 5052 (class 2604 OID 19005)
-- Name: shipping_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_details ALTER COLUMN id SET DEFAULT nextval('public.shipping_details_id_seq'::regclass);


--
-- TOC entry 5205 (class 2604 OID 19782)
-- Name: shipping_method_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_method_zones ALTER COLUMN id SET DEFAULT nextval('public.shipping_method_zones_id_seq'::regclass);


--
-- TOC entry 4879 (class 2604 OID 17766)
-- Name: shipping_methods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_methods ALTER COLUMN id SET DEFAULT nextval('public.shipping_methods_id_seq'::regclass);


--
-- TOC entry 4988 (class 2604 OID 18482)
-- Name: shipping_rates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates ALTER COLUMN id SET DEFAULT nextval('public.shipping_rates_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 18470)
-- Name: shipping_zones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_zones ALTER COLUMN id SET DEFAULT nextval('public.shipping_zones_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 17070)
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 17780)
-- Name: tax_rates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates ALTER COLUMN id SET DEFAULT nextval('public.tax_rates_id_seq'::regclass);


--
-- TOC entry 5065 (class 2604 OID 19084)
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- TOC entry 4959 (class 2604 OID 18291)
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- TOC entry 4954 (class 2604 OID 18253)
-- Name: user_activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity ALTER COLUMN id SET DEFAULT nextval('public.user_activity_id_seq'::regclass);


--
-- TOC entry 5178 (class 2604 OID 19581)
-- Name: user_bookmarks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks ALTER COLUMN id SET DEFAULT nextval('public.user_bookmarks_id_seq'::regclass);


--
-- TOC entry 5184 (class 2604 OID 19626)
-- Name: user_highlights id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_highlights ALTER COLUMN id SET DEFAULT nextval('public.user_highlights_id_seq'::regclass);


--
-- TOC entry 4874 (class 2604 OID 17718)
-- Name: user_library id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library ALTER COLUMN id SET DEFAULT nextval('public.user_library_id_seq'::regclass);


--
-- TOC entry 5180 (class 2604 OID 19603)
-- Name: user_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes ALTER COLUMN id SET DEFAULT nextval('public.user_notes_id_seq'::regclass);


--
-- TOC entry 5021 (class 2604 OID 18686)
-- Name: user_notes_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes_tags ALTER COLUMN id SET DEFAULT nextval('public.user_notes_tags_id_seq'::regclass);


--
-- TOC entry 4956 (class 2604 OID 18274)
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 17029)
-- Name: user_permission_cache id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permission_cache ALTER COLUMN id SET DEFAULT nextval('public.user_permission_cache_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 16978)
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- TOC entry 5201 (class 2604 OID 19757)
-- Name: user_shipping_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shipping_addresses ALTER COLUMN id SET DEFAULT nextval('public.user_shipping_addresses_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 16932)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5191 (class 2604 OID 19692)
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- TOC entry 6159 (class 0 OID 19068)
-- Dependencies: 341
-- Data for Name: about_us_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.about_us_sections (id, section_type, title, subtitle, content, image_url, order_index, is_active, created_at, updated_at) FROM stdin;
1	mission	Our Mission	\N	At ReadnWin, we believe that reading is the foundation of personal growth and societal progress. Our mission is to make quality literature accessible to everyone, everywhere.	\N	1	t	2025-08-05 21:38:01.630472+00	2025-08-05 21:38:01.630472+00
2	story	Our Story	\N	ReadnWin was born from a simple observation: while technology was advancing rapidly, the way we read and access literature remained largely unchanged.	\N	2	t	2025-08-05 21:38:01.630472+00	2025-08-05 21:38:01.630472+00
\.


--
-- TOC entry 6223 (class 0 OID 19732)
-- Dependencies: 405
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achievements (id, achievement_type, title, description, icon, condition_type, condition_value, priority, created_at) FROM stdin;
1	first_book	First Steps	Complete your first book	ri-book-open-line	books_completed	1	1	2025-08-07 23:26:11.443062
8	time_reader	Time Reader	Spend 100 hours reading	ri-time-line	total_hours	100	8	2025-08-07 23:26:12.414044
2	speed_reader	Speed Reader	Read 5 books in a month	ri-flashlight-line	books_in_month	5	1	2025-08-07 23:26:11.569083
3	diverse_reader	Diverse Reader	Read 5 different genres	ri-book-line	unique_genres	5	2	2025-08-07 23:26:11.69401
4	consistent_reader	Consistent Reader	Read for 30 days straight	ri-calendar-line	reading_streak	30	3	2025-08-07 23:26:11.853937
5	social_reader	Social Reader	Write 20 reviews	ri-chat-1-line	reviews_written	20	4	2025-08-07 23:26:11.979051
6	bookworm	Bookworm	Read 100 books total	ri-book-open-line	total_books	100	5	2025-08-07 23:26:12.10471
22	marathon_reader	Marathon Reader	Read for 5 hours in a single day	ri-time-line	hours_in_day	5	6	2025-08-08 07:03:57.330509
23	reviewer_expert	Review Expert	Get 50 helpful votes on reviews	ri-star-line	helpful_votes	50	7	2025-08-08 07:03:57.520487
24	genre_explorer	Genre Explorer	Read books from 10 different genres	ri-compass-line	unique_genres	10	8	2025-08-08 07:03:57.65066
25	early_bird	Early Bird	Read for 7 consecutive days	ri-sun-line	reading_streak	7	9	2025-08-08 07:03:57.945587
7	page_turner	Page Turner	Read 1000 pages in a month	ri-file-text-line	pages_in_month	1000	10	2025-08-07 23:26:12.275028
\.


--
-- TOC entry 6048 (class 0 OID 17042)
-- Dependencies: 230
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at, admin_user_id) FROM stdin;
1	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 21:55:44.995691	\N
2	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:03:47.292456	\N
3	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:16:29.244931	\N
4	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:28:31.005133	\N
5	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:31:00.93521	\N
6	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:45:45.052397	\N
7	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:46:20.052792	\N
8	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:09.646663	\N
9	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:10.500203	\N
10	1	roles.permissions.read	roles	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:19.060202	\N
11	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:33.701333	\N
12	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:34.420318	\N
13	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:47:35.428208	\N
14	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 22:52:16.55607	\N
15	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:52:27.453997	\N
16	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:52:27.90069	\N
17	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:52:27.916887	\N
18	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:52:29.98829	\N
19	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:53:07.905157	\N
20	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:53:07.916142	\N
21	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:53:08.317848	\N
22	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:53:08.701743	\N
23	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 22:53:10.63635	\N
24	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 23:20:09.364093	\N
25	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-30 23:21:47.64512	\N
26	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 23:21:56.68419	\N
27	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 23:21:56.685471	\N
28	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 23:21:57.772177	\N
29	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 23:21:59.628163	\N
30	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-30 23:22:01.252118	\N
31	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 08:49:14.065685	\N
32	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 09:37:15.747418	\N
34	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 11:14:34.837784	\N
35	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:14.827539	\N
36	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:15.119781	\N
37	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:17.505132	\N
38	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:17.911681	\N
39	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:18.506117	\N
40	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:15:19.899841	\N
41	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:16:03.689951	\N
42	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 11:43:37.756575	\N
43	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:43:56.748925	\N
44	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:44:00.055695	\N
45	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:44:00.493788	\N
46	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:44:03.684791	\N
47	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:44:04.423902	\N
48	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 11:44:05.196608	\N
49	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 12:04:34.814565	\N
50	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 12:04:58.356777	\N
51	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 12:11:30.155893	\N
52	1	content.update	books	10	{"title": "Dune", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 12:48:40.043189	\N
53	1	content.delete	books	5	{"book_id": 5}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 12:48:46.822144	\N
54	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 12:53:49.823846	\N
55	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 15:10:51.920635	\N
56	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 15:11:17.410606	\N
57	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-07-31 15:11:38.646525	\N
58	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 16:41:41.873701	\N
59	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-07-31 20:32:24.695865	\N
60	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 07:44:48.585296	\N
61	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 09:51:03.924346	\N
62	1	content.update	books	11	{"title": "The Hobbit", "changes": {"is_featured": false}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:06:49.334519	\N
63	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 10:27:47.826518	\N
64	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:10.705431	\N
65	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:49.287778	\N
66	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:49.485573	\N
67	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:53.002653	\N
68	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:54.0217	\N
69	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:30:55.519288	\N
70	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:34:48.126379	\N
71	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:34:49.446481	\N
72	1	roles.permissions.read	roles	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:35:05.350358	\N
73	1	roles.permissions.read	roles	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:35:06.313565	\N
74	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:50:11.310662	\N
75	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:54:57.162395	\N
76	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:54:57.291566	\N
77	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:54:58.177652	\N
78	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:14.441825	\N
79	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:14.700643	\N
80	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:18.028846	\N
81	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:47.923571	\N
82	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:48.173728	\N
83	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:50.07368	\N
84	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:51.430864	\N
85	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 10:55:52.111377	\N
86	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:02:59.099921	\N
122	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:07.664679	\N
87	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:02:59.179785	\N
88	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:03:00.666897	\N
89	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:03:03.154828	\N
90	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:03:03.944184	\N
91	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 11:18:11.669847	\N
92	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:25.73042	\N
93	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:26.036919	\N
94	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:26.860876	\N
95	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:28.700872	\N
96	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:29.280331	\N
97	1	users.update	users	1	{"email": "admin@readnwin.com", "status": "active", "username": "admin", "last_name": "Administrator", "first_name": "System"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:51.849867	\N
98	1	users.roles.update	users	1	{"userId": 1, "role_ids": [1], "previous_roles": [1]}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:53.081826	\N
99	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:53.770862	\N
100	1	users.update	users	1	{"email": "admin@readnwin.com", "status": "active", "username": "admin", "last_name": "Administrator", "first_name": "System"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:54.100886	\N
101	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:54.360899	\N
102	1	users.roles.update	users	1	{"userId": 1, "role_ids": [1], "previous_roles": [1]}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:54.880806	\N
103	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:55.510836	\N
104	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:18:56.151391	\N
105	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:26:43.976733	\N
106	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:26:44.114126	\N
107	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:26:47.226744	\N
108	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:26:53.154721	\N
109	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:29:28.428745	\N
110	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:29:29.52859	\N
111	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:29:30.476766	\N
112	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:29:31.69145	\N
113	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:29:32.721732	\N
114	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:30:04.370721	\N
115	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:30:06.872698	\N
116	1	roles.permissions.read	roles	6	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:30:14.758828	\N
117	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:31:57.27972	\N
118	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:31:58.274953	\N
119	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:31:58.868688	\N
120	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:31:59.712768	\N
274	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 21:38:21.548946	\N
121	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:00.896716	\N
123	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:07.983527	\N
125	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:09.059589	\N
126	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:10.4497	\N
124	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 11:32:08.915679	\N
127	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:18.78555	\N
128	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:19.640131	\N
129	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:19.748236	\N
130	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:21.109676	\N
131	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:22.862202	\N
132	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:27.643839	\N
133	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:14:30.349578	\N
134	1	roles.permissions.read	roles	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:16.970072	\N
135	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:43.098856	\N
136	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:43.274466	\N
137	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:45.369907	\N
138	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:45.370437	\N
139	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:49.833948	\N
140	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:52.24398	\N
141	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:53.338664	\N
142	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:53.497927	\N
143	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:55.161777	\N
144	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:15:56.889714	\N
145	1	content.delete	books	11	{"book_id": 11}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 12:28:19.402973	\N
146	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 13:09:14.862866	\N
147	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 13:22:53.202717	\N
148	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:09.211298	\N
149	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:09.213414	\N
150	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:11.229781	\N
151	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:13.403112	\N
152	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:14.537955	\N
153	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:16.3381	\N
154	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:17.357868	\N
155	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:23:39.842968	\N
156	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:38:19.415487	\N
157	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:38:19.472786	\N
158	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:38:20.07577	\N
159	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:38:22.638664	\N
160	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 13:38:24.602679	\N
161	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:33:22.288107	\N
162	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:33:22.531977	\N
163	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:33:23.333431	\N
164	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:33:26.911857	\N
165	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:33:30.395573	\N
166	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:35:30.410569	\N
167	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 14:35:30.423372	\N
168	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 15:07:41.676006	\N
169	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:08:01.749937	\N
170	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:08:04.528088	\N
171	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:08:58.47406	\N
172	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:08:58.508404	\N
173	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:09:02.717695	\N
174	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:09:03.145272	\N
175	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:09:04.171922	\N
176	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:09:04.423587	\N
177	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:09:05.365493	\N
178	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:41:08.167229	\N
179	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:41:08.449343	\N
180	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:41:11.369356	\N
181	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:41:11.620862	\N
182	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:41:12.334246	\N
183	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:42:56.601706	\N
184	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:42:57.572696	\N
185	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:42:58.020874	\N
186	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:42:58.947001	\N
187	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 15:42:59.729757	\N
188	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:11:55.209055	\N
189	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:11:55.529385	\N
190	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:11:57.122424	\N
191	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:11:59.13055	\N
192	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:12:01.386005	\N
193	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:13:23.115604	\N
194	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:39.19672	\N
1322	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 18:06:56.961124	\N
195	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:39.220733	\N
196	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:43.357766	\N
197	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:43.368408	\N
198	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:48.24117	\N
199	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:48.371127	\N
201	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:52.196041	\N
204	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:55.927501	\N
205	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:57.38368	\N
200	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:52.026902	\N
202	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:53.21286	\N
203	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:35:55.378795	\N
206	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:39:23.057234	\N
207	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:42:43.200794	\N
208	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:42:43.35097	\N
209	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:42:49.715878	\N
210	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:42:50.177638	\N
211	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:43:01.010512	\N
212	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:43:01.607244	\N
213	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:49:17.829223	\N
214	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:49:19.549514	\N
215	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:30.20667	\N
216	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:33.415292	\N
217	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:37.420192	\N
218	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:38.898372	\N
219	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:48.583325	\N
220	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:52.010117	\N
221	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:52:59.825376	\N
222	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:01.242455	\N
223	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:16.961767	\N
224	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:19.97394	\N
225	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:31.809813	\N
226	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:34.531951	\N
227	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:44.058442	\N
1323	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 18:08:57.035763	\N
228	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:53:47.431754	\N
229	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 16:54:29.801251	\N
230	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 17:08:05.571756	\N
231	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:08:24.909323	\N
232	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:08:25.981262	\N
233	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:16:52.833512	\N
234	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:16:54.069739	\N
235	1	audit_logs.list	audit_logs	\N	{"page": 2, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:17:05.430855	\N
236	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:17:10.691714	\N
237	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 17:45:00.807374	\N
238	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:01:52.57918	\N
239	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:35:43.50768	\N
240	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:42:10.385589	\N
241	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:47:35.827325	\N
242	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:52:25.684788	\N
243	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:05:11.351714	\N
244	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:18:27.848465	\N
245	1	blog_images.upload	blog_images	2	{"post_id": 2, "images_count": 3}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:20:07.146884	\N
246	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:20:09.401005	\N
247	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:27:26.687689	\N
248	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:28:08.40768	\N
249	1	blog_images.delete	blog_images	2	{"image_id": "3"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:29:32.832206	\N
250	1	blog_images.delete	blog_images	2	{"image_id": "1"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:29:36.784539	\N
251	1	blog_images.delete	blog_images	2	{"image_id": "2"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:29:53.98368	\N
252	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 19:59:24.260193	\N
253	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:13:17.125924	\N
254	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:18:32.323682	\N
255	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:19:38.42782	\N
256	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:19:38.755077	\N
257	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:19:39.854812	\N
258	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:19:42.070478	\N
259	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:19:42.748334	\N
260	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:20:16.967598	\N
261	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:20:19.426009	\N
262	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:21:31.472792	\N
263	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:23:00.18711	\N
264	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:30:28.94932	\N
1331	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 19:46:39.105984	\N
265	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:34:57.03059	\N
266	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:35:14.311975	\N
267	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:37:40.259236	\N
268	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:39:39.788136	\N
269	1	email_templates.delete	email_templates	3	{"name": "welcome_email", "slug": null}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:45:26.611193	\N
270	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:45:29.885964	\N
271	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:57:18.090471	\N
272	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:57:24.989771	\N
273	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:57:31.399545	\N
275	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:12:35.545074	\N
276	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:12:36.036298	\N
277	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:12:41.805229	\N
278	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:12:50.549222	\N
279	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:12:56.859921	\N
280	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:20:34.196527	\N
281	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:20:34.466489	\N
282	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:20:35.899366	\N
283	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:20:38.888035	\N
284	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:20:39.973228	\N
285	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:26:38.917937	\N
286	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:26:39.213714	\N
287	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 22:26:39.471102	\N
288	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-01 22:52:51.706209	\N
289	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 23:44:15.006259	\N
290	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 23:44:15.009815	\N
291	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 23:44:15.228613	\N
292	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 00:25:30.035892	\N
293	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 00:25:30.273979	\N
294	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 00:25:30.986668	\N
295	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 10:03:50.655857	\N
296	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 10:22:47.265956	\N
297	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 11:24:20.197663	\N
298	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 12:51:45.91248	\N
299	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 14:23:40.987219	\N
300	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 15:03:17.491659	\N
301	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 15:03:43.661702	\N
302	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 17:04:30.306342	\N
303	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 17:30:12.055922	\N
304	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 17:48:19.37909	\N
305	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 18:36:12.089261	\N
306	1	content.create	authors	20	{"name": "Herman Meville", "email": "admin@readnwin.com"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 18:38:09.453358	\N
307	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 19:13:18.430996	\N
308	1	content.create	books	22	{"title": "MobyDick", "author_id": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 19:46:07.839178	\N
309	1	content.update	books	22	{"title": "MobyDick", "changes": {"status": "published"}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 19:47:10.177011	\N
310	1	content.update	books	22	{"title": "MobyDick", "changes": {"status": "published"}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 19:47:12.159198	\N
311	1	content.update	books	22	{"title": "MobyDick", "changes": {"status": "published"}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-02 19:47:12.17667	\N
312	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 20:21:54.360301	\N
313	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 20:49:57.210674	\N
314	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 21:21:28.871157	\N
315	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-02 22:05:51.276678	\N
316	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-03 13:06:29.774224	\N
317	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-03 13:33:13.157067	\N
318	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 13:36:10.196235	\N
319	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 13:36:10.837218	\N
320	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 13:36:11.605245	\N
321	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 13:36:12.292165	\N
322	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-03 19:25:03.233963	\N
323	1	users.update	users	1	{"email": "admin@readnwin.com", "username": "admin"}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 19:44:29.056811	\N
324	1	content.create	books	23	{"title": "Moby Dick", "author_id": 20}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 20:33:56.58285	\N
325	1	content.update	books	23	{"title": "Moby Dick", "changes": {"status": "published"}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 20:34:04.807708	\N
326	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 20:34:54.166889	\N
327	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 20:34:54.892116	\N
328	\N	user.register	users	2	{"email": "peter@scaleitpro.com", "username": "Peter", "last_name": "Peter", "first_name": "Adelodun", "double_opt_in": true}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-03 20:58:10.302399	\N
329	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-04 08:38:09.396108	\N
330	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:21.610968	\N
331	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:21.800939	\N
332	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:23.160039	\N
333	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:24.886656	\N
334	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:25.351079	\N
335	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:25.360915	\N
336	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:26.2499	\N
337	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:26.257234	\N
338	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:26.258657	\N
339	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:27.276803	\N
340	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:27.280842	\N
341	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:27.43594	\N
342	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:28.343877	\N
343	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 08:42:28.350717	\N
344	1	email_functions.list	email_functions	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:48.272912	\N
345	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:48.284704	\N
346	1	email_templates.list	email_templates	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:49.161664	\N
347	1	email_functions.list	email_functions	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:49.376917	\N
348	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:49.377243	\N
349	1	email_templates.list	email_templates	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:09:50.814111	\N
350	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:25:23.019929	\N
351	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 09:25:24.09384	\N
352	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:11:48.615663	\N
353	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:11:57.44539	\N
354	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:11:58.141189	\N
355	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:11:59.21442	\N
356	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:12:02.106223	\N
357	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:12:03.289272	\N
358	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:13:27.877554	\N
359	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:13:29.607845	\N
360	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:13:34.9998	\N
361	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:13:37.72994	\N
362	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 12:13:53.723508	\N
363	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-04 19:14:30.736154	\N
364	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:34.224676	\N
365	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:34.457763	\N
366	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:34.871999	\N
367	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:35.841012	\N
368	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:37.31294	\N
369	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:37.31437	\N
370	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:38.129208	\N
371	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:38.145636	\N
372	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:50.021087	\N
373	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:15:51.997995	\N
374	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:16:08.651996	\N
375	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:16:09.844825	\N
376	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:39.432783	\N
377	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:39.832614	\N
378	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:42.561565	\N
379	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:43.3528	\N
380	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:43.355049	\N
381	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:43.528926	\N
382	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:44.985001	\N
383	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:24:44.985486	\N
1224	1	content.delete	books	68	{"book_id": 68}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 08:32:55.678789	\N
385	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:43.745262	\N
386	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:43.914963	\N
387	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:44.456603	\N
388	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:45.979665	\N
389	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:48.066094	\N
390	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:48.248874	\N
391	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:48.665108	\N
392	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:29:48.824677	\N
393	1	library_add	user_library	23	{"reason": "Admin assignment", "bookTitle": "Moby Dick", "assignedBy": "1"}	\N	\N	2025-08-04 19:30:03.833684	\N
1234	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.177088	\N
1237	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.843967	\N
396	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:24.152765	\N
397	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:24.52093	\N
398	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:24.856709	\N
399	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:27.593674	\N
400	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:27.594706	\N
401	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:27.793313	\N
402	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:28.617062	\N
403	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:28.664847	\N
404	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:35.14558	\N
405	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:35.384794	\N
406	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:37.385894	\N
407	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:37.401482	\N
408	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:58.696635	\N
409	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:32:59.512877	\N
410	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:33:04.107673	\N
411	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-04 19:33:04.793294	\N
413	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 00:42:21.503828	\N
414	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:47:21.766652	\N
415	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:47:24.298742	\N
416	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:47:25.198896	\N
417	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:47:26.028726	\N
418	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:18.157975	\N
419	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:18.987384	\N
420	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:19.822796	\N
421	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 3009.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:21.137887	\N
422	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 1509.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:26.065462	\N
423	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:49:28.895405	\N
757	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:28.80388	\N
424	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:51:17.873876	\N
425	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:51:20.220752	\N
426	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:51:21.08078	\N
427	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:51:22.105834	\N
428	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:53:18.17032	\N
429	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:53:19.120203	\N
430	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:53:21.682529	\N
431	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:53:22.749526	\N
432	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:55:17.455504	\N
433	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:55:18.34719	\N
434	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:55:19.179568	\N
435	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:55:20.867217	\N
436	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:57:19.106891	\N
437	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:57:20.109395	\N
438	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:57:21.218757	\N
439	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:57:22.093904	\N
440	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:59:18.12441	\N
441	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:59:20.941939	\N
442	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:59:21.807153	\N
443	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 00:59:22.607089	\N
444	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:18.698805	\N
445	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:19.543998	\N
446	1	cart.access	cart	\N	{"itemCount": 2, "totalValue": 44.97}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:20.594023	\N
447	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 24.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:38.797395	\N
448	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 24.99}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:39.652421	\N
449	1	cart.access	cart	\N	{"itemCount": 0, "totalValue": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:01:42.901048	\N
450	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:02:15.39668	\N
451	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:03:18.25274	\N
452	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:03:20.597417	\N
453	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:03:21.429407	\N
454	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:03:38.8274	\N
455	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:05:18.400469	\N
456	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:05:38.82559	\N
457	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:07:40.668847	\N
458	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:11:40.673189	\N
459	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:13:40.674546	\N
460	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 01:13:41.534676	\N
461	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:14:53.263656	\N
462	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:14:59.257902	\N
463	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:15:01.643231	\N
464	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:16:14.939056	\N
465	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:16:41.182592	\N
466	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:16:49.515125	\N
467	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:16:51.4739	\N
468	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:16:52.383512	\N
469	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:18:25.877256	\N
470	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:18:48.203273	\N
471	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:20:11.159368	\N
472	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:20:48.444419	\N
473	1	cart.access	cart	\N	{"itemCount": 1, "totalValue": 1500}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:20:49.333913	\N
474	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:22:50.347879	\N
475	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:24:49.750135	\N
476	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:24:50.5421	\N
477	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:26:50.081575	\N
478	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:28:50.821519	\N
479	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:28:51.604026	\N
480	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:31:21.219222	\N
481	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:32:50.526188	\N
482	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:33:12.797039	\N
483	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:35:21.571247	\N
484	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:36:52.106851	\N
485	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:37:07.665433	\N
486	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:39:21.300376	\N
487	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:40:50.403145	\N
488	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:41:19.683453	\N
489	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:41:50.05371	\N
490	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:42:50.3368	\N
491	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:44:50.841004	\N
492	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:44:54.185549	\N
493	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:46:50.21884	\N
494	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:53:02.748499	\N
495	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:53:05.98321	\N
496	1	cart.access	cart	\N	{"itemCount": 1, "orderType": "digital_only", "totalValue": 1500, "digitalItemsCount": 1, "physicalItemsCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 09:54:49.656391	\N
497	1	library.access	library	\N	{"filter": "all", "bookCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 11:20:38.156843	\N
498	1	library.access	library	\N	{"filter": "all", "bookCount": 0}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 11:20:40.039909	\N
499	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 15:26:16.312648	\N
500	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 15:49:09.053591	\N
501	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 19:07:17.273192	\N
502	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 19:50:50.212742	\N
503	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:24.469518	\N
504	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:24.740015	\N
505	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:25.122572	\N
506	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:26.020611	\N
507	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:28.8724	\N
508	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:29.889647	\N
509	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:31.569225	\N
510	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:32.285391	\N
511	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:32.88895	\N
512	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:32.901391	\N
513	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:32.950401	\N
514	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:34.040454	\N
515	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:34.049256	\N
518	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:35.813596	\N
520	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:38.123343	\N
516	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:34.279803	\N
517	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:35.019004	\N
519	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:12:38.110997	\N
521	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:36.698713	\N
522	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:37.008725	\N
523	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:37.541883	\N
524	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:37.907429	\N
525	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:38.901311	\N
526	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:39.073365	\N
527	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:39.29297	\N
528	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:39.332029	\N
529	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:39.744197	\N
530	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:39.750199	\N
531	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:40.289255	\N
532	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:40.292704	\N
533	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:41.083996	\N
534	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:41.264414	\N
535	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:41.280117	\N
536	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:41.750839	\N
537	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:42.0053	\N
538	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:13:42.013536	\N
539	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:14.413671	\N
540	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:14.596858	\N
541	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:17.384835	\N
542	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:17.549217	\N
543	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:18.025212	\N
544	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:18.255425	\N
545	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:18.273754	\N
546	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:18.71009	\N
547	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:18.968682	\N
548	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:19.111457	\N
549	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:19.832206	\N
550	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:20.597866	\N
551	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:20.601047	\N
552	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:20.608455	\N
553	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:20.784213	\N
554	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:22.268071	\N
555	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:22.270431	\N
556	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:17:22.277745	\N
557	1	email_functions.list	email_functions	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:36.982459	\N
558	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:36.99	\N
559	1	email_templates.list	email_templates	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:37.439608	\N
560	1	email_functions.list	email_functions	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:38.975547	\N
561	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:38.982713	\N
562	1	email_templates.list	email_templates	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:18:39.310441	\N
563	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:18.678697	\N
564	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:18.943259	\N
565	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:19.479518	\N
566	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:19.959105	\N
567	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:21.364056	\N
568	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:21.433103	\N
569	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:21.463314	\N
570	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:22.066511	\N
571	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:22.130316	\N
572	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:22.290129	\N
573	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:22.303814	\N
574	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.003727	\N
575	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.039299	\N
576	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.143762	\N
577	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.165174	\N
578	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.796643	\N
579	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.907655	\N
580	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:25:23.91057	\N
581	1	blog_posts.list	blog_posts	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:28:15.621904	\N
582	1	blog_posts.list	blog_posts	\N	{}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:28:16.381205	\N
583	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:33:57.42548	\N
584	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:33:57.449309	\N
585	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:33:58.484149	\N
586	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:00.497939	\N
587	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:00.507562	\N
588	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:00.658511	\N
589	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:00.669389	\N
590	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:01.664135	\N
591	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:01.672361	\N
594	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:02.730682	\N
592	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:01.698613	\N
596	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:02.740781	\N
599	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:04.008226	\N
593	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:01.853151	\N
597	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:02.894466	\N
600	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:04.009707	\N
595	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:02.736305	\N
598	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:03.993715	\N
601	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:45.703352	\N
602	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:46.084598	\N
603	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:46.477716	\N
604	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:47.647694	\N
605	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:48.022741	\N
606	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:49.826652	\N
607	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:49.827672	\N
608	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:53.230061	\N
609	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:53.239262	\N
610	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:54.454862	\N
611	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:55.70443	\N
612	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:56.95724	\N
613	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:57.583232	\N
614	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:34:57.781251	\N
615	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:35:01.909079	\N
616	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:35:02.095486	\N
617	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:35:02.121825	\N
618	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:35:02.375314	\N
619	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:35:05.958247	\N
620	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:40.325702	\N
621	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:40.884145	\N
622	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:41.090227	\N
623	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:42.394514	\N
624	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:44.312183	\N
625	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:44.62522	\N
626	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:45.078553	\N
627	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:47.597085	\N
628	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:47.632082	\N
629	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:47.647348	\N
630	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:47.836431	\N
631	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:48.812413	\N
632	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:48.817384	\N
633	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:48.817338	\N
634	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:48.991219	\N
638	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:50.100432	\N
639	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:50.94534	\N
635	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:49.91772	\N
640	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:50.952932	\N
636	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:49.922189	\N
637	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:49.932521	\N
641	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:36:50.962677	\N
642	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:39:08.390396	\N
643	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:39:08.391432	\N
644	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:39:09.409678	\N
645	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 21:39:09.417563	\N
646	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 22:02:00.421711	\N
647	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:52.991036	\N
648	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:53.029553	\N
649	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:53.68073	\N
650	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:53.924456	\N
651	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:55.673118	\N
652	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:55.777261	\N
653	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:55.788877	\N
654	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:56.11416	\N
655	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:56.304092	\N
656	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:56.434023	\N
657	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:56.482843	\N
658	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:56.927637	\N
659	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.019716	\N
660	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.087041	\N
661	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.147674	\N
662	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.718745	\N
663	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.725194	\N
664	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:05:57.837581	\N
665	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:06:28.161661	\N
666	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:06:28.325841	\N
667	1	permissions.list	permissions	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:06:28.800012	\N
668	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:06:28.950917	\N
669	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:21.352706	\N
670	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:21.886559	\N
671	1	roles.list	roles	\N	\N	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:22.023302	\N
672	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:24.397355	\N
673	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:24.400833	\N
674	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:24.447207	\N
675	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:24.811219	\N
676	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:25.496941	\N
680	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:26.426668	\N
677	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:25.517181	\N
681	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:26.451701	\N
684	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:27.338743	\N
678	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:25.523331	\N
682	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:26.45854	\N
685	1	users.roles.read	users	2	{"userId": 2}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:27.347081	\N
679	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:25.719739	\N
683	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:26.619018	\N
686	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1/32	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 22:25:27.347423	\N
687	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-05 22:59:40.173581	\N
688	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:28.523766	\N
689	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:28.887702	\N
690	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:29.975518	\N
691	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:31.787371	\N
692	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:31.872537	\N
693	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:32.019696	\N
694	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:32.579278	\N
695	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:32.623573	\N
696	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:32.812241	\N
697	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:38.025727	\N
698	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:38.583789	\N
699	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:41.971982	\N
700	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-05 23:38:43.028798	\N
701	1	blog_posts.list	blog_posts	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 00:02:14.487888	\N
702	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 07:50:31.80844	\N
703	1	content.create	books	31	{"title": "Moby Dick", "author_id": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 07:53:37.990186	\N
704	1	content.update	books	31	{"title": "Moby Dick", "changes": {"status": "published"}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 07:53:47.779142	\N
705	1	content.delete	books	39	{"book_id": 39}	127.0.0.1/32	test-agent	2025-08-06 08:20:04.073201	\N
706	1	content.create	books	40	{"title": "Moby Dick", "author_id": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 08:20:12.130251	\N
707	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 08:40:16.682578	\N
708	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:50.530129	\N
709	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:50.674701	\N
710	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:52.644251	\N
711	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.022665	\N
712	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.030661	\N
713	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.040945	\N
714	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.574865	\N
715	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.604537	\N
716	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:41:53.605419	\N
717	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:42:14.504564	\N
718	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:42:14.634566	\N
719	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:42:16.204557	\N
720	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:51.365404	\N
721	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:51.575521	\N
722	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:53.494351	\N
723	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:53.496349	\N
724	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:53.536291	\N
725	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:53.537483	\N
726	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:54.054591	\N
727	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:54.074366	\N
728	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 09:43:54.075185	\N
729	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 10:40:22.374417	\N
730	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:32.23695	\N
731	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:32.499299	\N
732	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:33.531148	\N
733	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:37.011117	\N
734	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:37.012433	\N
735	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:37.013528	\N
736	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:38.191174	\N
737	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:38.199287	\N
738	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 10:53:38.200192	\N
739	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:46.279373	\N
740	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:46.404019	\N
741	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:47.178041	\N
742	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:48.736129	\N
743	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:48.736335	\N
744	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:48.738688	\N
745	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:49.313088	\N
746	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:49.328394	\N
747	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:07:49.328956	\N
748	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:14.781206	\N
749	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:14.919072	\N
750	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:15.96794	\N
751	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:17.485068	\N
752	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:17.496241	\N
753	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:17.496036	\N
755	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:18.310747	\N
754	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:18.310399	\N
756	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:12:18.311659	\N
758	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:28.945201	\N
759	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.034074	\N
760	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.052606	\N
761	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.053604	\N
762	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.067316	\N
763	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.748159	\N
764	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.787699	\N
765	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:17:31.797692	\N
766	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:52.63137	\N
767	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:52.78149	\N
768	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:53.837097	\N
769	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:55.299669	\N
770	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:55.314663	\N
771	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:55.314162	\N
772	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:55.82252	\N
773	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:56.01243	\N
774	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:19:56.028282	\N
775	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:12.913169	\N
776	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:13.091195	\N
777	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:13.857248	\N
778	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:13.901038	\N
779	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:14.472192	\N
780	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:14.842071	\N
781	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:14.857395	\N
782	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:15.459379	\N
783	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:15.495673	\N
784	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:20.694084	\N
785	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:20.839375	\N
786	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:21.725257	\N
787	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:21.725017	\N
788	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:22.260163	\N
789	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:22.61639	\N
790	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:22.628368	\N
791	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:23.212361	\N
792	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:23.239399	\N
793	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:34.734106	\N
794	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:34.754084	\N
795	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:37.574367	\N
796	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:37.589157	\N
797	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:37.590109	\N
798	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:37.591441	\N
799	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:44.602773	\N
800	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:46.186257	\N
801	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:46.19442	\N
802	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:46.359361	\N
803	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:57.119389	\N
804	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:57.281455	\N
805	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:59.161561	\N
806	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:20:59.162653	\N
807	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:10.612284	\N
808	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:10.749381	\N
809	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:11.639007	\N
810	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:11.639659	\N
811	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:12.169187	\N
812	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:12.466331	\N
813	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:12.502399	\N
814	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:13.111462	\N
815	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:21:13.161781	\N
816	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:15.733188	\N
817	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:15.734417	\N
818	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:18.141557	\N
819	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:18.142291	\N
820	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:18.21426	\N
821	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:18.214113	\N
822	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:19.784181	\N
823	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:19.784687	\N
824	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:22:19.789395	\N
825	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:50.130206	\N
826	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:50.355146	\N
827	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:52.405351	\N
828	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:52.69641	\N
829	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:52.709402	\N
830	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:52.714067	\N
831	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:53.785333	\N
832	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:53.824697	\N
833	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:27:53.829344	\N
834	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:25.474409	\N
835	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:25.679866	\N
836	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:26.704529	\N
837	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:28.710484	\N
838	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:28.711856	\N
839	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:28.712671	\N
840	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:29.569403	\N
841	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:29.570162	\N
842	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 11:46:29.570415	\N
843	1	content.update	books	57	{"title": "The Song of Achilles", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:01:58.811342	\N
844	1	content.update	books	57	{"title": "The Song of Achilles", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:01:59.876137	\N
845	1	content.update	books	57	{"title": "The Song of Achilles", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:02:00.913661	\N
846	1	content.update	books	57	{"title": "The Song of Achilles", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:02:01.420654	\N
847	1	content.update	books	58	{"title": "Sapiens", "changes": {"is_featured": false}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:02:03.246487	\N
848	1	content.update	books	58	{"title": "Sapiens", "changes": {"is_featured": true}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:02:08.567121	\N
849	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:24.154966	\N
850	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:24.271726	\N
851	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:26.798474	\N
852	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:27.386566	\N
853	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:27.387684	\N
854	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:27.390861	\N
855	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:28.489515	\N
856	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:28.490148	\N
857	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 12:28:28.490443	\N
858	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 13:20:52.121814	\N
859	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 13:26:04.732693	\N
860	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 13:47:34.834054	\N
861	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 14:26:45.82176	\N
862	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-06 14:43:57.432895	\N
863	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:07.0016	\N
902	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:03.855174	\N
864	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:07.89773	\N
865	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:22.457275	\N
866	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:22.651001	\N
867	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:23.696795	\N
868	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:25.496912	\N
869	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:25.512937	\N
870	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:25.514415	\N
871	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:26.320736	\N
872	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:26.328732	\N
873	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 14:44:26.32965	\N
874	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:49.660552	\N
875	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:49.794301	\N
876	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:51.506665	\N
877	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:53.208391	\N
878	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:53.21124	\N
879	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:53.212246	\N
880	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:57.340548	\N
881	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:57.471251	\N
882	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 21:42:57.472154	\N
883	1	content.create	books	77	{"title": "Moby Dick", "author_id": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 22:58:09.121524	\N
884	1	content.update	books	77	{"title": "Moby Dick", "changes": {"status": "published"}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 22:58:16.234416	\N
885	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 08:34:24.469037	\N
886	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 10:00:30.915425	\N
887	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 10:17:22.028765	\N
888	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 12:58:52.406464	\N
889	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:03:17.27424	\N
890	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:03:17.339318	\N
891	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:03:17.484801	\N
892	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:07:20.500338	\N
893	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:07:20.621231	\N
894	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:07:20.785245	\N
895	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:50.906664	\N
896	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:51.066175	\N
897	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:51.210285	\N
898	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:57.992272	\N
899	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:57.995278	\N
900	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:39:58.322812	\N
901	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:03.839214	\N
903	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:04.006223	\N
904	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:43.556298	\N
905	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:43.558256	\N
906	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:43.723322	\N
907	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:57.212282	\N
908	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:57.318271	\N
909	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:40:57.320595	\N
910	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:49:51.462877	\N
911	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:49:51.504345	\N
912	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:49:51.567138	\N
913	1	email_templates.test_send	email_templates	\N	{"to": "peter@scaleitpro.com", "variables": {"userName": "John Doe", "expiryDate": "14/08/2025", "offerTitle": "Special Discount", "discountCode": "SAVE20", "offerDescription": "Get 20% off on all books"}, "templateSlug": "promotional-offer"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:50:13.96428	\N
914	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:50:45.696921	\N
915	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:50:45.929547	\N
916	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:50:46.333473	\N
917	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:18.721177	\N
918	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:19.079185	\N
919	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:19.252974	\N
920	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:46.729516	\N
921	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:46.91755	\N
922	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:51:47.671541	\N
923	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:52:07.853376	\N
924	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:52:08.259567	\N
925	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:52:08.864484	\N
926	1	email_assignments.create	email_function_assignments	17	{"priority": 1, "functionId": 6, "templateId": 7}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:11.310492	\N
927	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:11.92851	\N
928	1	email_assignments.delete	email_function_assignments	\N	{"functionId": 6, "templateId": 7}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:19.758449	\N
929	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:20.392381	\N
930	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:53.85466	\N
931	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:54.195337	\N
932	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 14:59:54.550753	\N
933	1	email_templates.test_send	email_templates	\N	{"to": "adelodunpeter69@gmail.com", "variables": {"userName": "Peter", "reactivationUrl": "http://localhost:3000/reactivate-account?token=sample-token", "deactivationReason": "Account inactivity"}, "templateSlug": "account-deactivation"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:00:39.161468	\N
934	1	email_templates.test_send	email_templates	\N	{"to": "adelodunpeter69@gmail.com", "variables": {"userName": "John Doe", "reactivationUrl": "http://localhost:3000/reactivate-account?token=sample-token", "deactivationReason": "Account inactivity"}, "templateSlug": "account-deactivation"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:09:54.400653	\N
935	1	email_functions.list	email_functions	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:27:56.611542	\N
936	1	email_assignments.list	email_function_assignments	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:27:56.62249	\N
937	1	email_templates.list	email_templates	\N	{}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:27:57.62052	\N
938	1	email_templates.test_send	email_templates	\N	{"to": "adelodunpeter69@gmail.com", "variables": {"userName": "John Doe"}, "templateSlug": "welcome"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 15:28:36.886719	\N
939	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 15:55:45.942487	\N
940	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:38.819134	\N
941	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:38.933705	\N
942	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:41.463549	\N
943	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:42.915689	\N
944	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:42.916439	\N
945	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:42.924762	\N
946	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:45.151749	\N
947	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:45.252505	\N
948	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:06:45.255434	\N
949	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:25.847172	\N
950	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:26.053614	\N
1272	1	FEATURE_REVIEW	book_reviews	1	{"message": "Review featured for home page display", "is_featured": true}	unknown	\N	2025-08-08 10:52:54.657861	\N
951	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:27.248612	\N
952	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:27.259579	\N
953	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:27.262513	\N
954	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:28.08253	\N
955	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:28.105156	\N
956	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:28.419869	\N
957	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:07:29.441074	\N
958	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:44.696609	\N
959	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:44.95997	\N
960	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:50.068949	\N
961	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:50.358286	\N
962	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:50.362313	\N
963	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:50.801582	\N
964	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:52.054604	\N
965	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:52.06081	\N
966	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:10:52.545156	\N
967	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:28.028879	\N
968	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:28.060831	\N
969	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:29.150206	\N
970	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:29.213833	\N
971	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:29.88998	\N
972	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:30.172541	\N
973	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:30.174462	\N
974	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:31.006524	\N
975	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:11:31.329608	\N
976	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:07.761948	\N
977	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:07.829111	\N
978	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:08.892821	\N
979	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:09.144969	\N
980	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:10.422893	\N
981	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:10.750719	\N
982	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:10.751665	\N
983	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:11.858546	\N
984	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:12:11.860772	\N
985	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 17:34:28.213708	\N
986	1	library_bulk_add	user_library	77	{"reason": "Bulk admin assignment", "bookTitle": "Moby Dick", "assignedBy": "1", "bulkOperation": true}	\N	\N	2025-08-07 17:34:46.21418	1
1225	1	content.delete	books	7	{"book_id": 7}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 08:48:50.768281	\N
1235	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.389198	\N
1238	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:14.032444	\N
1250	1	content.delete	books	4	{"bulk_delete": true}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:29:11.075542	\N
1251	1	content.delete	books	6	{"bulk_delete": true}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:29:13.285099	\N
1260	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:54.1787	\N
1261	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:55.199689	\N
1273	1	content.create	authors	63	{"name": "Herman Melville", "email": "werga@gfmail.com"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 11:22:28.004005	\N
1280	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:13.320235	\N
1284	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:14.18054	\N
1292	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "Pride and Prejudice", "action": "added", "book_id": 1, "quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	127.0.0.1	test-agent	2025-08-08 17:22:33.21695	\N
1300	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:40.856675	\N
1303	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:41.890199	\N
1315	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:48:05.566707	\N
1324	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "Moby Dick", "action": "updated", "book_id": 77, "new_quantity": 2, "old_quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 18:09:02.084592	\N
1332	1	users.list	users	\N	{"page": 1, "limit": 100, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 19:57:04.359509	\N
1340	1	content.delete	books	77	{"bulk_delete": true}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 22:19:04.389693	\N
1346	1	permissions.list	permissions	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:03:58.318349	\N
1348	1	permissions.list	permissions	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:03:58.946486	\N
1356	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:08.879934	\N
1362	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.568596	\N
1368	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.512255	\N
1373	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:11.279203	\N
1378	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:55:55.372077	\N
1379	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:55:56.412019	\N
1380	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:55:57.327093	\N
1381	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:55:58.037129	\N
1389	1	library_add	user_library	3	{"reason": "Admin assignment", "bookTitle": "To Kill a Mockingbird", "assignedBy": "1"}	\N	\N	2025-08-12 10:57:16.52718	1
1396	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:47.837019	\N
1409	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:20.837178	\N
1411	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:21.408394	\N
1226	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 09:36:07.955258	\N
1239	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:21.886417	\N
1252	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:47:59.193694	\N
1254	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:48:10.772291	\N
1262	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:56.843143	\N
1266	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:57.598157	\N
1274	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 12:11:07.213368	\N
1281	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:13.326994	\N
1283	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:14.142788	\N
1293	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:36:00.751015	\N
1301	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:41.226939	\N
1304	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:42.086911	\N
1316	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:54:16.8329	\N
1325	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 18:10:28.284736	\N
1333	1	library_bulk_add	user_library	77	{"reason": "Bulk admin assignment", "bookTitle": "Moby Dick", "assignedBy": "1", "bulkOperation": true}	\N	\N	2025-08-08 19:57:13.486603	1
1341	1	orders.delete	orders	82	{"status": "pending", "user_id": 1, "order_number": "ORD-1754691155487-E0K3B01TD", "total_amount": "1400.00"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 22:21:40.79978	\N
1347	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:03:58.509992	\N
1349	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:03:59.157942	\N
1350	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:01.902001	\N
1357	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:08.885218	\N
1363	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.574336	\N
1369	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.512648	\N
1374	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:11.28784	\N
1382	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:37.166264	\N
1390	1	ORDER_STATUS_UPDATE	orders	135	{"new_status": "confirmed", "old_status": "pending"}	admin_dashboard	\N	2025-08-12 11:04:07.464114	\N
1397	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:48.93207	\N
1402	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:49.506988	\N
1403	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:50.240779	\N
1404	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:51.053067	\N
1410	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:20.965125	\N
1413	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:21.712018	\N
1415	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:22.514007	\N
1418	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.222077	\N
1427	\N	user.register	users	19	{"email": "peter@scaleitpro.com", "username": "Peter", "last_name": "Peter", "first_name": "Adelodun", "double_opt_in": true}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15	2025-08-12 11:08:51.363287	\N
1431	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.101662	\N
1435	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.868316	\N
1227	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:36:50.812064	\N
1228	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:36:51.840674	\N
1229	1	audit_logs.list	audit_logs	\N	{"page": 2, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:36:54.26258	\N
1240	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:22.080799	\N
1241	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:23.044554	\N
1253	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:48:05.413019	\N
1263	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:56.854853	\N
1267	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:57.621067	\N
1275	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 12:34:43.221931	\N
1285	1	content.create	books	87	{"book_title": "MobyDick"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:50:47.487794	\N
1294	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:46:20.753685	\N
1305	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:09.833406	\N
1307	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:10.897253	\N
1317	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:54:20.702371	\N
1326	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "MobyDick", "action": "added", "book_id": 87, "quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 18:10:33.214508	\N
1334	1	UPDATE_REVIEW_STATUS	book_reviews	3	{"new_values": {"status": "pending", "adminNotes": ""}, "old_values": {"status": "approved"}}	admin_dashboard	\N	2025-08-08 20:28:35.14682	\N
1335	1	UPDATE_REVIEW_STATUS	book_reviews	3	{"new_values": {"status": "approved", "adminNotes": ""}, "old_values": {"status": "pending"}}	admin_dashboard	\N	2025-08-08 20:28:42.971527	\N
1342	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "Atomic Habits", "action": "added", "book_id": 8, "quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-09 15:52:30.770128	\N
1351	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:05.481654	\N
1353	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:07.224402	\N
1358	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:08.965166	\N
1364	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.644582	\N
1370	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.513738	\N
1375	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:11.288351	\N
1383	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:37.31143	\N
1391	1	PROOF_STATUS_UPDATE	payment_proofs	8	{"new_status": "verified", "old_is_verified": false}	admin_dashboard	\N	2025-08-12 11:04:12.784487	\N
1398	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:48.94221	\N
1401	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:49.507074	\N
1405	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:51.055158	\N
1412	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:21.609074	\N
1414	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:22.342952	\N
1420	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.223017	\N
989	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 17:59:13.696867	\N
990	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:01:58.015687	\N
991	1	users.list	users	\N	{"page": 1, "limit": 12, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:01:58.160758	\N
992	1	users.list	users	\N	{"page": 1, "limit": 12, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:01:59.045644	\N
993	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:00.937765	\N
994	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:00.948764	\N
995	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:00.955814	\N
996	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:01.775805	\N
997	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:01.776268	\N
998	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:02:01.776532	\N
999	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:21.136748	\N
1000	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:21.319963	\N
1001	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:22.280036	\N
1002	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:24.376972	\N
1003	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:24.385912	\N
1004	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:24.385681	\N
1005	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:25.211883	\N
1006	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:25.290112	\N
1007	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:08:25.307979	\N
1008	1	UPDATE_REVIEW_STATUS	book_reviews	1	{"new_values": {"status": "approved", "adminNotes": "fghj"}, "old_values": {"status": "pending"}}	admin_dashboard	\N	2025-08-07 18:09:51.036717	\N
1009	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:15:52.507098	\N
1010	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:15:53.737117	\N
1011	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 18:44:54.33696	\N
1012	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:49:55.560735	\N
1013	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:49:56.610735	\N
1014	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:27.724095	\N
1015	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:27.895871	\N
1016	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:28.668787	\N
1017	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:30.610572	\N
1018	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:30.611427	\N
1019	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:30.612441	\N
1020	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:31.190483	\N
1021	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:31.308674	\N
1022	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:50:31.309268	\N
1023	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:31.468812	\N
1024	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:31.700527	\N
1025	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:32.607557	\N
1026	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.085793	\N
1027	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.10769	\N
1028	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.108666	\N
1029	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.867607	\N
1030	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.872849	\N
1031	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 18:58:34.91688	\N
1032	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:21.295517	\N
1033	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:21.448861	\N
1034	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:24.990989	\N
1035	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:25.119835	\N
1036	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:25.149904	\N
1037	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:32.669668	\N
1038	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:33.285852	\N
1039	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:33.447653	\N
1040	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:34.220793	\N
1041	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:34.237033	\N
1042	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:34.287906	\N
1043	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:34.88186	\N
1044	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:35.157479	\N
1045	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:35.160771	\N
1046	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:36.052868	\N
1047	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:02:36.090684	\N
1048	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:54.61685	\N
1049	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:54.79236	\N
1050	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:56.081779	\N
1051	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:57.984147	\N
1052	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:57.986808	\N
1053	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:57.99268	\N
1054	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:59.066991	\N
1055	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:59.151824	\N
1056	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:10:59.15716	\N
1057	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:13.797863	\N
1058	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:13.955609	\N
1059	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:18.258658	\N
1169	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:23.254918	\N
1060	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:19.878937	\N
1061	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:19.880867	\N
1062	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:19.883043	\N
1063	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:22.608584	\N
1064	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:22.618324	\N
1065	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:17:22.619488	\N
1066	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:00.399674	\N
1067	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:00.625984	\N
1068	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:01.775904	\N
1069	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:04.472266	\N
1070	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:04.662437	\N
1071	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:04.663652	\N
1072	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:05.139802	\N
1073	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:07.099114	\N
1074	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:26:07.119913	\N
1075	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:26.023587	\N
1076	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:26.218294	\N
1077	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:28.39645	\N
1078	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:28.397655	\N
1079	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:28.405675	\N
1080	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:28.425525	\N
1081	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:29.079418	\N
1082	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:29.125566	\N
1083	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:28:29.129894	\N
1084	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:36:57.705422	\N
1085	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:36:57.946035	\N
1086	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:03.168049	\N
1087	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:03.738256	\N
1088	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:04.750031	\N
1089	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:04.751486	\N
1090	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:04.752534	\N
1091	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:05.742599	\N
1092	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:37:05.743297	\N
1093	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:39:14.282568	\N
1094	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 19:39:15.670334	\N
1095	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:01:33.778581	\N
1096	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:01:35.639035	\N
1097	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:01:49.36092	\N
1098	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:01:50.642969	\N
1099	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:09.009106	\N
1100	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:09.704014	\N
1101	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:27.704081	\N
1102	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:28.8401	\N
1103	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:31.415349	\N
1104	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:31.9935	\N
1105	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:35.422801	\N
1106	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:35.798373	\N
1107	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:36.956108	\N
1108	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:38.370544	\N
1109	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:39.134675	\N
1110	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:39.134232	\N
1111	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:02:40.807096	\N
1112	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:09:38.857174	\N
1113	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:09:47.214065	\N
1114	1	audit_logs.list	audit_logs	\N	{"page": 2, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:02.673796	\N
1115	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:09.335171	\N
1116	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:09.871537	\N
1117	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:11.013644	\N
1118	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:12.650204	\N
1119	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:12.651607	\N
1120	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:12.652593	\N
1121	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:13.348401	\N
1122	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:13.363172	\N
1123	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:23:13.366639	\N
1124	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:43.872846	\N
1125	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:44.020763	\N
1126	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:46.452201	\N
1127	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:46.453359	\N
1128	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:46.456258	\N
1129	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:46.722582	\N
1131	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:47.745435	\N
1230	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:09.776154	\N
1242	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.070468	\N
1245	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.714859	\N
1255	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:48:13.638753	\N
1264	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:56.866394	\N
1265	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:57.561298	\N
1276	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:09.342263	\N
1287	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 13:03:18.190941	\N
1295	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [{"title": "Moby Dick", "action": "added", "book_id": 77, "quantity": 1}], "transferred": 1, "guest_items_count": 2, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:25.129548	\N
1306	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:10.114421	\N
1309	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:10.989244	\N
1310	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:11.633679	\N
1318	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:58:04.226901	\N
1327	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 18:13:55.004532	\N
1336	1	FEATURE_REVIEW	book_reviews	3	{"message": "Review featured for home page display", "is_featured": true}	unknown	\N	2025-08-08 20:28:49.504308	\N
1343	\N	user.register	users	17	{"email": "bobbchrisworld@gmail.com", "username": "bobbchrisworld@gmail.com", "last_name": "CHRIS", "first_name": "ROBERT", "double_opt_in": true}	102.89.23.35	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-11 07:25:39.250919	\N
1352	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:06.130223	\N
1359	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.49526	\N
1365	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.216881	\N
1384	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:38.754281	\N
1392	1	PAYMENT_STATUS_UPDATE	orders	135	{"new_payment_status": "paid", "old_payment_status": "pending"}	admin_dashboard	\N	2025-08-12 11:04:16.243129	\N
1399	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:48.943488	\N
1400	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:49.472144	\N
1406	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:51.055767	\N
1416	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:22.523591	\N
1421	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.359047	\N
1422	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.851007	\N
1428	1	permissions.list	permissions	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:20.446602	\N
1432	1	permissions.list	permissions	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.103458	\N
1436	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.869222	\N
1437	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.371963	\N
1441	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.836366	\N
1444	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.974979	\N
1130	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:47.744167	\N
1231	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:10.227243	\N
1243	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.074293	\N
1246	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.717998	\N
1256	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:48:17.496353	\N
1268	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:52:05.204812	\N
1277	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:09.822561	\N
1288	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 16:41:52.596849	\N
1296	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:37.745256	\N
1308	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:10.904717	\N
1311	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:11.667914	\N
1319	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:58:08.329178	\N
1328	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "MobyDick", "action": "added", "book_id": 87, "quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 18:14:01.07468	\N
1337	1	orders.delete	orders	61	{"status": "pending", "user_id": 1, "order_number": "ORD-1754603628486-M7QBMLZKK", "total_amount": "1400.00"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 21:59:29.609362	\N
1344	\N	user.register	users	18	{"email": "adelodunpeter24@gmail.com", "username": "John ", "last_name": "John", "first_name": "Peter", "double_opt_in": true}	102.88.111.216	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-11 11:04:39.255393	\N
1354	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:08.87741	\N
1360	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.525695	\N
1366	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.502865	\N
1371	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:11.277215	\N
1376	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:38.186007	\N
1385	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:39.821989	\N
1393	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:46.752063	\N
1395	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:47.231803	\N
1407	1	users.delete	users	18	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:15.377085	\N
1417	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:22.524655	\N
1419	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.223111	\N
1424	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.938127	\N
1425	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:24.482072	\N
1429	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:20.448677	\N
1433	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.429946	\N
1438	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.372412	\N
1442	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.869467	\N
1132	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:34:47.747369	\N
1133	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:04.233102	\N
1134	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:07.311929	\N
1135	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:08.632256	\N
1136	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:08.63396	\N
1137	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:08.641438	\N
1138	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:09.603284	\N
1139	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:09.611231	\N
1140	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 20:52:09.611765	\N
1141	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 21:03:50.724711	\N
1142	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:32.78709	\N
1143	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:32.986161	\N
1144	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:34.149369	\N
1145	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:35.853909	\N
1146	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:35.856664	\N
1147	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:35.865145	\N
1148	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:36.500238	\N
1149	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:36.503816	\N
1150	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:04:36.505647	\N
1151	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-07 21:09:49.769199	\N
1152	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:44.395333	\N
1153	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:44.485346	\N
1154	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:46.723746	\N
1156	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:46.9811	\N
1155	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:46.980152	\N
1157	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:47.000861	\N
1158	1	users.roles.read	users	2	{"userId": 2}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:47.933678	\N
1159	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:47.934758	\N
1160	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:10:47.935027	\N
1161	1	users.delete	users	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:11:00.883043	\N
1162	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:11:01.611555	\N
1163	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:11:02.625775	\N
1164	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:11:03.705799	\N
1165	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:02.036683	\N
1166	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:03.010448	\N
1167	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:16.493655	\N
1289	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 16:43:08.769256	\N
1168	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:23.254154	\N
1170	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:24.326586	\N
1172	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:25.424602	\N
1232	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.05716	\N
1244	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.177301	\N
1247	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:56:25.839175	\N
1257	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:48:17.508676	\N
1269	1	permissions.list	permissions	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:52:05.771745	\N
1278	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:12.66742	\N
1290	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:06:50.687313	\N
1297	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:38.174009	\N
1298	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:39.329205	\N
1312	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:12.202569	\N
1313	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:47:12.863172	\N
1320	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:59:47.123272	\N
1329	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 18:20:58.544656	\N
1338	1	orders.delete	orders	81	{"status": "pending", "user_id": 1, "order_number": "ORD-1754669664088-D69TMC5VU", "total_amount": "1400.00"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 22:06:23.435742	\N
1355	1	users.roles.read	users	18	{"userId": 18}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:08.878267	\N
1361	1	users.roles.read	users	13	{"userId": 13}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:09.55091	\N
1367	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:10.508878	\N
1372	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:11.277928	\N
1377	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 09:04:40.476569	\N
1386	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:40.610066	\N
1387	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:41.100042	\N
1388	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 10:56:41.600135	\N
1394	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:06:46.88887	\N
1408	1	users.delete	users	13	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:17.480096	\N
1423	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:23.909819	\N
1426	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:07:24.489278	\N
1430	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:20.638883	\N
1434	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:22.838529	\N
1439	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.478265	\N
1440	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.565338	\N
1443	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:23.955051	\N
1171	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:24.655925	\N
1173	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:25.768748	\N
1174	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:26.153972	\N
1175	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:26.58374	\N
1176	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:27.330906	\N
1177	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:27.732709	\N
1178	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:27.748937	\N
1179	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:28.700374	\N
1180	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:28.705842	\N
1181	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:33.236092	\N
1182	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:58.399538	\N
1183	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:48:59.376276	\N
1184	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:02.264766	\N
1185	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:02.450489	\N
1186	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:05.287716	\N
1187	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:06.350609	\N
1188	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:06.352514	\N
1189	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:07.133689	\N
1190	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:08.681613	\N
1191	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:08.682874	\N
1192	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:11.399563	\N
1193	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:11.495904	\N
1194	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:15.726811	\N
1195	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:16.074419	\N
1196	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:16.089562	\N
1197	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:16.389447	\N
1198	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:18.644715	\N
1199	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:18.645749	\N
1200	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:18.825737	\N
1201	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:20.582642	\N
1202	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:49:20.583878	\N
1203	1	users.create	users	13	{"email": "peter@scaleitpro.com", "role_id": "3", "username": "peter", "last_name": "Adelodun", "first_name": "Peter"}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:50:29.622688	\N
1204	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:50:30.432581	\N
1205	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:50:34.317862	\N
1258	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 10:51:42.207732	\N
1206	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:50:34.320193	\N
1207	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 21:50:34.497671	\N
1209	1	content.delete	books	76	{"book_id": 76}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:28:23.993678	\N
1210	1	content.delete	books	59	{"book_id": 59}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:28:46.634691	\N
1211	1	content.delete	books	61	{"book_id": 61}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:28:59.089716	\N
1212	1	content.delete	books	75	{"book_id": 75}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:29:09.749734	\N
1213	1	content.delete	books	73	{"book_id": 73}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:29:16.289765	\N
1214	1	content.delete	books	71	{"book_id": 71}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:29:39.223082	\N
1215	1	content.delete	books	72	{"book_id": 72}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:29:49.279778	\N
1216	1	content.delete	books	69	{"book_id": 69}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:30:09.835961	\N
1217	1	content.delete	books	70	{"book_id": 70}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:30:17.320061	\N
1218	1	content.delete	books	74	{"book_id": 74}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:30:28.994706	\N
1219	1	content.delete	books	67	{"book_id": 67}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:30:43.459996	\N
1220	1	content.delete	books	52	{"book_id": 52}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-07 23:31:57.78516	\N
1221	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 08:02:44.051269	\N
1222	1	content.delete	books	66	{"book_id": 66}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 08:29:08.581306	\N
1223	1	content.delete	books	41	{"book_id": 41}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 08:29:22.272707	\N
1233	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.164409	\N
1236	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 09:37:13.824032	\N
1248	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:13:34.682026	\N
1249	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:13:35.962967	\N
1259	1	roles.list	roles	\N	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:51:53.867987	\N
1270	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:52:11.322089	\N
1271	1	audit_logs.list	audit_logs	\N	{"page": 1, "limit": 20}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 10:52:12.238299	\N
1279	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:13.124684	\N
1282	1	users.roles.read	users	13	{"userId": 13}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 12:41:13.861029	\N
1291	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:21:03.875662	\N
1299	1	users.roles.read	users	1	{"userId": 1}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:40.855365	\N
1302	1	users.roles.read	users	4	{"userId": 4}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 17:46:41.889527	\N
1314	1	user.login	user	1	{"method": "credentials"}	\N	\N	2025-08-08 17:48:02.592187	\N
1321	1	guest_cart_transfer	cart_items	1	{"failed": 1, "results": [], "transferred": 0, "guest_items_count": 1, "had_shipping_data": false, "shipping_data_saved": false}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 18:03:02.644703	\N
1330	1	guest_cart_transfer	cart_items	1	{"failed": 0, "results": [{"title": "MobyDick", "action": "updated", "book_id": 87, "new_quantity": 2, "old_quantity": 1}], "transferred": 1, "guest_items_count": 1, "had_shipping_data": true, "shipping_data_saved": true}	unknown	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 18:21:04.39545	\N
1339	1	content.delete	books	58	{"bulk_delete": true}	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 22:18:49.993762	\N
1445	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.006403	\N
1449	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.441488	\N
1453	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.896527	\N
1455	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.105579	\N
1461	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.72538	\N
1466	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:33.338437	\N
1471	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.096549	\N
1472	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.9674	\N
1446	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.069197	\N
1450	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.589547	\N
1458	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.587305	\N
1462	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:33.238426	\N
1470	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.095279	\N
1473	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.968177	\N
1447	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.280773	\N
1459	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.616299	\N
1463	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:33.239283	\N
1469	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.09423	\N
1474	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.969254	\N
1448	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.367482	\N
1452	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.801542	\N
1454	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:31.851081	\N
1456	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.44625	\N
1451	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:24.59014	\N
1457	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.586363	\N
1465	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:33.242687	\N
1467	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.092315	\N
1460	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:32.661348	\N
1464	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:33.240297	\N
1468	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.093333	\N
1475	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:20:34.97116	\N
1477	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:02.66229	\N
1478	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:02.797533	\N
1479	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:03.128692	\N
1480	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:03.64448	\N
1481	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:04.686521	\N
1482	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:04.687389	\N
1483	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:04.689045	\N
1484	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:04.691301	\N
1485	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.208421	\N
1486	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.211385	\N
1487	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.23195	\N
1488	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.241336	\N
1489	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.747076	\N
1490	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.79896	\N
1491	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:05.806394	\N
1492	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:06.148514	\N
1493	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:28:10.179408	\N
1495	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:32.416554	\N
1496	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:32.553662	\N
1497	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:32.992182	\N
1498	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:33.23255	\N
1499	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:33.40768	\N
1500	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.219603	\N
1501	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.272461	\N
1502	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.273655	\N
1503	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.30094	\N
1504	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.359562	\N
1505	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.828647	\N
1506	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.829296	\N
1511	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:35.395125	\N
1515	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:36.074284	\N
1507	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.836518	\N
1512	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:35.395422	\N
1514	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:36.073702	\N
1508	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:34.876419	\N
1510	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:35.394554	\N
1516	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:36.076676	\N
1509	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:35.03798	\N
1513	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:30:35.631645	\N
1517	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.006552	\N
1518	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.213542	\N
1519	1	users.delete	users	19	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.224554	\N
1520	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.591481	\N
1521	1	users.roles.read	users	19	{"userId": 19}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.816578	\N
1522	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:08.831696	\N
1523	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:09.042952	\N
1524	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:09.906132	\N
1525	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:09.907655	\N
1526	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:09.907927	\N
1527	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:10.06161	\N
1528	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:10.413518	\N
1529	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:10.434679	\N
1530	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:10.659958	\N
1531	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:10.991819	\N
1532	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:11.34074	\N
1533	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:11.341197	\N
1534	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:11.92242	\N
1535	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:12.219488	\N
1536	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:31:12.251599	\N
1537	\N	user.register	users	28	{"email": "adelodunpeter69@gmail.com", "username": "Peter", "last_name": "Peter", "first_name": "Adelodun", "double_opt_in": false}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15	2025-08-12 11:31:53.901498	\N
1538	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:33.001561	\N
1539	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:33.276805	\N
1540	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:33.616697	\N
1541	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:34.416859	\N
1542	1	users.roles.read	users	28	{"userId": 28}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:35.541647	\N
1543	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:35.568845	\N
1544	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:35.575587	\N
1545	1	users.roles.read	users	28	{"userId": 28}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:36.068609	\N
1546	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:36.11866	\N
1547	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:38:36.138219	\N
1548	1	users.delete	users	28	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:43.874663	\N
1549	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:46.044674	\N
1550	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:48.689906	\N
1551	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:48.690661	\N
1552	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:48.691659	\N
1553	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:57.122703	\N
1554	1	email_templates.list	email_templates	\N	{}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:57.374654	\N
1555	1	email_assignments.list	email_function_assignments	\N	{}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:57.569896	\N
1556	1	email_templates.list	email_templates	\N	{}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:40:57.951122	\N
1557	1	email_templates.test_send	email_templates	\N	{"to": "adelodunpeter69@gmail.com", "variables": {"userName": "Peter"}, "templateSlug": "welcome"}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:41:32.169819	\N
1558	1	email_templates.test_send	email_templates	\N	{"to": "adelodunpeter69@gmail.com", "variables": {"userName": "John Doe"}, "templateSlug": "welcome"}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:42:47.432783	\N
1559	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:51.594711	\N
1560	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:51.723685	\N
1561	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:52.114771	\N
1562	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:52.469694	\N
1563	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:53.634672	\N
1564	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:48:54.129759	\N
1565	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:04.259574	\N
1566	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:04.776668	\N
1567	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:04.897427	\N
1568	1	roles.list	roles	\N	\N	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:05.019679	\N
1569	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:05.384715	\N
1570	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:05.544685	\N
1571	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:05.701594	\N
1572	1	users.roles.read	users	17	{"userId": 17}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:06.016189	\N
1573	1	users.roles.read	users	1	{"userId": 1}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:07.667296	\N
1574	1	users.roles.read	users	4	{"userId": 4}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 11:49:07.668737	\N
1575	\N	user.register	users	29	{"email": "adelodunpeter69@gmail.com", "username": "Peter", "last_name": "Peter", "first_name": "Adelodun", "double_opt_in": false}	127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15	2025-08-12 11:49:41.574754	\N
1576	\N	user.register	users	30	{"email": "adelodunpeter24@gmail.com", "username": "John", "last_name": "John", "first_name": "David", "double_opt_in": false}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 14:50:27.994756	\N
1577	\N	user.register	users	31	{"email": "stanleym37@gmail.com", "username": "martin", "last_name": "Martin", "first_name": "Stanley", "double_opt_in": false}	102.88.113.18	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-12 14:55:28.487059	\N
1578	1	roles.list	roles	\N	\N	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:12.390002	\N
1579	1	permissions.list	permissions	\N	\N	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:12.734552	\N
1580	1	roles.list	roles	\N	\N	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:15.522884	\N
1581	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:16.140837	\N
1582	1	users.list	users	\N	{"page": 1, "limit": 10, "filters": {}}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:16.852176	\N
1583	1	users.roles.read	users	31	{"userId": 31}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:17.208405	\N
1584	1	users.roles.read	users	29	{"userId": 29}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:17.209147	\N
1585	1	users.roles.read	users	29	{"userId": 29}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:17.807175	\N
1586	1	users.roles.read	users	31	{"userId": 31}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:17.809426	\N
1587	1	users.roles.read	users	4	{"userId": 4}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:18.474872	\N
1588	1	users.roles.read	users	17	{"userId": 17}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:18.49167	\N
1589	1	users.roles.read	users	30	{"userId": 30}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:18.51013	\N
1590	1	users.roles.read	users	1	{"userId": 1}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:18.576337	\N
1591	1	users.roles.read	users	4	{"userId": 4}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:19.080746	\N
1592	1	users.roles.read	users	17	{"userId": 17}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:19.111357	\N
1593	1	users.roles.read	users	30	{"userId": 30}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:19.625553	\N
1594	1	users.roles.read	users	1	{"userId": 1}	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 15:40:19.712934	\N
1595	1	roles.list	roles	\N	\N	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 16:01:19.411496	\N
1596	1	permissions.list	permissions	\N	\N	102.88.111.136	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-12 16:01:20.723312	\N
1597	\N	user.register	users	32	{"email": "mosesakinpelu40@gmail.com", "username": "Moses", "last_name": "Praise", "first_name": "Moses", "double_opt_in": false}	102.88.111.136	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-12 16:32:13.124966	\N
\.


--
-- TOC entry 6054 (class 0 OID 17480)
-- Dependencies: 236
-- Data for Name: authors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.authors (id, name, email, bio, avatar_url, website_url, social_media, is_verified, status, created_at, updated_at) FROM stdin;
1	Jane Austen	jane.austen@classic.com	Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century.	\N	\N	\N	f	active	2025-07-31 12:47:19.180211	2025-07-31 12:47:19.180211
2	F. Scott Fitzgerald	fitzgerald@classic.com	F. Scott Fitzgerald was an American novelist, essayist, screenwriter, and short-story writer, best known for his novels depicting the flamboyance and excess of the Jazz Age.	\N	\N	\N	f	active	2025-07-31 12:47:19.537133	2025-07-31 12:47:19.537133
3	Harper Lee	harper.lee@classic.com	Harper Lee was an American novelist best known for her 1960 novel To Kill a Mockingbird. It won the 1961 Pulitzer Prize and has become a classic of modern American literature.	\N	\N	\N	f	active	2025-07-31 12:47:19.948063	2025-07-31 12:47:19.948063
4	George Orwell	george.orwell@classic.com	George Orwell was an English novelist, essayist, journalist and critic. His work is characterised by lucid prose, biting social criticism, opposition to totalitarianism, and outspoken support of democratic socialism.	\N	\N	\N	f	active	2025-07-31 12:47:20.356986	2025-07-31 12:47:20.356986
5	J.R.R. Tolkien	tolkien@classic.com	J.R.R. Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works The Hobbit and The Lord of the Rings.	\N	\N	\N	f	active	2025-07-31 12:47:20.957728	2025-07-31 12:47:20.957728
6	Sun Tzu	sun.tzu@classic.com	Sun Tzu was a Chinese general, military strategist, writer, and philosopher who lived in the Eastern Zhou period of ancient China.	\N	\N	\N	f	active	2025-07-31 12:47:21.234987	2025-07-31 12:47:21.234987
7	Morgan Housel	morgan.housel@finance.com	Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal.	\N	\N	\N	f	active	2025-07-31 12:47:21.587465	2025-07-31 12:47:21.587465
8	James Clear	james.clear@selfhelp.com	James Clear is an American author, entrepreneur, and photographer. He is the author of the #1 New York Times bestseller Atomic Habits.	\N	\N	\N	f	active	2025-07-31 12:47:21.973971	2025-07-31 12:47:21.973971
9	Matt Haig	matt.haig@fiction.com	Matt Haig is an English novelist and journalist. He has written both fiction and non-fiction books for children and adults, often in the speculative fiction genre.	\N	\N	\N	f	active	2025-07-31 12:47:22.41195	2025-07-31 12:47:22.41195
10	Frank Herbert	frank.herbert@scifi.com	Franklin Patrick Herbert Jr. was an American science-fiction author best known for his 1965 novel Dune and its five sequels.	\N	\N	\N	f	active	2025-07-31 12:47:22.823944	2025-07-31 12:47:22.823944
11	Taylor Jenkins Reid	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:16.500727	2025-08-02 11:49:16.500727
12	Gabrielle Zevin	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:17.749722	2025-08-02 11:49:17.749722
13	Bonnie Garmus	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:19.489764	2025-08-02 11:49:19.489764
14	Andy Weir	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:21.850705	2025-08-02 11:49:21.850705
15	Kazuo Ishiguro	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:22.869803	2025-08-02 11:49:22.869803
16	Kristin Hannah	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:23.861093	2025-08-02 11:49:23.861093
17	Ashley Audrain	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:25.748842	2025-08-02 11:49:25.748842
18	Sarah Pearse	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:26.639849	2025-08-02 11:49:26.639849
19	Nita Prose	\N	\N	\N	\N	\N	f	active	2025-08-02 11:49:27.927738	2025-08-02 11:49:27.927738
20	Herman Meville	admin@readnwin.com	I am a author	\N	\N	\N	f	active	2025-08-02 18:38:09.134586	2025-08-02 18:38:09.134586
21	Test Author	test@author.com	A test author for eCommerce testing	\N	\N	\N	t	active	2025-08-05 18:56:15.008903	2025-08-05 18:56:15.008903
27	Morgan Housel	morgan@example.com	Financial writer	\N	\N	\N	f	active	2025-08-06 09:11:57.702496	2025-08-06 09:11:57.702496
28	James Clear	james@example.com	Author of Atomic Habits	\N	\N	\N	f	active	2025-08-06 09:11:57.863461	2025-08-06 09:11:57.863461
29	Matt Haig	matt@example.com	British novelist	\N	\N	\N	f	active	2025-08-06 09:11:58.054569	2025-08-06 09:11:58.054569
30	Frank Herbert	frank@example.com	Science fiction author	\N	\N	\N	f	active	2025-08-06 09:11:58.262697	2025-08-06 09:11:58.262697
31	Paulo Coelho	paulo@example.com	Brazilian novelist	\N	\N	\N	f	active	2025-08-06 09:11:58.406552	2025-08-06 09:11:58.406552
32	Delia Owens	delia@example.com	American author	\N	\N	\N	f	active	2025-08-06 09:11:58.774515	2025-08-06 09:11:58.774515
33	Taylor Jenkins Reid	taylor@example.com	Contemporary fiction author	\N	\N	\N	f	active	2025-08-06 09:11:59.414573	2025-08-06 09:11:59.414573
34	Andy Weir	andy@example.com	Science fiction author	\N	\N	\N	f	active	2025-08-06 09:11:59.542517	2025-08-06 09:11:59.542517
35	Kazuo Ishiguro	kazuo@example.com	Nobel Prize winner	\N	\N	\N	f	active	2025-08-06 09:11:59.863493	2025-08-06 09:11:59.863493
36	V.E. Schwab	victoria@example.com	Fantasy author	\N	\N	\N	f	active	2025-08-06 09:12:00.006509	2025-08-06 09:12:00.006509
37	Sarah Pearse	sarah@example.com	Thriller author	\N	\N	\N	f	active	2025-08-06 09:12:00.294541	2025-08-06 09:12:00.294541
38	Richard Osman	richard@example.com	British author	\N	\N	\N	f	active	2025-08-06 09:12:00.478556	2025-08-06 09:12:00.478556
39	Lucy Foley	lucy@example.com	Mystery author	\N	\N	\N	f	active	2025-08-06 09:12:00.630551	2025-08-06 09:12:00.630551
40	Alex Michaelides	alex@example.com	Thriller author	\N	\N	\N	f	active	2025-08-06 09:12:00.917669	2025-08-06 09:12:00.917669
41	Tara Westover	tara@example.com	Memoirist	\N	\N	\N	f	active	2025-08-06 09:12:01.119959	2025-08-06 09:12:01.119959
42	Stephen Covey	stephen@example.com	Self-help author	\N	\N	\N	f	active	2025-08-06 09:12:01.34246	2025-08-06 09:12:01.34246
43	Madeline Miller	madeline@example.com	Novelist	\N	\N	\N	f	active	2025-08-06 09:12:01.510455	2025-08-06 09:12:01.510455
44	Yuval Noah Harari	yuval@example.com	Historian	\N	\N	\N	f	active	2025-08-06 09:12:01.686432	2025-08-06 09:12:01.686432
45	Sarah Chen	sarah.chen@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:04.54249	2025-08-06 10:15:04.54249
46	Dr. Michael Rodriguez	dr..michael.rodriguez@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:05.361351	2025-08-06 10:15:05.361351
47	Dr. Emily Watson	dr..emily.watson@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:06.252258	2025-08-06 10:15:06.252258
48	Alex Thompson	alex.thompson@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:07.21128	2025-08-06 10:15:07.21128
49	Dr. James Kim	dr..james.kim@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:08.431298	2025-08-06 10:15:08.431298
50	Maria Garcia	maria.garcia@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:09.530297	2025-08-06 10:15:09.530297
51	Robert Johnson	robert.johnson@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:10.552297	2025-08-06 10:15:10.552297
52	Dr. Lisa Park	dr..lisa.park@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:11.701355	2025-08-06 10:15:11.701355
53	David Wilson	david.wilson@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:13.001341	2025-08-06 10:15:13.001341
54	Jennifer Adams	jennifer.adams@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:13.981482	2025-08-06 10:15:13.981482
55	Dr. Rachel Green	dr..rachel.green@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:14.801268	2025-08-06 10:15:14.801268
56	Dr. Carlos Martinez	dr..carlos.martinez@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:15.8313	2025-08-06 10:15:15.8313
57	Amanda Foster	amanda.foster@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:16.781782	2025-08-06 10:15:16.781782
58	Chef Michael Brown	chef.michael.brown@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:17.930249	2025-08-06 10:15:17.930249
59	Dr. Sarah Williams	dr..sarah.williams@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:18.857266	2025-08-06 10:15:18.857266
60	Kevin Lee	kevin.lee@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:19.711804	2025-08-06 10:15:19.711804
61	Dr. Patricia Clark	dr..patricia.clark@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:20.661327	2025-08-06 10:15:20.661327
62	Mark Davis	mark.davis@example.com	\N	\N	\N	\N	f	active	2025-08-06 10:15:21.631344	2025-08-06 10:15:21.631344
63	Herman Melville	werga@gfmail.com	adfs	\N	\N	\N	f	active	2025-08-08 11:22:27.803773	2025-08-08 11:22:27.803773
\.


--
-- TOC entry 6201 (class 0 OID 19467)
-- Dependencies: 383
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_accounts (id, bank_name, account_number, account_name, account_type, is_active, is_default, sort_order, created_at, updated_at) FROM stdin;
1	First Bank of Nigeria	1234567890	ReadnWin Bookstore	current	t	t	0	2025-08-06 22:37:41.791261	2025-08-06 22:37:41.791261
2	Zenith Bank	0987654321	ReadnWin Bookstore	current	t	f	0	2025-08-06 22:37:41.791261	2025-08-06 22:37:41.791261
\.


--
-- TOC entry 6203 (class 0 OID 19480)
-- Dependencies: 385
-- Data for Name: bank_transfer_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transfer_notifications (id, bank_transfer_id, user_id, type, title, message, is_read, created_at) FROM stdin;
1	1	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 2800.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 10:55:05.738023
2	2	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 2800.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 11:01:30.924701
3	3	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 2800.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 11:04:01.464663
4	3	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-07 11:06:08.25368
5	4	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 1400.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 12:14:22.551701
6	4	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-07 12:14:42.926058
7	5	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 1400.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 12:59:39.305706
8	5	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-07 13:35:04.931657
9	6	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 1400.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-07 21:54:46.633395
10	6	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-07 21:55:26.35568
13	8	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 37.98 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-08 15:58:24.116509
14	9	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 1400.00 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-08 16:05:52.161319
16	11	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 12,003,000 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-09 12:41:02.801303
17	11	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-09 12:41:07.556821
18	12	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 4,200 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-09 17:22:30.2623
19	12	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-09 17:22:33.489929
20	13	1	initiated	Bank Transfer Initiated	Your bank transfer of NGN 4,200 has been initiated. Please complete the transfer within 24 hours.	f	2025-08-12 11:02:02.553201
21	13	1	proof_uploaded	Proof of Payment Uploaded	Your proof of payment has been uploaded and is being reviewed.	f	2025-08-12 11:02:05.377718
\.


--
-- TOC entry 6119 (class 0 OID 18407)
-- Dependencies: 301
-- Data for Name: bank_transfer_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transfer_payments (id, transaction_id, user_id, order_id, amount, currency, bank_name, account_number, account_name, reference_number, proof_of_payment_url, status, submitted_at, verified_at, verified_by, admin_notes, created_at, updated_at, payment_transaction_id, verification_attempts, last_verification_attempt, auto_expire_at, notification_sent, admin_notified) FROM stdin;
\.


--
-- TOC entry 6207 (class 0 OID 19538)
-- Dependencies: 389
-- Data for Name: bank_transfer_proofs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transfer_proofs (id, transaction_id, user_id, bank_name, account_number, account_name, amount, reference_number, proof_image_url, status, admin_notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6199 (class 0 OID 19436)
-- Dependencies: 381
-- Data for Name: bank_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bank_transfers (id, order_id, user_id, transaction_reference, amount, currency, bank_name, account_number, account_name, payment_date, status, admin_notes, verified_by, verified_at, expires_at, created_at, updated_at) FROM stdin;
1	55	1	BT-1754564104935-CXWVKL	2800.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 11:55:04.935	2025-08-07 10:55:05.52487	2025-08-07 10:55:05.52487
2	56	1	BT-1754564490208-N3HCW6	2800.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 12:01:30.208	2025-08-07 11:01:30.763693	2025-08-07 11:01:30.763693
3	57	1	BT-1754564640712-2HM9LT	2800.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 12:04:00.712	2025-08-07 11:04:01.309925	2025-08-07 11:04:01.309925
4	58	1	BT-1754568861967-C11RVQ	1400.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 13:14:21.967	2025-08-07 12:14:22.419705	2025-08-07 12:14:22.419705
5	59	1	BT-1754571578579-BCVZ2R	1400.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 13:59:38.579	2025-08-07 12:59:39.044141	2025-08-07 12:59:39.044141
6	62	1	BT-1754603685967-0845RF	1400.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-08 22:54:45.967	2025-08-07 21:54:46.412994	2025-08-07 21:54:46.412994
8	79	1	BT-1754668703570-ZO82QK	37.98	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-09 16:58:23.57	2025-08-08 15:58:23.906446	2025-08-08 15:58:23.906446
9	80	1	BT-1754669151601-FYU3D3	1400.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-09 17:05:51.601	2025-08-08 16:05:51.939831	2025-08-08 16:05:51.939831
11	100	1	BT-1754743260806-H4TK8J	12003000.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-10 13:41:00.806	2025-08-09 12:41:02.511195	2025-08-09 12:41:02.511195
12	110	1	BT-1754760148017-PZEPJ3	4200.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-10 18:22:28.017	2025-08-09 17:22:30.027143	2025-08-09 17:22:30.027143
13	135	1	BT-1754996520851-A14YJG	4200.00	NGN	\N	\N	\N	\N	pending	\N	\N	\N	2025-08-13 12:02:00.851	2025-08-12 11:02:02.282478	2025-08-12 11:02:02.282478
\.


--
-- TOC entry 6093 (class 0 OID 18045)
-- Dependencies: 275
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_categories (id, name, slug, description, color, icon, is_active, created_at) FROM stdin;
1	Technology	technology	Technology and digital reading trends	#3B82F6	ri-computer-line	t	2025-08-01 18:31:09.929444
2	Self-Improvement	self-improvement	Personal development and growth	#10B981	ri-user-heart-line	t	2025-08-01 18:31:09.929444
3	Literature	literature	Book reviews and literary discussions	#8B5CF6	ri-book-open-line	t	2025-08-01 18:31:09.929444
4	Psychology	psychology	Psychology of reading and learning	#F59E0B	ri-brain-line	t	2025-08-01 18:31:09.929444
5	Reviews	reviews	Book reviews and recommendations	#EF4444	ri-star-line	t	2025-08-01 18:31:09.929444
6	Reading Tips	reading-tips	Tips for better reading habits	#06B6D4	ri-lightbulb-line	t	2025-08-01 18:31:09.929444
7	Author Interviews	author-interviews	Interviews with authors	#84CC16	ri-user-voice-line	t	2025-08-01 18:31:09.929444
8	Industry News	industry-news	Publishing industry updates	#6366F1	ri-newspaper-line	t	2025-08-01 18:31:09.929444
\.


--
-- TOC entry 6097 (class 0 OID 18078)
-- Dependencies: 279
-- Data for Name: blog_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_comments (id, post_id, user_id, author_name, author_email, content, status, parent_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6095 (class 0 OID 18061)
-- Dependencies: 277
-- Data for Name: blog_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_images (id, post_id, filename, original_name, file_path, file_size, mime_type, alt_text, caption, is_featured, sort_order, created_at) FROM stdin;
\.


--
-- TOC entry 6099 (class 0 OID 18106)
-- Dependencies: 281
-- Data for Name: blog_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_likes (id, post_id, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 6091 (class 0 OID 18018)
-- Dependencies: 273
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, title, slug, excerpt, content, author_id, author_name, status, featured, category, tags, read_time, views_count, likes_count, comments_count, seo_title, seo_description, seo_keywords, published_at, created_at, updated_at) FROM stdin;
2	Top 10 Digital Reading Tips for 2024	top-10-digital-reading-tips-2024	Master the art of digital reading with these essential tips for better comprehension and retention.	\n            <h2>Top 10 Digital Reading Tips for 2024</h2>\n            <p>Digital reading has become the norm, but it requires different strategies than traditional reading. Here are our top tips:</p>\n            <ol>\n              <li><strong>Adjust Your Screen Settings</strong> - Use warm lighting and appropriate brightness</li>\n              <li><strong>Take Regular Breaks</strong> - Follow the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds)</li>\n              <li><strong>Use Annotation Tools</strong> - Highlight and take notes to improve retention</li>\n              <li><strong>Choose the Right Font</strong> - Use fonts designed for screen reading like Open Sans or Georgia</li>\n              <li><strong>Optimize Line Spacing</strong> - Increase line spacing for better readability</li>\n              <li><strong>Use Reading Mode</strong> - Eliminate distractions with reading mode</li>\n              <li><strong>Practice Active Reading</strong> - Ask questions and make connections</li>\n              <li><strong>Set Reading Goals</strong> - Track your progress and set achievable targets</li>\n              <li><strong>Join Reading Communities</strong> - Discuss books with others</li>\n              <li><strong>Mix Digital and Print</strong> - Use both formats for different types of content</li>\n            </ol>\n            <p>Remember, the key to successful digital reading is finding what works best for you!</p>\n          	\N	ReadnWin Team	published	t	reading-tips	{"reading tips","digital reading",productivity,2024}	8	12	0	0	Top 10 Digital Reading Tips for 2024 - Improve Your Reading Experience	Master digital reading with these essential tips for better comprehension, retention, and overall reading experience in 2024.	{"digital reading tips","reading strategies","ebook reading","reading productivity"}	2025-08-01 18:31:12.127406	2025-08-01 18:31:12.127406	2025-08-11 06:56:20.94455
1	Welcome to ReadnWin Blog	welcome-to-readnwin-blog	Discover the world of digital reading and how it can transform your learning experience.	\n            <h2>Welcome to ReadnWin!</h2>\n            <p>We're excited to launch our blog where we'll share insights about digital reading, book recommendations, and tips for making the most of your reading experience.</p>\n            <p>In this blog, you'll find:</p>\n            <ul>\n              <li>Book reviews and recommendations</li>\n              <li>Reading tips and strategies</li>\n              <li>Digital reading technology updates</li>\n              <li>Author interviews and insights</li>\n            </ul>\n            <p>Stay tuned for regular updates and happy reading!</p>\n          	\N	ReadnWin Team	published	t	general	{welcome,introduction,reading}	3	8	0	0	Welcome to ReadnWin Blog - Your Digital Reading Journey	Discover the world of digital reading with ReadnWin. Get book recommendations, reading tips, and insights into the future of reading.	{"digital reading",ebooks,"reading tips","book recommendations"}	2025-08-01 18:31:11.765277	2025-08-01 18:31:11.765277	2025-08-11 11:09:36.059692
\.


--
-- TOC entry 6101 (class 0 OID 18126)
-- Dependencies: 283
-- Data for Name: blog_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_views (id, post_id, user_id, ip_address, user_agent, viewed_at) FROM stdin;
1	2	\N	\N	curl/8.7.1	2025-08-01 18:47:06.104532
2	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 18:54:39.970976
3	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:12:28.458794
4	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:13:02.811052
5	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:19:09.471544
6	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:20:32.786423
7	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:29:14.497823
8	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:30:05.463468
9	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 19:32:45.228025
10	1	\N	\N	curl/8.7.1	2025-08-01 19:33:13.011348
11	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 20:07:47.430382
12	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 23:00:37.481364
13	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-01 23:34:52.73468
14	2	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 00:08:14.899925
15	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-06 07:50:14.500566
16	1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-08 20:42:54.29821
17	1	\N	102.88.108.61	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36	2025-08-10 20:26:08.979017
18	2	\N	102.89.23.35	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-11 06:55:56.453918
19	2	\N	102.89.23.35	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-11 06:56:21.030428
20	1	\N	102.88.111.216	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36	2025-08-11 11:09:36.156035
\.


--
-- TOC entry 6061 (class 0 OID 17556)
-- Dependencies: 243
-- Data for Name: book_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_reviews (id, book_id, user_id, rating, title, review_text, is_verified_purchase, is_helpful_count, status, created_at, updated_at, is_featured) FROM stdin;
1	1	1	5	Excellent insights on money psychology	This book completely changed my perspective on money and investing. The author presents complex financial concepts in an accessible way that makes you think differently about wealth building.	t	12	approved	2025-07-28 18:45:35.951	2025-08-08 10:52:54.322687	t
\.


--
-- TOC entry 6059 (class 0 OID 17540)
-- Dependencies: 241
-- Data for Name: book_tag_relations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_tag_relations (book_id, tag_id) FROM stdin;
\.


--
-- TOC entry 6058 (class 0 OID 17530)
-- Dependencies: 240
-- Data for Name: book_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.book_tags (id, name, color, created_at) FROM stdin;
\.


--
-- TOC entry 6056 (class 0 OID 17496)
-- Dependencies: 238
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.books (id, title, subtitle, author_id, category_id, isbn, description, short_description, cover_image_url, sample_pdf_url, ebook_file_url, format, language, pages, publication_date, publisher, price, original_price, cost_price, weight_grams, dimensions, stock_quantity, low_stock_threshold, is_featured, is_bestseller, is_new_release, status, seo_title, seo_description, seo_keywords, view_count, created_at, updated_at, inventory_enabled, delivery_type, is_digital, is_physical, unlimited_stock) FROM stdin;
1	Pride and Prejudice	A Novel	1	7	\N	Pride and Prejudice follows the emotional development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.	\N	https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	432	1813-01-28	\N	9.99	\N	\N	\N	\N	1000	10	t	t	f	published	\N	\N	\N	0	2025-07-31 12:47:23.092034	2025-07-31 12:47:23.092034	f	instant	t	f	f
2	The Great Gatsby	A Novel	2	1	\N	The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.	\N	https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	180	1925-04-10	\N	12.99	\N	\N	\N	\N	1500	10	t	t	f	published	\N	\N	\N	0	2025-07-31 12:47:23.632398	2025-07-31 12:47:23.632398	f	instant	t	f	f
3	To Kill a Mockingbird	A Novel	3	1	\N	To Kill a Mockingbird is a novel by Harper Lee published in 1960. It was immediately successful, winning the Pulitzer Prize, and has become a classic of modern American literature.	\N	https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	281	1960-07-11	\N	11.99	\N	\N	\N	\N	1200	10	t	t	f	published	\N	\N	\N	0	2025-07-31 12:47:23.967007	2025-07-31 12:47:23.967007	f	instant	t	f	f
8	Atomic Habits	An Easy & Proven Way to Build Good Habits & Break Bad Ones	8	3	\N	Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.	\N	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	320	2018-10-16	\N	16.99	\N	\N	\N	\N	2500	10	t	t	f	published	\N	\N	\N	0	2025-07-31 12:47:51.341932	2025-07-31 12:47:51.341932	f	instant	t	f	f
9	The Midnight Library	A Novel	9	1	\N	Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.	\N	https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	288	2020-08-13	\N	14.99	\N	\N	\N	\N	1000	10	f	f	f	published	\N	\N	\N	0	2025-07-31 12:47:51.693789	2025-07-31 12:47:51.693789	f	instant	t	f	f
10	Dune	A Novel	10	5	\N	Dune is a 1965 science-fiction novel by American author Frank Herbert, originally published as two separate serials in Analog magazine. It tied with Roger Zelazny's This Immortal for the Hugo Award in 1966, and it won the inaugural Nebula Award for Best Novel.	\N	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center	\N	\N	ebook	en	688	1965-08-01	\N	18.99	\N	\N	\N	\N	1500	10	t	f	f	published	\N	\N	\N	0	2025-07-31 12:47:52.044767	2025-07-31 12:48:39.704893	f	instant	t	f	f
87	MobyDick	\N	63	35	\N	\N	\N	https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop	\N	\N	physical	English	\N	\N	Admin	1200.00	\N	\N	\N	\N	0	\N	\N	\N	\N	published	\N	\N	\N	0	2025-08-08 12:50:47.232764	2025-08-10 21:35:34.390603	f	instant	f	f	f
57	The Song of Achilles	A Novel	43	28	9780062060624	Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the kingdom of Phthia to be raised in the shadow of King Peleus.	\N	https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop	\N	/ebooks/song-achilles.epub	ebook	en	416	2012-03-06	Ecco	1600.00	2600.00	850.00	\N	\N	999999	10	t	t	f	published	\N	\N	\N	0	2025-08-06 09:17:38.812255	2025-08-10 21:35:34.972297	f	instant	f	f	f
\.


--
-- TOC entry 6063 (class 0 OID 17584)
-- Dependencies: 245
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, book_id, quantity, created_at, format) FROM stdin;
80	1	87	1	2025-08-11 11:01:26.952596	physical
81	30	87	1	2025-08-12 14:53:26.606104	physical
82	32	1	1	2025-08-12 16:34:20.572263	ebook
\.


--
-- TOC entry 6052 (class 0 OID 17460)
-- Dependencies: 234
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, parent_id, image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Fiction	fiction	Literary fiction and novels	\N	\N	t	1	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
2	Non-Fiction	non-fiction	Educational and informational books	\N	\N	t	2	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
3	Self-Help	self-help	Personal development and improvement	\N	\N	t	3	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
4	Business	business	Business and entrepreneurship	\N	\N	t	4	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
5	Science Fiction	science-fiction	Science fiction and fantasy	\N	\N	t	5	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
6	Mystery & Thriller	mystery-thriller	Suspense and detective stories	\N	\N	t	6	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
7	Romance	romance	Love stories and romantic fiction	\N	\N	t	7	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
8	Biography & Memoir	biography-memoir	Personal stories and biographies	\N	\N	t	8	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
9	History	history	Historical books and accounts	\N	\N	t	9	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
10	Technology	technology	Technology and programming	\N	\N	t	10	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
12	Historical Fiction	historical-fiction	Historical Fiction books	\N	\N	t	0	2025-08-02 11:49:24.308822	2025-08-02 11:49:24.308822
13	Thriller	thriller	Thriller books	\N	\N	t	0	2025-08-02 11:49:26.94588	2025-08-02 11:49:26.94588
14	Mystery	mystery	Mystery books	\N	\N	t	0	2025-08-02 11:49:28.199791	2025-08-02 11:49:28.199791
15	Test Category	test-category	A test category for eCommerce testing	\N	\N	t	0	2025-08-05 18:56:15.187971	2025-08-05 18:56:15.187971
26	Finance & Business	finance-business	Financial literacy	\N	\N	t	6	2025-08-06 09:11:56.505404	2025-08-06 09:11:56.505404
28	Fantasy	fantasy	Imaginative stories	\N	\N	t	8	2025-08-06 09:11:57.352745	2025-08-06 09:11:57.352745
30	Psychology	psychology	Psychology books	\N	\N	t	0	2025-08-06 10:15:06.595037	2025-08-06 10:15:06.595037
31	Lifestyle	lifestyle	Lifestyle books	\N	\N	t	0	2025-08-06 10:15:07.631245	2025-08-06 10:15:07.631245
32	Arts	arts	Arts books	\N	\N	t	0	2025-08-06 10:15:09.82121	2025-08-06 10:15:09.82121
33	Finance	finance	Finance books	\N	\N	t	0	2025-08-06 10:15:10.951288	2025-08-06 10:15:10.951288
34	Parenting	parenting	Parenting books	\N	\N	t	0	2025-08-06 10:15:15.261211	2025-08-06 10:15:15.261211
35	Cooking	cooking	Cooking books	\N	\N	t	0	2025-08-06 10:15:18.27154	2025-08-06 10:15:18.27154
\.


--
-- TOC entry 6165 (class 0 OID 19107)
-- Dependencies: 347
-- Data for Name: company_stats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_stats (id, number, label, order_index, is_active, created_at, updated_at) FROM stdin;
1	50K+	Active Readers	1	t	2025-08-05 21:38:02.215571+00	2025-08-05 21:38:02.215571+00
2	100K+	Books Available	2	t	2025-08-05 21:38:02.215571+00	2025-08-05 21:38:02.215571+00
3	95%	Reader Satisfaction	3	t	2025-08-05 21:38:02.215571+00	2025-08-05 21:38:02.215571+00
4	24/7	Support Available	4	t	2025-08-05 21:38:02.215571+00	2025-08-05 21:38:02.215571+00
\.


--
-- TOC entry 6163 (class 0 OID 19094)
-- Dependencies: 345
-- Data for Name: company_values; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.company_values (id, title, description, icon, order_index, is_active, created_at, updated_at) FROM stdin;
1	Accessibility	Making reading accessible to everyone, regardless of background or ability.	ri-book-open-line	1	t	2025-08-05 21:38:02.020698+00	2025-08-05 21:38:02.020698+00
2	Innovation	Continuously innovating to enhance the reading experience with cutting-edge technology.	ri-lightbulb-line	2	t	2025-08-05 21:38:02.020698+00	2025-08-05 21:38:02.020698+00
3	Community	Building a global community of readers who share knowledge and inspire each other.	ri-heart-line	3	t	2025-08-05 21:38:02.020698+00	2025-08-05 21:38:02.020698+00
4	Quality	Maintaining the highest standards in content curation and platform reliability.	ri-shield-check-line	4	t	2025-08-05 21:38:02.020698+00	2025-08-05 21:38:02.020698+00
\.


--
-- TOC entry 6169 (class 0 OID 19131)
-- Dependencies: 351
-- Data for Name: contact_faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_faqs (id, question, answer, order_index, is_active, created_at, updated_at) FROM stdin;
1	How do I get started with ReadnWin?	Simply sign up for a free account and start exploring our vast library of books. You can read on any device and sync your progress across platforms.	1	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
2	What types of books are available?	We offer a comprehensive collection including fiction, non-fiction, academic texts, self-help books, and much more. Our library is constantly growing with new releases.	2	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
3	Can I read offline?	Yes! You can download books to read offline. Simply tap the download button on any book and it will be available for offline reading.	3	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
4	How much does ReadnWin cost?	We offer both free and premium plans. The free plan includes access to thousands of books, while premium unlocks our entire library and advanced features.	4	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
5	How do I cancel my subscription?	You can cancel your subscription anytime from your account settings. There are no cancellation fees and you'll continue to have access until the end of your billing period.	5	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
6	Is my reading data private?	Absolutely. We take your privacy seriously. Your reading history and personal data are encrypted and never shared with third parties without your explicit consent.	6	t	2025-08-05 21:38:02.86773+00	2025-08-05 21:38:02.86773+00
\.


--
-- TOC entry 6167 (class 0 OID 19118)
-- Dependencies: 349
-- Data for Name: contact_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_methods (id, title, description, contact_info, icon, action_url, order_index, is_active, created_at, updated_at) FROM stdin;
1	Email Us	Get in touch with our support team	hello@readnwin.com	ri-mail-line	\N	1	t	2025-08-05 21:38:02.41546+00	2025-08-05 21:38:02.41546+00
2	Call Us	Speak with our customer service	+1 (555) 123-4567	ri-phone-line	\N	2	t	2025-08-05 21:38:02.41546+00	2025-08-05 21:38:02.41546+00
3	Live Chat	Chat with us in real-time	Available 24/7	ri-message-3-line	\N	3	t	2025-08-05 21:38:02.41546+00	2025-08-05 21:38:02.41546+00
4	Visit Us	Our headquarters location	123 Reading Street, Book City, BC 12345	ri-map-pin-line	\N	4	t	2025-08-05 21:38:02.41546+00	2025-08-05 21:38:02.41546+00
\.


--
-- TOC entry 6187 (class 0 OID 19289)
-- Dependencies: 369
-- Data for Name: contact_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_settings (id, setting_key, setting_value, setting_type, is_active, display_order, created_at, updated_at) FROM stdin;
1	email	hello@readnwin.com	email	t	1	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
2	phone	+1 (555) 123-4567	phone	t	2	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
3	address	123 Reading Street, Book City, BC 12345	address	t	3	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
4	live_chat	Available 24/7	text	t	4	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
5	office_hours	Monday - Friday: 9:00 AM - 6:00 PM	text	t	5	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
6	parking_info	Free parking available in our building	text	t	6	2025-08-06 13:11:27.43109	2025-08-06 13:11:27.43109
\.


--
-- TOC entry 6171 (class 0 OID 19144)
-- Dependencies: 353
-- Data for Name: contact_subjects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_subjects (id, subject, order_index, is_active, created_at, updated_at) FROM stdin;
1	General Inquiry	1	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
2	Technical Support	2	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
3	Account Issues	3	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
4	Billing Questions	4	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
5	Feature Request	5	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
6	Partnership	6	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
7	Press/Media	7	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
8	Other	8	t	2025-08-05 21:38:02.645664+00	2025-08-05 21:38:02.645664+00
\.


--
-- TOC entry 6185 (class 0 OID 19269)
-- Dependencies: 367
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_submissions (id, name, email, subject, message, status, priority, assigned_to, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6179 (class 0 OID 19219)
-- Dependencies: 361
-- Data for Name: content_blocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_blocks (id, section_id, block_type, block_title, block_content, block_data, block_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6181 (class 0 OID 19237)
-- Dependencies: 363
-- Data for Name: content_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_images (id, block_id, filename, original_name, file_path, file_size, mime_type, alt_text, caption, image_type, sort_order, created_at) FROM stdin;
\.


--
-- TOC entry 6175 (class 0 OID 19185)
-- Dependencies: 357
-- Data for Name: content_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_pages (id, page_key, page_title, page_description, is_active, created_at, updated_at) FROM stdin;
1	about-us	About Us	Company information, mission, team, and values	t	2025-08-06 13:11:27.271905	2025-08-06 13:11:27.271905
2	contact-us	Contact Us	Contact information, form, and support details	t	2025-08-06 13:11:27.271905	2025-08-06 13:11:27.271905
\.


--
-- TOC entry 6177 (class 0 OID 19199)
-- Dependencies: 359
-- Data for Name: content_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_sections (id, page_id, section_key, section_title, section_content, section_order, is_active, created_at, updated_at) FROM stdin;
1	1	hero	Hero Section	Revolutionizing the way people read, learn, and grow through technology	1	t	2025-08-06 13:11:28.107939	2025-08-06 13:11:28.107939
2	1	mission	Our Mission	At ReadnWin, we believe that reading is the foundation of personal growth and societal progress. Our mission is to make quality literature accessible to everyone, everywhere.	2	t	2025-08-06 13:11:28.302979	2025-08-06 13:11:28.302979
3	1	team	Meet Our Team	The passionate individuals behind ReadnWin's mission to revolutionize reading	3	t	2025-08-06 13:11:28.45405	2025-08-06 13:11:28.45405
4	1	values	Our Values	The principles that guide everything we do	4	t	2025-08-06 13:11:28.712867	2025-08-06 13:11:28.712867
5	2	hero	Contact Us	We'd love to hear from you. Get in touch with our team for any questions or support.	1	t	2025-08-06 13:11:29.123038	2025-08-06 13:11:29.123038
6	2	contact_methods	Get in Touch	Choose the best way to reach us. We're here to help with any questions or concerns.	2	t	2025-08-06 13:11:29.275937	2025-08-06 13:11:29.275937
7	2	contact_form	Send us a Message	Fill out the form below and we'll get back to you as soon as possible.	3	t	2025-08-06 13:11:29.435011	2025-08-06 13:11:29.435011
8	2	faq	Frequently Asked Questions	Find quick answers to common questions about ReadnWin.	4	t	2025-08-06 13:11:29.588974	2025-08-06 13:11:29.588974
\.


--
-- TOC entry 6183 (class 0 OID 19254)
-- Dependencies: 365
-- Data for Name: content_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.content_versions (id, content_type, content_id, version_number, content_data, changed_by, change_reason, created_at) FROM stdin;
\.


--
-- TOC entry 6069 (class 0 OID 17653)
-- Dependencies: 251
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.discounts (id, code, name, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, used_count, is_active, valid_from, valid_until, applicable_categories, applicable_books, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6081 (class 0 OID 17800)
-- Dependencies: 263
-- Data for Name: ecommerce_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecommerce_settings (id, setting_key, setting_value, description, created_at, updated_at) FROM stdin;
1	store_name	ReadnWin	Store name	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
2	store_description	Your digital bookstore	Store description	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
4	tax_rate	0.08	Default tax rate	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
5	free_shipping_threshold	50.00	Free shipping threshold	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
6	low_stock_threshold	10	Low stock alert threshold	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
7	max_downloads_per_book	3	Maximum downloads per purchased book	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
8	auto_archive_old_orders	365	Days before auto-archiving orders	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
9	enable_reviews	true	Enable customer reviews	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
10	require_review_approval	true	Require admin approval for reviews	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
3	currency	NGN	Default currency	2025-07-31 12:38:38.349827	2025-07-31 12:38:38.349827
\.


--
-- TOC entry 6107 (class 0 OID 18202)
-- Dependencies: 289
-- Data for Name: email_function_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_function_assignments (id, function_id, template_id, is_active, priority, created_at, updated_at) FROM stdin;
1	2	6	t	1	2025-08-02 00:23:20.757451	2025-08-02 00:23:20.757451
2	5	7	t	1	2025-08-02 00:23:21.745365	2025-08-02 00:23:21.745365
3	10	8	t	1	2025-08-02 00:23:23.014042	2025-08-02 00:23:23.014042
4	11	9	t	1	2025-08-02 00:23:24.029335	2025-08-02 00:23:24.029335
5	12	10	t	1	2025-08-02 00:23:24.993226	2025-08-02 00:23:24.993226
6	3	11	t	1	2025-08-02 00:23:25.981332	2025-08-02 00:23:25.981332
7	4	12	t	1	2025-08-02 00:23:27.03727	2025-08-02 00:23:27.03727
8	7	13	t	1	2025-08-02 00:23:28.125761	2025-08-02 00:23:28.125761
9	8	14	t	1	2025-08-02 00:23:29.177245	2025-08-02 00:23:29.177245
10	9	15	t	1	2025-08-02 00:23:30.189343	2025-08-02 00:23:30.189343
11	13	16	t	1	2025-08-02 00:23:31.229181	2025-08-02 00:23:31.229181
12	14	17	t	1	2025-08-02 00:23:32.265289	2025-08-02 00:23:32.265289
13	15	18	t	1	2025-08-02 00:23:33.245152	2025-08-02 00:23:33.245152
14	16	19	t	1	2025-08-02 00:23:34.257353	2025-08-02 00:23:34.257353
15	1	5	t	1	2025-08-04 08:57:26.595301	2025-08-04 08:57:26.595301
16	6	4	t	1	2025-08-04 09:21:24.493241	2025-08-04 09:21:24.493241
\.


--
-- TOC entry 6105 (class 0 OID 18185)
-- Dependencies: 287
-- Data for Name: email_functions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_functions (id, name, slug, description, category, required_variables, is_active, created_at) FROM stdin;
1	Welcome Email	welcome	Sent to new users when they register	authentication	["userName", "userEmail"]	t	2025-08-01 21:01:16.242794
2	Password Reset	password-reset	Sent when users request password reset	authentication	["userName", "resetToken", "resetUrl"]	t	2025-08-01 21:01:16.434469
3	Order Confirmation	order-confirmation	Sent when an order is confirmed	orders	["userName", "orderNumber", "orderTotal", "orderItems"]	t	2025-08-01 21:01:16.635549
4	Order Shipped	order-shipped	Sent when an order is shipped	orders	["userName", "orderNumber", "trackingNumber", "estimatedDelivery"]	t	2025-08-01 21:01:16.833928
5	Account Verification	account-verification	Sent to verify user email address	authentication	["userName", "verificationToken", "verificationUrl"]	t	2025-08-01 21:01:17.017484
6	Email Confirmation	email-confirmation	Sent after successful email verification	authentication	["userName", "userEmail"]	t	2025-08-01 21:01:17.314878
7	Order Status Update	order-status-update	Sent when order status changes	orders	["userName", "orderNumber", "status", "statusDescription"]	t	2025-08-01 21:01:17.497804
8	Payment Confirmation	payment-confirmation	Sent when payment is confirmed	orders	["userName", "orderNumber", "paymentAmount", "paymentMethod"]	t	2025-08-01 21:01:17.676518
9	Shipping Notification	shipping-notification	Sent when order is ready for shipping	orders	["userName", "orderNumber", "shippingMethod", "estimatedDelivery"]	t	2025-08-01 21:01:17.857556
10	Account Deactivation	account-deactivation	Sent when account is deactivated	authentication	["userName", "deactivationReason", "reactivationUrl"]	t	2025-08-01 21:01:18.045965
11	Password Changed	password-changed	Sent when password is successfully changed	authentication	["userName", "changedAt", "ipAddress"]	t	2025-08-01 21:01:18.61925
12	Login Alert	login-alert	Sent for suspicious login attempts	authentication	["userName", "loginTime", "ipAddress", "deviceInfo"]	t	2025-08-01 21:01:18.807743
13	Newsletter Subscription	newsletter-subscription	Sent when user subscribes to newsletter	marketing	["userName", "subscriptionType", "unsubscribeUrl"]	t	2025-08-01 21:01:18.987724
14	Promotional Offer	promotional-offer	Sent for promotional campaigns	marketing	["userName", "offerTitle", "offerDescription", "expiryDate", "discountCode"]	t	2025-08-01 21:01:19.354726
15	System Maintenance	system-maintenance	Sent for scheduled maintenance	notifications	["maintenanceType", "startTime", "endTime", "affectedServices"]	t	2025-08-01 21:01:19.544848
16	Security Alert	security-alert	Sent for security-related events	notifications	["alertType", "severity", "description", "actionRequired"]	t	2025-08-01 21:01:19.727646
\.


--
-- TOC entry 6221 (class 0 OID 19709)
-- Dependencies: 403
-- Data for Name: email_gateways; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_gateways (id, name, type, host, port, username, password, api_key, api_secret, region, is_active, is_default, settings, created_at, updated_at) FROM stdin;
1	Default SMTP	smtp	\N	\N	\N	\N	\N	\N	\N	t	t	{"host": "smtp.gmail.com", "port": 587, "secure": false}	2025-08-07 20:32:03.235692	2025-08-07 20:32:03.235692
\.


--
-- TOC entry 6229 (class 0 OID 19813)
-- Dependencies: 411
-- Data for Name: email_retry_queue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_retry_queue (id, user_id, email_type, email_address, user_name, retry_count, max_retries, next_retry_at, created_at, updated_at, status) FROM stdin;
\.


--
-- TOC entry 6103 (class 0 OID 18165)
-- Dependencies: 285
-- Data for Name: email_template_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_template_categories (id, name, description, color, icon, created_at) FROM stdin;
1	authentication	User authentication emails	#EF4444	ri-shield-user-line	2025-08-01 20:20:49.794265
2	orders	Order-related emails	#10B981	ri-shopping-cart-line	2025-08-01 20:20:49.984236
3	marketing	Marketing and promotional emails	#8B5CF6	ri-mail-line	2025-08-01 20:20:50.167051
4	notifications	System notifications	#F59E0B	ri-notification-line	2025-08-01 20:20:50.366698
5	support	Customer support emails	#3B82F6	ri-customer-service-line	2025-08-01 20:20:50.55608
6	general	General purpose emails	#6B7280	ri-mail-line	2025-08-01 20:20:50.736111
\.


--
-- TOC entry 6079 (class 0 OID 17786)
-- Dependencies: 261
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_templates (id, name, subject, html_content, text_content, variables, is_active, created_at, updated_at, slug, category, description) FROM stdin;
4	Email Confirmation	Email Confirmed! Welcome to ReadnWin 🎉	<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Email Confirmed - Welcome to ReadnWin</title>\n  <style>\n    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }\n    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }\n    .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }\n    .success-box { background: #ECFDF5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0; }\n    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="header">\n      <h1>Email Confirmed! 🎉</h1>\n      <p>Your ReadnWin account is now active</p>\n    </div>\n    <div class="content">\n      <div class="success-box">\n        <h2>Congratulations {{userName}}! 👋</h2>\n        <p>Your email address has been successfully verified and your ReadnWin account is now fully activated!</p>\n      </div>\n      \n      <p>You can now access all the features of ReadnWin and start your reading journey. Here's what you can do next:</p>\n      \n      <ul>\n        <li>📚 Browse our extensive library of books</li>\n        <li>🎯 Set up your reading goals and preferences</li>\n        <li>📱 Start reading on any device</li>\n        <li>💡 Discover personalized recommendations</li>\n      </ul>\n      \n      <div style="text-align: center;">\n        <a href="http://localhost:3000/dashboard" class="button">Start Reading Now</a>\n      </div>\n      \n      <p>If you have any questions or need assistance, our support team is here to help!</p>\n      \n      <p>Happy reading! 📖<br>The ReadnWin Team</p>\n    </div>\n    <div class="footer">\n      <p>© 2024 ReadnWin. All rights reserved.</p>\n      <p>This email was sent to confirm your email verification.</p>\n    </div>\n  </div>\n</body>\n</html>	Email Confirmed! Welcome to ReadnWin 🎉\n\nCongratulations {{userName}}! 👋\n\nYour email address has been successfully verified and your ReadnWin account is now fully activated!\n\nYou can now access all the features of ReadnWin and start your reading journey. Here's what you can do next:\n\n- 📚 Browse our extensive library of books\n- 🎯 Set up your reading goals and preferences\n- 📱 Start reading on any device\n- 💡 Discover personalized recommendations\n\nStart reading now: http://localhost:3000/dashboard\n\nIf you have any questions or need assistance, our support team is here to help!\n\nHappy reading! 📖\nThe ReadnWin Team\n\n© 2024 ReadnWin. All rights reserved.	{"userName": "string"}	t	2025-08-01 20:21:39.869516	2025-08-01 20:21:39.869516	email-confirmation	authentication	Sent after successful email verification
5	Welcome Email	Welcome to ReadnWin! 📚 Your Reading Journey Begins	<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Welcome to ReadnWin</title>\n  <style>\n    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; }\n    .container { max-width: 600px; margin: 0 auto; padding: 20px; }\n    .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }\n    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }\n    .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0; }\n    .feature-box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 20px; border-radius: 8px; margin: 15px 0; }\n    .tip { background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 15px 0; }\n    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="header">\n      <h1>Welcome to ReadnWin! 📚</h1>\n      <p>Your journey to better reading starts here</p>\n    </div>\n    <div class="content">\n      <h2>Hello {{userName}}! 👋</h2>\n      <p>Welcome to ReadnWin, your ultimate destination for digital reading and learning. We're excited to have you join our community of book lovers!</p>\n      \n      <div class="feature-box">\n        <h3>🚀 Getting Started - Quick Guide</h3>\n        <p><strong>1. Explore Our Library:</strong> Browse thousands of books across all genres</p>\n        <p><strong>2. Set Reading Goals:</strong> Track your progress and stay motivated</p>\n        <p><strong>3. Use Our E-Reader:</strong> Enjoy a seamless reading experience on any device</p>\n        <p><strong>4. Join Discussions:</strong> Connect with fellow readers and share insights</p>\n      </div>\n      \n      <div class="feature-box">\n        <h3>💡 Pro Tips for Maximum Enjoyment</h3>\n        <ul>\n          <li><strong>Personalize Your Experience:</strong> Update your profile with your favorite genres</li>\n          <li><strong>Set Daily Reading Goals:</strong> Even 15 minutes a day can transform your reading habit</li>\n          <li><strong>Use Bookmarks & Notes:</strong> Save important passages and add your thoughts</li>\n          <li><strong>Explore Recommendations:</strong> Our AI suggests books based on your reading history</li>\n          <li><strong>Join Reading Challenges:</strong> Participate in monthly reading challenges for rewards</li>\n        </ul>\n      </div>\n      \n      <div class="tip">\n        <strong>💡 Quick Tip:</strong> Enable notifications to get personalized book recommendations and reading reminders!\n      </div>\n      \n      <div style="text-align: center;">\n        <a href="http://localhost:3000/dashboard" class="button">Start Your Reading Journey</a>\n      </div>\n      \n      <h3>📱 Available Everywhere</h3>\n      <p>Read on your computer, tablet, or phone. Your progress syncs across all devices, so you can pick up right where you left off.</p>\n      \n      <h3>🎯 Track Your Progress</h3>\n      <p>Monitor your reading statistics, set goals, and celebrate milestones. Our dashboard gives you insights into your reading habits and helps you stay motivated.</p>\n      \n      <h3>🤝 Need Help?</h3>\n      <p>Our support team is here to help! If you have any questions or need assistance, don't hesitate to reach out.</p>\n      \n      <p>Happy reading! 📖<br>The ReadnWin Team</p>\n    </div>\n    <div class="footer">\n      <p>© 2024 ReadnWin. All rights reserved.</p>\n      <p>This email was sent to you because you signed up for ReadnWin.</p>\n    </div>\n  </div>\n</body>\n</html>	Welcome to ReadnWin! 📚 Your Reading Journey Begins\n\nHello {{userName}}! 👋\n\nWelcome to ReadnWin, your ultimate destination for digital reading and learning. We're excited to have you join our community of book lovers!\n\n🚀 Getting Started - Quick Guide:\n1. Explore Our Library: Browse thousands of books across all genres\n2. Set Reading Goals: Track your progress and stay motivated\n3. Use Our E-Reader: Enjoy a seamless reading experience on any device\n4. Join Discussions: Connect with fellow readers and share insights\n\n💡 Pro Tips for Maximum Enjoyment:\n- Personalize Your Experience: Update your profile with your favorite genres\n- Set Daily Reading Goals: Even 15 minutes a day can transform your reading habit\n- Use Bookmarks & Notes: Save important passages and add your thoughts\n- Explore Recommendations: Our AI suggests books based on your reading history\n- Join Reading Challenges: Participate in monthly reading challenges for rewards\n\n💡 Quick Tip: Enable notifications to get personalized book recommendations and reading reminders!\n\nStart your reading journey: http://localhost:3000/dashboard\n\n📱 Available Everywhere\nRead on your computer, tablet, or phone. Your progress syncs across all devices, so you can pick up right where you left off.\n\n🎯 Track Your Progress\nMonitor your reading statistics, set goals, and celebrate milestones. Our dashboard gives you insights into your reading habits and helps you stay motivated.\n\n🤝 Need Help?\nOur support team is here to help! If you have any questions or need assistance, don't hesitate to reach out.\n\nHappy reading! 📖\nThe ReadnWin Team\n\n© 2024 ReadnWin. All rights reserved.	{"userName": "string"}	t	2025-08-01 20:22:40.147841	2025-08-01 20:22:40.147841	welcome	authentication	Sent to new users when they register or first visit dashboard
6	Password Reset	Reset Your ReadnWin Password 🔐	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Password Reset</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                We received a request to reset your ReadnWin password. If you didn't make this request, you can safely ignore this email.\n            </div>\n            <div class="alert-box">\n                <h3>🔐 Password Reset Request</h3>\n                <p>Click the button below to reset your password. This link will expire in 24 hours for your security.</p>\n            </div>\n            <div style="text-align: center;">\n                <a href="{{resetUrl}}" class="button">Reset My Password</a>\n            </div>\n            <div class="message">\n                For security reasons, this link will expire in 24 hours. If you need a new link, please request another password reset from your account settings.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nWe received a request to reset your ReadnWin password. If you didn't make this request, you can safely ignore this email.\n\nPASSWORD RESET REQUEST\nClick the link below to reset your password. This link will expire in 24 hours for your security.\n\nReset My Password: {{resetUrl}}\n\nFor security reasons, this link will expire in 24 hours. If you need a new link, please request another password reset from your account settings.	{"resetUrl": "string", "userName": "string", "resetToken": "string"}	t	2025-08-02 00:23:20.164238	2025-08-02 00:23:20.164238	password-reset	authentication	Sent when users request password reset
7	Account Verification	Verify Your ReadnWin Account ✉️	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Account Verification</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                Please verify your email address to complete your ReadnWin account setup. This helps us ensure the security of your account.\n            </div>\n            <div class="highlight-box">\n                <strong>Why verify your email?</strong><br>\n                • Secure your account<br>\n                • Receive important notifications<br>\n                • Access all features<br>\n                • Reset password if needed\n            </div>\n            <div style="text-align: center;">\n                <a href="{{verificationUrl}}" class="button">Verify My Email</a>\n            </div>\n            <div class="message">\n                If you didn't create a ReadnWin account, you can safely ignore this email.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nPlease verify your email address to complete your ReadnWin account setup. This helps us ensure the security of your account.\n\nWhy verify your email?\n• Secure your account\n• Receive important notifications\n• Access all features\n• Reset password if needed\n\nVerify My Email: {{verificationUrl}}\n\nIf you didn't create a ReadnWin account, you can safely ignore this email.	{"userName": "string", "verificationUrl": "string", "verificationToken": "string"}	t	2025-08-02 00:23:21.284235	2025-08-02 00:23:21.284235	account-verification	authentication	Sent to verify user email address
8	Account Deactivation	Your ReadnWin Account Has Been Deactivated	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Account Deactivation</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                Your ReadnWin account has been deactivated. We're sorry to see you go, but we understand that circumstances change.\n            </div>\n            <div class="info-box">\n                <h3>Account Status</h3>\n                <p><strong>Status:</strong> Deactivated</p>\n                <p><strong>Reason:</strong> {{deactivationReason}}</p>\n            </div>\n            <div class="message">\n                If you'd like to reactivate your account, you can do so at any time by clicking the button below.\n            </div>\n            <div style="text-align: center;">\n                <a href="{{reactivationUrl}}" class="button">Reactivate My Account</a>\n            </div>\n            <div class="message">\n                Thank you for being part of the ReadnWin community. We hope to see you again soon!\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nYour ReadnWin account has been deactivated. We're sorry to see you go, but we understand that circumstances change.\n\nACCOUNT STATUS\nStatus: Deactivated\nReason: {{deactivationReason}}\n\nIf you'd like to reactivate your account, you can do so at any time by visiting: {{reactivationUrl}}\n\nThank you for being part of the ReadnWin community. We hope to see you again soon!	{"userName": "string", "reactivationUrl": "string", "deactivationReason": "string"}	t	2025-08-02 00:23:22.552415	2025-08-02 00:23:22.552415	account-deactivation	authentication	Sent when account is deactivated
9	Password Changed	Your ReadnWin Password Has Been Changed 🔒	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Password Changed</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                Your ReadnWin password has been successfully changed. This action was performed on {{changedAt}}.\n            </div>\n            <div class="info-box">\n                <h3>Password Change Details</h3>\n                <p><strong>Changed At:</strong> {{changedAt}}</p>\n                <p><strong>IP Address:</strong> {{ipAddress}}</p>\n            </div>\n            <div class="alert-box">\n                <h3>🔒 Security Notice</h3>\n                <p>If you didn't change your password, please contact our support team immediately to secure your account.</p>\n            </div>\n            <div class="message">\n                Your account security is important to us. If you have any concerns, please don't hesitate to reach out.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nYour ReadnWin password has been successfully changed. This action was performed on {{changedAt}}.\n\nPASSWORD CHANGE DETAILS\nChanged At: {{changedAt}}\nIP Address: {{ipAddress}}\n\nSECURITY NOTICE\nIf you didn't change your password, please contact our support team immediately to secure your account.\n\nYour account security is important to us. If you have any concerns, please don't hesitate to reach out.	{"userName": "string", "changedAt": "string", "ipAddress": "string"}	t	2025-08-02 00:23:23.584451	2025-08-02 00:23:23.584451	password-changed	authentication	Sent when password is successfully changed
10	Login Alert	New Login to Your ReadnWin Account 🔔	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Login Alert</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                We detected a new login to your ReadnWin account. If this was you, no action is needed.\n            </div>\n            <div class="info-box">\n                <h3>Login Details</h3>\n                <p><strong>Login Time:</strong> {{loginTime}}</p>\n                <p><strong>IP Address:</strong> {{ipAddress}}</p>\n                <p><strong>Device:</strong> {{deviceInfo}}</p>\n            </div>\n            <div class="alert-box">\n                <h3>⚠️ Security Alert</h3>\n                <p>If this wasn't you, please change your password immediately and contact our support team.</p>\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/account/security" class="button">Review Account Security</a>\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nWe detected a new login to your ReadnWin account. If this was you, no action is needed.\n\nLOGIN DETAILS\nLogin Time: {{loginTime}}\nIP Address: {{ipAddress}}\nDevice: {{deviceInfo}}\n\nSECURITY ALERT\nIf this wasn't you, please change your password immediately and contact our support team.\n\nReview Account Security: https://readnwin.com/account/security	{"userName": "string", "ipAddress": "string", "loginTime": "string", "deviceInfo": "string"}	t	2025-08-02 00:23:24.540183	2025-08-02 00:23:24.540183	login-alert	authentication	Sent for suspicious login attempts
11	Order Confirmation	Order Confirmed - Thank You for Your Purchase! 📦	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Order Confirmation</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Thank you for your order, {{userName}}! 📦</div>\n            <div class="message">\n                Your order has been confirmed and is being processed. We'll notify you once it's ready for shipping.\n            </div>\n            <div class="info-box">\n                <h3>Order Details</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>Total Amount:</strong> {{orderTotal}}</p>\n                <p><strong>Status:</strong> Confirmed</p>\n            </div>\n            <div class="highlight-box">\n                <strong>What happens next?</strong><br>\n                • We'll process your order within 1-2 business days<br>\n                • You'll receive a shipping notification with tracking details<br>\n                • Your books will be delivered to your address\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Thank you for your order, {{userName}}!\n\nYour order has been confirmed and is being processed. We'll notify you once it's ready for shipping.\n\nORDER DETAILS\nOrder Number: {{orderNumber}}\nTotal Amount: {{orderTotal}}\nStatus: Confirmed\n\nWhat happens next?\n• We'll process your order within 1-2 business days\n• You'll receive a shipping notification with tracking details\n• Your books will be delivered to your address\n\nView Order Details: https://readnwin.com/orders/{{orderNumber}}	{"userName": "string", "orderItems": "array", "orderTotal": "string", "orderNumber": "string"}	t	2025-08-02 00:23:25.512347	2025-08-02 00:23:25.512347	order-confirmation	orders	Sent when an order is confirmed
12	Order Shipped	Your Order Has Been Shipped! 🚚	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Order Shipped</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Great news, {{userName}}! 🚚</div>\n            <div class="message">\n                Your order has been shipped and is on its way to you. You can track its progress using the information below.\n            </div>\n            <div class="info-box">\n                <h3>Shipping Information</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>\n                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/orders/{{orderNumber}}/tracking" class="button">Track My Order</a>\n            </div>\n            <div class="message">\n                We hope you enjoy your new books! Don't forget to share your reading experience with our community.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Great news, {{userName}}!\n\nYour order has been shipped and is on its way to you. You can track its progress using the information below.\n\nSHIPPING INFORMATION\nOrder Number: {{orderNumber}}\nTracking Number: {{trackingNumber}}\nEstimated Delivery: {{estimatedDelivery}}\n\nTrack My Order: https://readnwin.com/orders/{{orderNumber}}/tracking\n\nWe hope you enjoy your new books! Don't forget to share your reading experience with our community.	{"userName": "string", "orderNumber": "string", "trackingNumber": "string", "estimatedDelivery": "string"}	t	2025-08-02 00:23:26.541093	2025-08-02 00:23:26.541093	order-shipped	orders	Sent when an order is shipped
13	Order Status Update	Order Status Update - #{{orderNumber}}	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Order Status Update</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Hello {{userName}},</div>\n            <div class="message">\n                Your order status has been updated. Here are the latest details:\n            </div>\n            <div class="info-box">\n                <h3>Order Status Update</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>New Status:</strong> {{status}}</p>\n                <p><strong>Description:</strong> {{statusDescription}}</p>\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>\n            </div>\n            <div class="message">\n                We'll continue to keep you updated on your order's progress.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Hello {{userName}},\n\nYour order status has been updated. Here are the latest details:\n\nORDER STATUS UPDATE\nOrder Number: {{orderNumber}}\nNew Status: {{status}}\nDescription: {{statusDescription}}\n\nView Order Details: https://readnwin.com/orders/{{orderNumber}}\n\nWe'll continue to keep you updated on your order's progress.	{"status": "string", "userName": "string", "orderNumber": "string", "statusDescription": "string"}	t	2025-08-02 00:23:27.562155	2025-08-02 00:23:27.562155	order-status-update	orders	Sent when order status changes
14	Payment Confirmation	Payment Confirmed - Order #{{orderNumber}}	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Payment Confirmation</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Payment Confirmed, {{userName}}! 💳</div>\n            <div class="message">\n                Your payment has been successfully processed. Thank you for your purchase!\n            </div>\n            <div class="info-box">\n                <h3>Payment Details</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>Amount:</strong> {{paymentAmount}}</p>\n                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>\n            </div>\n            <div class="highlight-box">\n                <strong>What's next?</strong><br>\n                • We'll process your order<br>\n                • You'll receive shipping updates<br>\n                • Your books will be delivered\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">View Order Details</a>\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Payment Confirmed, {{userName}}!\n\nYour payment has been successfully processed. Thank you for your purchase!\n\nPAYMENT DETAILS\nOrder Number: {{orderNumber}}\nAmount: {{paymentAmount}}\nPayment Method: {{paymentMethod}}\n\nWhat's next?\n• We'll process your order\n• You'll receive shipping updates\n• Your books will be delivered\n\nView Order Details: https://readnwin.com/orders/{{orderNumber}}	{"userName": "string", "orderNumber": "string", "paymentAmount": "string", "paymentMethod": "string"}	t	2025-08-02 00:23:28.628344	2025-08-02 00:23:28.628344	payment-confirmation	orders	Sent when payment is confirmed
15	Shipping Notification	Your Order is Ready for Shipping! 📦	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Shipping Notification</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Your Order is Ready, {{userName}}! 📦</div>\n            <div class="message">\n                Great news! Your order has been processed and is ready for shipping. Here are the shipping details:\n            </div>\n            <div class="info-box">\n                <h3>Shipping Information</h3>\n                <p><strong>Order Number:</strong> {{orderNumber}}</p>\n                <p><strong>Shipping Method:</strong> {{shippingMethod}}</p>\n                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>\n            </div>\n            <div class="highlight-box">\n                <strong>Shipping Timeline</strong><br>\n                • Order processed and packed<br>\n                • Ready for pickup by courier<br>\n                • Tracking number will be provided soon\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/orders/{{orderNumber}}" class="button">Track My Order</a>\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Your Order is Ready, {{userName}}!\n\nGreat news! Your order has been processed and is ready for shipping. Here are the shipping details:\n\nSHIPPING INFORMATION\nOrder Number: {{orderNumber}}\nShipping Method: {{shippingMethod}}\nEstimated Delivery: {{estimatedDelivery}}\n\nShipping Timeline\n• Order processed and packed\n• Ready for pickup by courier\n• Tracking number will be provided soon\n\nTrack My Order: https://readnwin.com/orders/{{orderNumber}}	{"userName": "string", "orderNumber": "string", "shippingMethod": "string", "estimatedDelivery": "string"}	t	2025-08-02 00:23:29.684347	2025-08-02 00:23:29.684347	shipping-notification	orders	Sent when order is ready for shipping
16	Newsletter Subscription	Welcome to ReadnWin Newsletter! 📰	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Newsletter Subscription</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Welcome to Our Newsletter, {{userName}}! 📰</div>\n            <div class="message">\n                Thank you for subscribing to the ReadnWin newsletter! You'll now receive the latest updates, book recommendations, and exclusive offers.\n            </div>\n            <div class="highlight-box">\n                <strong>What you'll receive:</strong><br>\n                • Weekly book recommendations<br>\n                • Reading tips and insights<br>\n                • Exclusive discounts and offers<br>\n                • Community highlights and events\n            </div>\n            <div class="message">\n                We're excited to share our passion for reading with you. Look out for our first newsletter coming soon!\n            </div>\n            <div style="text-align: center;">\n                <a href="{{unsubscribeUrl}}" class="button" style="background: #6b7280;">Unsubscribe</a>\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Welcome to Our Newsletter, {{userName}}!\n\nThank you for subscribing to the ReadnWin newsletter! You'll now receive the latest updates, book recommendations, and exclusive offers.\n\nWhat you'll receive:\n• Weekly book recommendations\n• Reading tips and insights\n• Exclusive discounts and offers\n• Community highlights and events\n\nWe're excited to share our passion for reading with you. Look out for our first newsletter coming soon!\n\nUnsubscribe: {{unsubscribeUrl}}	{"userName": "string", "unsubscribeUrl": "string", "subscriptionType": "string"}	t	2025-08-02 00:23:30.697706	2025-08-02 00:23:30.697706	newsletter-subscription	marketing	Sent when user subscribes to newsletter
17	Promotional Offer	Special Offer Just for You! 🎁	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Promotional Offer</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Special Offer for You, {{userName}}! 🎁</div>\n            <div class="message">\n                We have an exclusive offer just for you! Don't miss out on this limited-time opportunity.\n            </div>\n            <div class="highlight-box">\n                <strong>{{offerTitle}}</strong><br>\n                {{offerDescription}}<br>\n                <strong>Expires:</strong> {{expiryDate}}\n            </div>\n            <div class="info-box">\n                <h3>Your Discount Code</h3>\n                <p style="font-size: 18px; font-weight: 600; color: #3B82F6;">{{discountCode}}</p>\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/books" class="button">Shop Now</a>\n            </div>\n            <div class="message">\n                This offer is valid until {{expiryDate}}. Use your discount code at checkout to save!\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Special Offer for You, {{userName}}!\n\nWe have an exclusive offer just for you! Don't miss out on this limited-time opportunity.\n\n{{offerTitle}}\n{{offerDescription}}\nExpires: {{expiryDate}}\n\nYour Discount Code: {{discountCode}}\n\nShop Now: https://readnwin.com/books\n\nThis offer is valid until {{expiryDate}}. Use your discount code at checkout to save!	{"userName": "string", "expiryDate": "string", "offerTitle": "string", "discountCode": "string", "offerDescription": "string"}	t	2025-08-02 00:23:31.741571	2025-08-02 00:23:31.741571	promotional-offer	marketing	Sent for promotional campaigns
18	System Maintenance	Scheduled Maintenance Notice 🔧	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>System Maintenance</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Scheduled Maintenance Notice</div>\n            <div class="message">\n                We'll be performing scheduled maintenance to improve your ReadnWin experience. During this time, some services may be temporarily unavailable.\n            </div>\n            <div class="info-box">\n                <h3>Maintenance Details</h3>\n                <p><strong>Type:</strong> {{maintenanceType}}</p>\n                <p><strong>Start Time:</strong> {{startTime}}</p>\n                <p><strong>End Time:</strong> {{endTime}}</p>\n                <p><strong>Affected Services:</strong> {{affectedServices}}</p>\n            </div>\n            <div class="highlight-box">\n                <strong>What to expect:</strong><br>\n                • Brief service interruptions<br>\n                • Improved performance after maintenance<br>\n                • All data will be safe and secure\n            </div>\n            <div class="message">\n                We apologize for any inconvenience and appreciate your patience. We'll be back online as soon as possible!\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Scheduled Maintenance Notice\n\nWe'll be performing scheduled maintenance to improve your ReadnWin experience. During this time, some services may be temporarily unavailable.\n\nMAINTENANCE DETAILS\nType: {{maintenanceType}}\nStart Time: {{startTime}}\nEnd Time: {{endTime}}\nAffected Services: {{affectedServices}}\n\nWhat to expect:\n• Brief service interruptions\n• Improved performance after maintenance\n• All data will be safe and secure\n\nWe apologize for any inconvenience and appreciate your patience. We'll be back online as soon as possible!	{"endTime": "string", "startTime": "string", "maintenanceType": "string", "affectedServices": "string"}	t	2025-08-02 00:23:32.777797	2025-08-02 00:23:32.777797	system-maintenance	notifications	Sent for scheduled maintenance
19	Security Alert	Security Alert - Action Required 🔒	\n<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Security Alert</title>\n    <style>\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }\n        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }\n        .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 40px 30px; text-align: center; }\n        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }\n        .header p { font-size: 16px; opacity: 0.9; }\n        .content { padding: 40px 30px; }\n        .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1f2937; }\n        .message { font-size: 16px; line-height: 1.7; margin-bottom: 25px; color: #4b5563; }\n        .highlight-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0; }\n        .button { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }\n        .button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }\n        .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }\n        .footer p { font-size: 14px; color: #6b7280; margin-bottom: 10px; }\n        .social-links { margin-top: 20px; }\n        .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }\n        .info-box { background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .info-box h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #1f2937; }\n        .info-box p { font-size: 14px; color: #6b7280; margin-bottom: 5px; }\n        .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 25px 0; }\n        .alert-box h3 { color: #dc2626; font-size: 16px; font-weight: 600; margin-bottom: 10px; }\n        .alert-box p { color: #7f1d1d; font-size: 14px; }\n        @media (max-width: 600px) { .header, .content, .footer { padding: 20px; } .header h1 { font-size: 24px; } }\n    </style>\n</head>\n<body>\n    <div class="container">\n        <div class="header">\n            <h1>📚 ReadnWin</h1>\n            <p>Your Digital Reading Companion</p>\n        </div>\n        \n        <div class="content">\n            \n            <div class="greeting">Security Alert - Action Required</div>\n            <div class="message">\n                We've detected a security-related event on your account that requires your attention.\n            </div>\n            <div class="alert-box">\n                <h3>🔒 Security Alert</h3>\n                <p><strong>Alert Type:</strong> {{alertType}}</p>\n                <p><strong>Severity:</strong> {{severity}}</p>\n                <p><strong>Description:</strong> {{description}}</p>\n            </div>\n            <div class="message">\n                <strong>Action Required:</strong> {{actionRequired}}\n            </div>\n            <div style="text-align: center;">\n                <a href="https://readnwin.com/account/security" class="button">Secure My Account</a>\n            </div>\n            <div class="message">\n                If you have any questions or need assistance, please contact our security team immediately.\n            </div>\n        </div>\n        \n        <div class="footer">\n            <p>Thank you for choosing ReadnWin!</p>\n            <p>If you have any questions, please contact our support team.</p>\n            <div class="social-links">\n                <a href="#">📧 Support</a> | <a href="#">🌐 Website</a> | <a href="#">📱 App</a>\n            </div>\n            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">\n                © 2024 ReadnWin. All rights reserved.<br>\n                You received this email because you're a registered user of ReadnWin.\n            </p>\n        </div>\n    </div>\n</body>\n</html>	Security Alert - Action Required\n\nWe've detected a security-related event on your account that requires your attention.\n\nSECURITY ALERT\nAlert Type: {{alertType}}\nSeverity: {{severity}}\nDescription: {{description}}\n\nAction Required: {{actionRequired}}\n\nSecure My Account: https://readnwin.com/account/security\n\nIf you have any questions or need assistance, please contact our security team immediately.	{"severity": "string", "alertType": "string", "description": "string", "actionRequired": "string"}	t	2025-08-02 00:23:33.762207	2025-08-02 00:23:33.762207	security-alert	notifications	Sent for security-related events
\.


--
-- TOC entry 6189 (class 0 OID 19305)
-- Dependencies: 371
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, answer, category, is_active, display_order, created_at, updated_at) FROM stdin;
1	How do I get started with ReadnWin?	Simply sign up for a free account and start exploring our vast library of books. You can read on any device and sync your progress across platforms.	general	t	1	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
2	What types of books are available?	We offer a comprehensive collection including fiction, non-fiction, academic texts, self-help books, and much more. Our library is constantly growing with new releases.	general	t	2	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
3	Can I read offline?	Yes! You can download books to read offline. Simply tap the download button on any book and it will be available for offline reading.	general	t	3	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
4	How much does ReadnWin cost?	We offer both free and premium plans. The free plan includes access to thousands of books, while premium unlocks our entire library and advanced features.	pricing	t	1	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
5	How do I cancel my subscription?	You can cancel your subscription anytime from your account settings. There are no cancellation fees and you'll continue to have access until the end of your billing period.	pricing	t	2	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
6	Is my reading data private?	Absolutely. We take your privacy seriously. Your reading history and personal data are encrypted and never shared with third parties without your explicit consent.	privacy	t	1	2025-08-06 13:11:27.723022	2025-08-06 13:11:27.723022
7	How do I get started with ReadnWin?	Simply sign up for a free account and start exploring our vast library of books. You can read on any device and sync your progress across platforms.	general	t	1	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
8	What types of books are available?	We offer a comprehensive collection including fiction, non-fiction, academic texts, self-help books, and much more. Our library is constantly growing with new releases.	general	t	2	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
9	Can I read offline?	Yes! You can download books to read offline. Simply tap the download button on any book and it will be available for offline reading.	general	t	3	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
10	How much does ReadnWin cost?	We offer both free and premium plans. The free plan includes access to thousands of books, while premium unlocks our entire library and advanced features.	pricing	t	1	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
11	How do I cancel my subscription?	You can cancel your subscription anytime from your account settings. There are no cancellation fees and you'll continue to have access until the end of your billing period.	pricing	t	2	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
12	Is my reading data private?	Absolutely. We take your privacy seriously. Your reading history and personal data are encrypted and never shared with third parties without your explicit consent.	privacy	t	1	2025-08-06 13:52:18.253932	2025-08-06 13:52:18.253932
\.


--
-- TOC entry 6217 (class 0 OID 19668)
-- Dependencies: 399
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transactions (id, book_id, transaction_type, quantity, previous_stock, new_stock, reference_id, reference_type, notes, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 6129 (class 0 OID 18520)
-- Dependencies: 311
-- Data for Name: nigerian_lgas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nigerian_lgas (id, state_id, name, created_at) FROM stdin;
1435	70	Nembe	2025-08-02 14:11:10.403743
1436	70	Ogbia	2025-08-02 14:11:10.606366
1437	70	Sagbama	2025-08-02 14:11:10.938491
1438	70	Southern Ijaw	2025-08-02 14:11:11.162578
1439	70	Yenagoa	2025-08-02 14:11:11.520373
1440	71	Ado	2025-08-02 14:11:12.081438
1441	71	Agatu	2025-08-02 14:11:12.651821
1442	71	Apa	2025-08-02 14:11:12.847297
1443	71	Buruku	2025-08-02 14:11:13.276938
1444	71	Gboko	2025-08-02 14:11:13.768111
1445	71	Guma	2025-08-02 14:11:14.274538
1446	71	Gwer East	2025-08-02 14:11:14.873216
1447	71	Gwer West	2025-08-02 14:11:15.281377
1448	71	Katsina-Ala	2025-08-02 14:11:15.478441
1449	71	Konshisha	2025-08-02 14:11:15.758294
1450	71	Kwande	2025-08-02 14:11:15.98031
1451	71	Logo	2025-08-02 14:11:16.256556
1452	71	Makurdi	2025-08-02 14:11:16.474494
1453	71	Obi	2025-08-02 14:11:16.803299
1454	71	Ogbadibo	2025-08-02 14:11:16.999993
1455	71	Ohimini	2025-08-02 14:11:17.306149
1456	71	Oju	2025-08-02 14:11:17.502318
1457	71	Okpokwu	2025-08-02 14:11:17.836104
1458	71	Oturkpo	2025-08-02 14:11:18.035653
1459	71	Tarka	2025-08-02 14:11:18.353103
1460	71	Ukum	2025-08-02 14:11:18.554216
1461	71	Ushongo	2025-08-02 14:11:18.873275
1462	71	Vandeikya	2025-08-02 14:11:19.39814
1463	72	Abadam	2025-08-02 14:11:19.94549
1464	72	Askira/Uba	2025-08-02 14:11:20.142667
1465	72	Bama	2025-08-02 14:11:20.463409
1466	72	Bayo	2025-08-02 14:11:20.660055
1467	72	Biu	2025-08-02 14:11:20.856076
1468	72	Chibok	2025-08-02 14:11:21.06221
1469	72	Damboa	2025-08-02 14:11:21.26089
1470	72	Dikwa	2025-08-02 14:11:21.492291
1471	72	Gubio	2025-08-02 14:11:21.690775
1472	72	Guzamala	2025-08-02 14:11:22.564127
1473	72	Gwoza	2025-08-02 14:11:22.760187
1474	72	Hawul	2025-08-02 14:11:23.155709
1475	72	Jere	2025-08-02 14:11:23.355585
1476	72	Kaga	2025-08-02 14:11:23.67133
1477	72	Kala/Balge	2025-08-02 14:11:23.870165
1478	72	Konduga	2025-08-02 14:11:24.205235
1479	72	Kukawa	2025-08-02 14:11:24.413024
1480	72	Kwaya Kusar	2025-08-02 14:11:24.782285
1481	72	Mafa	2025-08-02 14:11:25.223506
1482	72	Magumeri	2025-08-02 14:11:25.43432
1483	72	Maiduguri	2025-08-02 14:11:25.737071
1484	72	Marte	2025-08-02 14:11:25.940204
1485	72	Mobbar	2025-08-02 14:11:26.217385
1486	72	Monguno	2025-08-02 14:11:26.735758
1487	72	Ngala	2025-08-02 14:11:26.9512
1488	72	Nganzai	2025-08-02 14:11:27.310433
1489	72	Shani	2025-08-02 14:11:27.508167
1490	73	Abi	2025-08-02 14:11:28.070962
1491	73	Akamkpa	2025-08-02 14:11:28.427117
1492	73	Akpabuyo	2025-08-02 14:11:28.855965
1493	73	Bakassi	2025-08-02 14:11:29.062115
1494	73	Bekwarra	2025-08-02 14:11:29.363338
1495	73	Biase	2025-08-02 14:11:29.602314
1496	73	Boki	2025-08-02 14:11:29.940613
1497	73	Calabar Municipal	2025-08-02 14:11:30.161526
1498	73	Calabar South	2025-08-02 14:11:30.415399
1499	73	Etung	2025-08-02 14:11:30.610306
1500	73	Ikom	2025-08-02 14:11:30.952494
1501	73	Obanliku	2025-08-02 14:11:31.152407
1502	73	Obubra	2025-08-02 14:11:31.461573
1503	73	Obudu	2025-08-02 14:11:31.677162
1504	73	Odukpani	2025-08-02 14:11:32.077474
1505	73	Ogoja	2025-08-02 14:11:32.282123
1506	73	Yakuur	2025-08-02 14:11:32.553941
1507	73	Yala	2025-08-02 14:11:32.760131
1508	74	Aniocha North	2025-08-02 14:11:33.7519
1509	74	Aniocha South	2025-08-02 14:11:34.244698
1510	74	Bomadi	2025-08-02 14:11:34.453594
1511	74	Burutu	2025-08-02 14:11:34.764195
1512	74	Ethiope East	2025-08-02 14:11:34.960157
1513	74	Ethiope West	2025-08-02 14:11:35.215144
1514	74	Ika North East	2025-08-02 14:11:35.422321
1515	74	Ika South	2025-08-02 14:11:35.740385
1516	74	Isoko North	2025-08-02 14:11:35.935112
1517	74	Isoko South	2025-08-02 14:11:36.266686
1518	74	Ndokwa East	2025-08-02 14:11:36.465214
1519	74	Ndokwa West	2025-08-02 14:11:36.801355
1520	74	Okpe	2025-08-02 14:11:37.012954
1521	74	Oshimili North	2025-08-02 14:11:37.335397
1522	74	Oshimili South	2025-08-02 14:11:37.527029
1523	74	Patani	2025-08-02 14:11:37.844129
1524	74	Sapele	2025-08-02 14:11:38.060418
1525	74	Udu	2025-08-02 14:11:38.37242
1526	74	Ughelli North	2025-08-02 14:11:38.572964
1527	74	Ughelli South	2025-08-02 14:11:38.891863
1528	74	Ukwuani	2025-08-02 14:11:39.092271
1529	74	Uvwie	2025-08-02 14:11:39.410221
1530	74	Warri North	2025-08-02 14:11:39.607862
1531	74	Warri South	2025-08-02 14:11:39.960247
1532	74	Warri South West	2025-08-02 14:11:40.162433
1533	75	Abakaliki	2025-08-02 14:11:40.673217
1534	75	Afikpo North	2025-08-02 14:11:40.991361
1535	75	Afikpo South	2025-08-02 14:11:41.194165
1536	75	Ebonyi	2025-08-02 14:11:41.408547
1537	75	Ezza North	2025-08-02 14:11:41.603356
1538	75	Ezza South	2025-08-02 14:11:41.800331
1539	75	Ikwo	2025-08-02 14:11:42.043375
1540	75	Ishielu	2025-08-02 14:11:42.248062
1541	75	Ivo	2025-08-02 14:11:42.792407
1542	75	Izzi	2025-08-02 14:11:43.243461
1543	75	Ohaozara	2025-08-02 14:11:43.442654
1544	75	Ohaukwu	2025-08-02 14:11:43.760233
1545	75	Onicha	2025-08-02 14:11:43.955039
1546	76	Akoko-Edo	2025-08-02 14:11:44.733643
1547	76	Egor	2025-08-02 14:11:44.935229
1548	76	Esan Central	2025-08-02 14:11:45.313488
1549	76	Esan North-East	2025-08-02 14:11:45.5122
1550	76	Esan South-East	2025-08-02 14:11:45.796713
1551	76	Esan West	2025-08-02 14:11:45.99568
1552	76	Etsako Central	2025-08-02 14:11:46.331295
1553	76	Etsako East	2025-08-02 14:11:46.525265
1554	76	Etsako West	2025-08-02 14:11:46.840668
1555	76	Igueben	2025-08-02 14:11:47.073771
1556	76	Ikpoba Okha	2025-08-02 14:11:47.403199
1557	76	Oredo	2025-08-02 14:11:47.600205
1558	76	Orhionmwon	2025-08-02 14:11:47.872813
1559	76	Ovia North-East	2025-08-02 14:11:48.070239
1560	76	Ovia South-West	2025-08-02 14:11:48.41029
1561	76	Owan East	2025-08-02 14:11:48.609347
1562	76	Owan West	2025-08-02 14:11:48.924499
1563	76	Uhunmwonde	2025-08-02 14:11:49.120321
1564	77	Ado Ekiti	2025-08-02 14:11:49.657264
1565	77	Efon	2025-08-02 14:11:49.857245
1566	77	Ekiti East	2025-08-02 14:11:50.055169
1567	77	Ekiti South-West	2025-08-02 14:11:50.487986
1568	77	Ekiti West	2025-08-02 14:11:50.68936
1569	77	Emure	2025-08-02 14:11:50.915474
1570	77	Gbonyin	2025-08-02 14:11:51.120039
1571	77	Ido Osi	2025-08-02 14:11:51.549224
1572	77	Ijero	2025-08-02 14:11:51.744038
1573	77	Ikere	2025-08-02 14:11:51.944932
1574	77	Ikole	2025-08-02 14:11:52.145962
1575	77	Ilejemeje	2025-08-02 14:11:52.347227
1576	77	Irepodun/Ifelodun	2025-08-02 14:11:52.765811
1577	77	Ise/Orun	2025-08-02 14:11:52.961333
1578	77	Moba	2025-08-02 14:11:53.295101
1579	77	Oye	2025-08-02 14:11:53.490342
1580	78	Aninri	2025-08-02 14:11:54.320295
1581	78	Awgu	2025-08-02 14:11:54.558509
1582	78	Enugu East	2025-08-02 14:11:54.84505
1583	78	Enugu North	2025-08-02 14:11:55.043238
1584	78	Enugu South	2025-08-02 14:11:55.389025
1585	78	Ezeagu	2025-08-02 14:11:55.626398
1586	78	Igbo Etiti	2025-08-02 14:11:55.834059
1587	78	Igbo Eze North	2025-08-02 14:11:56.037318
1588	78	Igbo Eze South	2025-08-02 14:11:56.360339
1589	78	Isi Uzo	2025-08-02 14:11:56.595122
1590	78	Nkanu East	2025-08-02 14:11:56.894108
1591	78	Nkanu West	2025-08-02 14:11:57.092038
1592	78	Nsukka	2025-08-02 14:11:57.400181
1593	78	Oji River	2025-08-02 14:11:57.597004
1594	78	Udenu	2025-08-02 14:11:58.071678
1595	78	Udi	2025-08-02 14:11:58.560406
1596	78	Uzo Uwani	2025-08-02 14:11:58.994773
1597	79	Abuja Municipal Area Council	2025-08-02 14:11:59.502503
1598	79	Gwagwalada	2025-08-02 14:11:59.699988
1599	79	Kuje	2025-08-02 14:12:00.040692
1600	79	Abaji	2025-08-02 14:12:00.250141
1601	79	Kwali	2025-08-02 14:12:00.562271
1602	80	Akko	2025-08-02 14:12:00.960199
1603	80	Balanga	2025-08-02 14:12:01.157031
1604	80	Billiri	2025-08-02 14:12:01.587336
1605	80	Dukku	2025-08-02 14:12:01.785073
1606	80	Funakaye	2025-08-02 14:12:02.005416
1607	80	Gombe	2025-08-02 14:12:02.20542
1608	80	Kaltungo	2025-08-02 14:12:02.410353
1609	80	Kwami	2025-08-02 14:12:02.885529
1610	80	Nafada	2025-08-02 14:12:03.086023
1611	80	Shongom	2025-08-02 14:12:03.413645
1612	80	Yamaltu/Deba	2025-08-02 14:12:03.610044
1613	81	Aboh Mbaise	2025-08-02 14:12:04.135327
1614	81	Ahiazu Mbaise	2025-08-02 14:12:04.477142
1615	81	Ehime Mbano	2025-08-02 14:12:04.675264
1616	81	Ezinihitte	2025-08-02 14:12:04.925229
1617	81	Ideato North	2025-08-02 14:12:05.120138
1618	81	Ideato South	2025-08-02 14:12:05.466457
1619	81	Ihitte/Uboma	2025-08-02 14:12:05.671329
1620	81	Ikeduru	2025-08-02 14:12:05.972708
1621	81	Isiala Mbano	2025-08-02 14:12:06.257303
1622	81	Isu	2025-08-02 14:12:06.495263
1623	81	Mbaitoli	2025-08-02 14:12:06.69033
1624	81	Ngor Okpala	2025-08-02 14:12:07.010295
1625	81	Njaba	2025-08-02 14:12:07.210821
1626	81	Nkwerre	2025-08-02 14:12:07.545445
1627	81	Nwangele	2025-08-02 14:12:07.752912
1628	81	Obowo	2025-08-02 14:12:08.06039
1629	81	Oguta	2025-08-02 14:12:08.260366
1630	81	Ohaji/Egbema	2025-08-02 14:12:08.592309
1631	81	Okigwe	2025-08-02 14:12:08.802872
1632	81	Orlu	2025-08-02 14:12:09.107095
1633	81	Orsu	2025-08-02 14:12:09.335545
1634	81	Oru East	2025-08-02 14:12:09.642008
1635	81	Oru West	2025-08-02 14:12:09.86536
1636	81	Owerri Municipal	2025-08-02 14:12:10.152172
2052	99	Gashaka	2025-08-02 14:14:10.255194
2053	99	Gassol	2025-08-02 14:14:10.49382
2054	99	Ibi	2025-08-02 14:14:10.70219
2055	99	Jalingo	2025-08-02 14:14:10.902456
2056	99	Karim Lamido	2025-08-02 14:14:11.102712
2057	99	Kumi	2025-08-02 14:14:11.320274
2058	99	Lau	2025-08-02 14:14:11.544194
2059	99	Sardauna	2025-08-02 14:14:11.752393
2060	99	Takum	2025-08-02 14:14:11.948467
2061	99	Ussa	2025-08-02 14:14:12.152216
2062	99	Wukari	2025-08-02 14:14:12.352226
2063	99	Yorro	2025-08-02 14:14:12.76039
2064	99	Zing	2025-08-02 14:14:12.962763
1390	67	Uyo	2025-08-02 14:10:56.812689
1391	68	Aguata	2025-08-02 14:10:57.510432
1392	68	Anambra East	2025-08-02 14:10:57.821159
1393	68	Anambra West	2025-08-02 14:10:58.020319
1394	68	Anaocha	2025-08-02 14:10:58.365313
1395	68	Awka North	2025-08-02 14:10:58.566213
1396	68	Awka South	2025-08-02 14:10:58.872294
1397	68	Ayamelum	2025-08-02 14:10:59.070357
1398	68	Dunukofia	2025-08-02 14:10:59.381472
1399	68	Ekwusigo	2025-08-02 14:10:59.590083
1400	68	Idemili North	2025-08-02 14:10:59.800079
1401	68	Idemili South	2025-08-02 14:10:59.997256
1402	68	Ihiala	2025-08-02 14:11:00.213074
1403	68	Njikoka	2025-08-02 14:11:00.434131
1404	68	Nnewi North	2025-08-02 14:11:00.642384
1405	68	Nnewi South	2025-08-02 14:11:00.841677
1406	68	Ogbaru	2025-08-02 14:11:01.035216
1407	68	Onitsha North	2025-08-02 14:11:01.243225
1408	68	Onitsha South	2025-08-02 14:11:01.504335
1409	68	Orumba North	2025-08-02 14:11:01.724712
1410	68	Orumba South	2025-08-02 14:11:02.026227
1411	68	Oyi	2025-08-02 14:11:02.231272
1412	69	Alkaleri	2025-08-02 14:11:03.147446
1413	69	Bauchi	2025-08-02 14:11:03.654269
1414	69	Bogoro	2025-08-02 14:11:03.86829
1415	69	Damban	2025-08-02 14:11:04.161234
1416	69	Darazo	2025-08-02 14:11:04.632763
1417	69	Dass	2025-08-02 14:11:04.842446
1418	69	Gamawa	2025-08-02 14:11:05.189645
1419	69	Ganjuwa	2025-08-02 14:11:05.675258
1420	69	Giade	2025-08-02 14:11:05.883113
1421	69	Itas/Gadau	2025-08-02 14:11:06.200158
1422	69	Jama'are	2025-08-02 14:11:06.40208
1423	69	Katagum	2025-08-02 14:11:06.736862
1424	69	Kirfi	2025-08-02 14:11:06.948291
1425	69	Misau	2025-08-02 14:11:07.266535
1426	69	Ningi	2025-08-02 14:11:07.473413
1427	69	Shira	2025-08-02 14:11:07.763893
1428	69	Tafawa Balewa	2025-08-02 14:11:07.957466
1429	69	Toro	2025-08-02 14:11:08.294438
1430	69	Warji	2025-08-02 14:11:08.503287
1431	69	Zaki	2025-08-02 14:11:08.922462
1432	70	Brass	2025-08-02 14:11:09.542126
1433	70	Ekeremor	2025-08-02 14:11:09.75898
1434	70	Kolokuma/Opokuma	2025-08-02 14:11:10.023303
2065	100	Bade	2025-08-02 14:14:13.478445
2066	100	Bursari	2025-08-02 14:14:13.812415
2067	100	Damaturu	2025-08-02 14:14:14.013691
2068	100	Fika	2025-08-02 14:14:14.317181
2069	100	Fune	2025-08-02 14:14:14.518338
2070	100	Geidam	2025-08-02 14:14:14.84227
2071	100	Gujba	2025-08-02 14:14:15.046368
2072	100	Gulani	2025-08-02 14:14:15.390273
2073	100	Jakusko	2025-08-02 14:14:15.609064
2074	100	Karasuwa	2025-08-02 14:14:15.844302
2075	100	Machina	2025-08-02 14:14:16.038131
2076	100	Nangere	2025-08-02 14:14:16.383376
2077	100	Nguru	2025-08-02 14:14:16.592452
2078	100	Potiskum	2025-08-02 14:14:16.879753
2079	100	Tarmuwa	2025-08-02 14:14:17.085057
2080	100	Yunusari	2025-08-02 14:14:17.402414
2081	100	Yusufari	2025-08-02 14:14:17.618236
2082	101	Anka	2025-08-02 14:14:18.143447
2083	101	Bakura	2025-08-02 14:14:18.453583
2084	101	Birnin Magaji/Kiyaw	2025-08-02 14:14:18.662585
2085	101	Bukkuyum	2025-08-02 14:14:19.030211
2086	101	Bungudu	2025-08-02 14:14:19.231159
2087	101	Gummi	2025-08-02 14:14:19.506994
2088	101	Gusau	2025-08-02 14:14:19.713984
2089	101	Kaura Namoda	2025-08-02 14:14:20.029642
2090	101	Maradun	2025-08-02 14:14:20.225341
2091	101	Maru	2025-08-02 14:14:20.544191
2092	101	Shinkafi	2025-08-02 14:14:20.752237
2093	101	Talata Mafara	2025-08-02 14:14:20.977597
2094	101	Chafe	2025-08-02 14:14:21.192487
2095	101	Zurmi	2025-08-02 14:14:21.602342
1637	81	Owerri North	2025-08-02 14:12:10.406248
1638	81	Owerri West	2025-08-02 14:12:10.746442
1639	81	Unuimo	2025-08-02 14:12:10.956842
1640	82	Auyo	2025-08-02 14:12:11.4106
1641	82	Babura	2025-08-02 14:12:11.756285
1642	82	Biriniwa	2025-08-02 14:12:11.964643
1643	82	Birnin Kudu	2025-08-02 14:12:12.248264
1644	82	Buji	2025-08-02 14:12:12.447016
1645	82	Dutse	2025-08-02 14:12:13.000215
1646	82	Gagarawa	2025-08-02 14:12:13.47572
1647	82	Garki	2025-08-02 14:12:13.696167
1648	82	Gumel	2025-08-02 14:12:14.011299
1649	82	Guri	2025-08-02 14:12:14.215186
1650	82	Gwaram	2025-08-02 14:12:14.580793
1651	82	Gwiwa	2025-08-02 14:12:14.981231
1652	82	Hadejia	2025-08-02 14:12:15.171999
1653	82	Jahun	2025-08-02 14:12:15.527403
1654	82	Kafin Hausa	2025-08-02 14:12:15.732285
1655	82	Kaugama	2025-08-02 14:12:16.070762
1656	82	Kazaure	2025-08-02 14:12:16.277308
1657	82	Kiri Kasama	2025-08-02 14:12:16.551072
1658	82	Kiyawa	2025-08-02 14:12:16.758459
1659	82	Maigatari	2025-08-02 14:12:17.068185
1660	82	Malam Madori	2025-08-02 14:12:17.270507
1661	82	Miga	2025-08-02 14:12:17.603157
1662	82	Ringim	2025-08-02 14:12:17.807394
1663	82	Roni	2025-08-02 14:12:18.150643
1664	82	Sule Tankarkar	2025-08-02 14:12:18.350686
1665	82	Taura	2025-08-02 14:12:18.675419
1666	82	Yankwashi	2025-08-02 14:12:18.874994
1667	83	Birnin Gwari	2025-08-02 14:12:19.371274
1668	83	Chikun	2025-08-02 14:12:19.694162
1669	83	Giwa	2025-08-02 14:12:19.900233
1670	83	Igabi	2025-08-02 14:12:20.100633
1671	83	Ikara	2025-08-02 14:12:20.29793
1672	83	Jaba	2025-08-02 14:12:20.498326
1673	83	Jema'a	2025-08-02 14:12:20.742697
1674	83	Kachia	2025-08-02 14:12:20.940977
1675	83	Kaduna North	2025-08-02 14:12:21.136155
1676	83	Kaduna South	2025-08-02 14:12:21.332725
1677	83	Kagarko	2025-08-02 14:12:21.785448
1678	83	Kajuru	2025-08-02 14:12:21.987102
1679	83	Kaura	2025-08-02 14:12:22.185141
1680	83	Kauru	2025-08-02 14:12:22.380386
1681	83	Kubau	2025-08-02 14:12:22.815167
1682	83	Kudan	2025-08-02 14:12:23.395478
1683	83	Lere	2025-08-02 14:12:23.876968
1684	83	Makarfi	2025-08-02 14:12:24.097692
1685	83	Sabon Gari	2025-08-02 14:12:24.40306
1686	83	Sanga	2025-08-02 14:12:25.376259
1687	83	Soba	2025-08-02 14:12:25.923269
1688	83	Zangon Kataf	2025-08-02 14:12:26.122018
1689	83	Zaria	2025-08-02 14:12:26.425448
1690	84	Ajingi	2025-08-02 14:12:26.945181
1691	84	Albasu	2025-08-02 14:12:27.150407
1692	84	Bagwai	2025-08-02 14:12:27.622501
1693	84	Bebeji	2025-08-02 14:12:28.182574
1694	84	Bichi	2025-08-02 14:12:28.520241
1695	84	Bunkure	2025-08-02 14:12:28.725184
1696	84	Dala	2025-08-02 14:12:29.045389
1697	84	Dambatta	2025-08-02 14:12:29.242435
1698	84	Dawakin Kudu	2025-08-02 14:12:29.569222
1699	84	Dawakin Tofa	2025-08-02 14:12:29.771064
1700	84	Doguwa	2025-08-02 14:12:30.094351
1701	84	Fagge	2025-08-02 14:12:30.292116
1702	84	Gabasawa	2025-08-02 14:12:30.614272
1703	84	Garko	2025-08-02 14:12:31.127231
1704	84	Garum Mallam	2025-08-02 14:12:31.330948
1705	84	Gaya	2025-08-02 14:12:31.687221
1706	84	Gezawa	2025-08-02 14:12:31.892949
1707	84	Gwale	2025-08-02 14:12:32.092476
1708	84	Gwarzo	2025-08-02 14:12:32.290163
1709	84	Kabo	2025-08-02 14:12:32.570283
1710	84	Kano Municipal	2025-08-02 14:12:32.87513
1711	84	Karaye	2025-08-02 14:12:33.070076
1712	84	Kibiya	2025-08-02 14:12:33.401683
1713	84	Kiru	2025-08-02 14:12:33.930734
1714	84	Kumbotso	2025-08-02 14:12:34.126291
1715	84	Kunchi	2025-08-02 14:12:34.458214
1716	84	Kura	2025-08-02 14:12:34.671859
1717	84	Madobi	2025-08-02 14:12:34.985766
1718	84	Makoda	2025-08-02 14:12:35.191128
1719	84	Minjibir	2025-08-02 14:12:35.52114
1720	84	Nasarawa	2025-08-02 14:12:35.718111
1721	84	Rano	2025-08-02 14:12:35.966117
1722	84	Rimin Gado	2025-08-02 14:12:36.160121
1723	84	Rogo	2025-08-02 14:12:36.485364
1724	84	Shanono	2025-08-02 14:12:36.680809
1725	84	Sumaila	2025-08-02 14:12:37.011855
1726	84	Takai	2025-08-02 14:12:37.275947
1727	84	Tarauni	2025-08-02 14:12:37.532373
1728	84	Tofa	2025-08-02 14:12:37.7412
1729	84	Tsanyawa	2025-08-02 14:12:38.055274
1730	84	Tudun Wada	2025-08-02 14:12:38.262901
1731	84	Ungogo	2025-08-02 14:12:38.597256
1732	84	Warawa	2025-08-02 14:12:38.795302
1733	84	Wudil	2025-08-02 14:12:39.095381
1734	85	Bakori	2025-08-02 14:12:39.660787
1735	85	Batagarawa	2025-08-02 14:12:39.900342
1736	85	Batsari	2025-08-02 14:12:40.170171
1737	85	Baure	2025-08-02 14:12:40.382414
1738	85	Bindawa	2025-08-02 14:12:40.673091
1739	85	Charanchi	2025-08-02 14:12:40.868682
1740	85	Dandume	2025-08-02 14:12:41.092485
1741	85	Danja	2025-08-02 14:12:41.297455
1742	85	Dan Musa	2025-08-02 14:12:41.739242
1743	85	Daura	2025-08-02 14:12:41.932268
1744	85	Dutsi	2025-08-02 14:12:42.144037
1745	85	Dutsin Ma	2025-08-02 14:12:42.345219
1746	85	Faskari	2025-08-02 14:12:42.788505
1747	85	Funtua	2025-08-02 14:12:42.982158
1748	85	Ingawa	2025-08-02 14:12:43.313689
1749	85	Jibia	2025-08-02 14:12:43.516039
1750	85	Kafur	2025-08-02 14:12:43.848243
1751	85	Kaita	2025-08-02 14:12:44.045328
1752	85	Kankara	2025-08-02 14:12:44.371354
1753	85	Kankia	2025-08-02 14:12:44.812105
1754	85	Katsina	2025-08-02 14:12:45.020259
1755	85	Kurfi	2025-08-02 14:12:45.393063
1756	85	Kusada	2025-08-02 14:12:45.63045
1757	85	Mai'Adua	2025-08-02 14:12:45.862286
1758	85	Malumfashi	2025-08-02 14:12:46.093218
1759	85	Mani	2025-08-02 14:12:46.394153
1760	85	Mashi	2025-08-02 14:12:46.597214
1761	85	Matazu	2025-08-02 14:12:46.943608
1762	85	Musawa	2025-08-02 14:12:47.154072
1763	85	Rimi	2025-08-02 14:12:47.447313
1764	85	Sabuwa	2025-08-02 14:12:47.693457
1765	85	Safana	2025-08-02 14:12:47.956267
1766	85	Sandamu	2025-08-02 14:12:48.155287
1767	85	Zango	2025-08-02 14:12:48.49088
1768	86	Aleiro	2025-08-02 14:12:49.11147
1769	86	Arewa Dandi	2025-08-02 14:12:49.569196
1770	86	Argungu	2025-08-02 14:12:49.771173
1771	86	Augie	2025-08-02 14:12:50.067232
1772	86	Bagudo	2025-08-02 14:12:50.265172
1773	86	Birnin Kebbi	2025-08-02 14:12:50.576697
1774	86	Bunza	2025-08-02 14:12:50.775507
1775	86	Dandi	2025-08-02 14:12:50.982253
1776	86	Fakai	2025-08-02 14:12:51.210168
1777	86	Gwandu	2025-08-02 14:12:51.626367
1778	86	Jega	2025-08-02 14:12:51.826925
1779	86	Kalgo	2025-08-02 14:12:52.022484
1780	86	Koko/Besse	2025-08-02 14:12:52.22045
1781	86	Maiyama	2025-08-02 14:12:52.420432
1782	86	Ngaski	2025-08-02 14:12:52.850286
1783	86	Sakaba	2025-08-02 14:12:53.045139
1784	86	Shanga	2025-08-02 14:12:53.360157
1785	86	Suru	2025-08-02 14:12:53.558351
1786	86	Wasagu/Danko	2025-08-02 14:12:53.951018
1787	86	Yauri	2025-08-02 14:12:54.426484
1788	86	Zuru	2025-08-02 14:12:54.625051
1789	87	Adavi	2025-08-02 14:12:55.161377
1790	87	Ajaokuta	2025-08-02 14:12:55.462067
1791	87	Ankpa	2025-08-02 14:12:55.922288
1792	87	Bassa	2025-08-02 14:12:56.129763
1793	87	Dekina	2025-08-02 14:12:56.448288
1794	87	Ibaji	2025-08-02 14:12:56.736248
1795	87	Idah	2025-08-02 14:12:57.007422
1796	87	Igalamela Odolu	2025-08-02 14:12:57.215259
1797	87	Ijumu	2025-08-02 14:12:57.511497
1798	87	Kabba/Bunu	2025-08-02 14:12:57.710472
1799	87	Kogi	2025-08-02 14:12:58.01624
1800	87	Lokoja	2025-08-02 14:12:58.216239
1801	87	Mopa Muro	2025-08-02 14:12:58.556277
1802	87	Ofu	2025-08-02 14:12:58.752174
1803	87	Ogori/Magongo	2025-08-02 14:12:59.1025
1804	87	Okehi	2025-08-02 14:12:59.301053
1805	87	Okene	2025-08-02 14:12:59.641392
1806	87	Olamaboro	2025-08-02 14:12:59.872924
1807	87	Omala	2025-08-02 14:13:00.118258
1808	87	Yagba East	2025-08-02 14:13:00.31525
1809	87	Yagba West	2025-08-02 14:13:00.651344
1810	88	Asa	2025-08-02 14:13:01.07825
1811	88	Baruten	2025-08-02 14:13:01.287119
1812	88	Edu	2025-08-02 14:13:01.680519
1813	88	Ekiti	2025-08-02 14:13:01.88028
1814	88	Ifelodun	2025-08-02 14:13:02.08013
1815	88	Ilorin East	2025-08-02 14:13:02.280669
1816	88	Ilorin South	2025-08-02 14:13:02.765281
1817	88	Ilorin West	2025-08-02 14:13:02.963642
1818	88	Irepodun	2025-08-02 14:13:03.295909
1819	88	Isin	2025-08-02 14:13:03.495168
1820	88	Kaiama	2025-08-02 14:13:03.87729
1821	88	Moro	2025-08-02 14:13:04.370506
1822	88	Offa	2025-08-02 14:13:04.569348
1823	88	Oke Ero	2025-08-02 14:13:04.808582
1824	88	Oyun	2025-08-02 14:13:05.005184
1825	88	Pategi	2025-08-02 14:13:05.355493
1826	89	Agege	2025-08-02 14:13:05.847221
1827	89	Ajeromi-Ifelodun	2025-08-02 14:13:06.061113
1828	89	Alimosho	2025-08-02 14:13:06.376236
1829	89	Amuwo-Odofin	2025-08-02 14:13:06.570041
1830	89	Apapa	2025-08-02 14:13:06.936035
1831	89	Badagry	2025-08-02 14:13:07.14208
1832	89	Epe	2025-08-02 14:13:07.537204
1833	89	Eti Osa	2025-08-02 14:13:08.053037
1834	89	Ibeju-Lekki	2025-08-02 14:13:08.498269
1835	89	Ifako-Ijaiye	2025-08-02 14:13:08.718242
1836	89	Ikeja	2025-08-02 14:13:09.005233
1837	89	Ikorodu	2025-08-02 14:13:09.202141
1838	89	Kosofe	2025-08-02 14:13:09.52325
1839	89	Lagos Island	2025-08-02 14:13:09.73944
1840	89	Lagos Mainland	2025-08-02 14:13:09.931337
1841	89	Mushin	2025-08-02 14:13:10.131143
1842	89	Ojo	2025-08-02 14:13:10.329094
1843	89	Oshodi-Isolo	2025-08-02 14:13:10.580695
1844	89	Shomolu	2025-08-02 14:13:10.780921
1845	89	Surulere	2025-08-02 14:13:10.977341
1846	89	Yewa South	2025-08-02 14:13:11.175249
1847	90	Akwanga	2025-08-02 14:13:11.622874
1848	90	Awe	2025-08-02 14:13:11.822565
1849	90	Doma	2025-08-02 14:13:12.028137
1850	90	Karu	2025-08-02 14:13:12.232396
1851	90	Keana	2025-08-02 14:13:12.442377
1852	90	Keffi	2025-08-02 14:13:12.830687
1853	90	Kokona	2025-08-02 14:13:13.042244
1854	90	Lafia	2025-08-02 14:13:13.383349
1855	90	Nasarawa	2025-08-02 14:13:13.872463
1856	90	Nasarawa Egon	2025-08-02 14:13:14.100157
1857	90	Obi	2025-08-02 14:13:14.405533
1858	90	Toto	2025-08-02 14:13:14.612149
1859	90	Wamba	2025-08-02 14:13:14.931113
1860	91	Agaie	2025-08-02 14:13:15.453365
1861	91	Agwara	2025-08-02 14:13:15.663185
1862	91	Bida	2025-08-02 14:13:16.112343
1863	91	Borgu	2025-08-02 14:13:16.442748
1864	91	Bosso	2025-08-02 14:13:16.641954
1865	91	Chanchaga	2025-08-02 14:13:16.974495
1866	91	Edati	2025-08-02 14:13:17.197313
1867	91	Gbako	2025-08-02 14:13:17.477485
1868	91	Gurara	2025-08-02 14:13:17.675216
1869	91	Katcha	2025-08-02 14:13:18.00207
1870	91	Kontagora	2025-08-02 14:13:18.205337
1871	91	Lapai	2025-08-02 14:13:18.552094
1872	91	Lavun	2025-08-02 14:13:18.75423
1873	91	Magama	2025-08-02 14:13:19.110469
1874	91	Mariga	2025-08-02 14:13:19.312227
1875	91	Mashegu	2025-08-02 14:13:19.575237
1876	91	Mokwa	2025-08-02 14:13:19.772714
1877	91	Moya	2025-08-02 14:13:20.104805
1878	91	Paikoro	2025-08-02 14:13:20.312239
1879	91	Rafi	2025-08-02 14:13:20.693971
1880	91	Rijau	2025-08-02 14:13:20.910491
1881	91	Shiroro	2025-08-02 14:13:21.145478
1882	91	Suleja	2025-08-02 14:13:21.346232
1883	91	Tafa	2025-08-02 14:13:21.702474
1884	91	Wushishi	2025-08-02 14:13:21.920091
1885	92	Abeokuta North	2025-08-02 14:13:22.683242
1886	92	Abeokuta South	2025-08-02 14:13:22.887348
1887	92	Ado-Odo/Ota	2025-08-02 14:13:23.203364
1888	92	Egbado North	2025-08-02 14:13:23.40543
1889	92	Egbado South	2025-08-02 14:13:23.858646
1890	92	Ewekoro	2025-08-02 14:13:24.272754
1891	92	Ifo	2025-08-02 14:13:24.485988
1892	92	Ijebu East	2025-08-02 14:13:24.728437
1893	92	Ijebu North	2025-08-02 14:13:24.928167
1894	92	Ijebu North East	2025-08-02 14:13:25.282519
1895	92	Ijebu Ode	2025-08-02 14:13:25.510272
1896	92	Ikenne	2025-08-02 14:13:25.950275
1897	92	Imeko Afon	2025-08-02 14:13:26.80386
1898	92	Ipokia	2025-08-02 14:13:27.026304
1899	92	Obafemi Owode	2025-08-02 14:13:27.334525
1900	92	Odeda	2025-08-02 14:13:27.535468
1901	92	Odogbolu	2025-08-02 14:13:27.860391
1902	92	Ogun Waterside	2025-08-02 14:13:28.058176
1903	92	Remo North	2025-08-02 14:13:28.45067
1904	92	Shagamu	2025-08-02 14:13:28.656193
1905	93	Akoko North-East	2025-08-02 14:13:29.110355
1906	93	Akoko North-West	2025-08-02 14:13:29.448279
1907	93	Akoko South-East	2025-08-02 14:13:29.653077
1908	93	Akoko South-West	2025-08-02 14:13:29.853332
1909	93	Akure North	2025-08-02 14:13:30.052055
1910	93	Akure South	2025-08-02 14:13:30.482596
1911	93	Ese Odo	2025-08-02 14:13:30.692068
1912	93	Idanre	2025-08-02 14:13:30.903279
1913	93	Ifedore	2025-08-02 14:13:31.110161
1914	93	Ilaje	2025-08-02 14:13:31.531313
1915	93	Ile Oluji/Okeigbo	2025-08-02 14:13:31.732324
1916	93	Irele	2025-08-02 14:13:31.954049
1917	93	Odigbo	2025-08-02 14:13:32.162517
1918	93	Okitipupa	2025-08-02 14:13:32.417751
1919	93	Ondo East	2025-08-02 14:13:32.742128
1920	93	Ondo West	2025-08-02 14:13:33.273489
1921	93	Ose	2025-08-02 14:13:33.483077
1922	93	Owo	2025-08-02 14:13:33.785192
1923	94	Aiyedade	2025-08-02 14:13:34.302154
1924	94	Aiyedire	2025-08-02 14:13:34.503178
1925	94	Atakunmosa East	2025-08-02 14:13:34.833324
1926	94	Atakunmosa West	2025-08-02 14:13:35.052585
1927	94	Boluwaduro	2025-08-02 14:13:35.354247
1928	94	Boripe	2025-08-02 14:13:35.57221
1929	94	Ede North	2025-08-02 14:13:35.81416
1930	94	Ede South	2025-08-02 14:13:36.010293
1931	94	Egbedore	2025-08-02 14:13:36.340396
1932	94	Ejigbo	2025-08-02 14:13:36.552102
1933	94	Ife Central	2025-08-02 14:13:36.900507
1934	94	Ife East	2025-08-02 14:13:37.110839
1935	94	Ife North	2025-08-02 14:13:37.385089
1936	94	Ife South	2025-08-02 14:13:37.609054
1937	94	Ifedayo	2025-08-02 14:13:37.916157
1938	94	Ifelodun	2025-08-02 14:13:38.122266
1939	94	Ila	2025-08-02 14:13:38.430682
1940	94	Ilesa East	2025-08-02 14:13:38.624172
1941	94	Ilesa West	2025-08-02 14:13:38.982311
1942	94	Irepodun	2025-08-02 14:13:39.178052
1943	94	Irewole	2025-08-02 14:13:39.489299
1944	94	Isokan	2025-08-02 14:13:39.696822
1945	94	Iwo	2025-08-02 14:13:40.031762
1946	94	Obokun	2025-08-02 14:13:40.532562
1947	94	Odo Otin	2025-08-02 14:13:40.773939
1948	94	Ola Oluwa	2025-08-02 14:13:41.141349
1949	94	Olorunda	2025-08-02 14:13:41.572869
1950	94	Oriade	2025-08-02 14:13:41.772239
1951	94	Orolu	2025-08-02 14:13:41.970668
1952	94	Osogbo	2025-08-02 14:13:42.171689
1953	95	Afijio	2025-08-02 14:13:42.755317
1954	95	Akinyele	2025-08-02 14:13:42.962318
1955	95	Atiba	2025-08-02 14:13:43.272447
1956	95	Atisbo	2025-08-02 14:13:43.472815
1957	95	Egbeda	2025-08-02 14:13:43.804583
1958	95	Ibadan North	2025-08-02 14:13:44.012382
1959	95	Ibadan North-East	2025-08-02 14:13:44.332293
1960	95	Ibadan North-West	2025-08-02 14:13:44.550789
1961	95	Ibadan South-East	2025-08-02 14:13:44.791215
1962	95	Ibadan South-West	2025-08-02 14:13:44.992271
1963	95	Ibarapa Central	2025-08-02 14:13:45.314375
1964	95	Ibarapa East	2025-08-02 14:13:45.512298
1965	95	Ibarapa North	2025-08-02 14:13:45.872834
1966	95	Ido	2025-08-02 14:13:46.074913
1967	95	Irepo	2025-08-02 14:13:46.371968
1968	95	Iseyin	2025-08-02 14:13:46.583056
1969	95	Itesiwaju	2025-08-02 14:13:46.912559
1970	95	Iwajowa	2025-08-02 14:13:47.110119
1971	95	Kajola	2025-08-02 14:13:47.404237
1972	95	Lagelu	2025-08-02 14:13:47.645143
1973	95	Ogbomosho North	2025-08-02 14:13:47.922127
1974	95	Ogbomosho South	2025-08-02 14:13:48.128885
1975	95	Ogo Oluwa	2025-08-02 14:13:48.461704
1976	95	Olorunsogo	2025-08-02 14:13:48.658036
1977	95	Oluyole	2025-08-02 14:13:48.991124
1978	95	Ona Ara	2025-08-02 14:13:49.196997
1979	95	Orelope	2025-08-02 14:13:49.516061
1980	95	Ori Ire	2025-08-02 14:13:49.745086
1981	95	Oyo East	2025-08-02 14:13:50.020312
1982	95	Oyo West	2025-08-02 14:13:50.213538
1983	95	Saki East	2025-08-02 14:13:50.541075
1984	95	Saki West	2025-08-02 14:13:50.740088
1985	95	Surulere	2025-08-02 14:13:50.97018
1322	65	Aba North	2025-08-02 14:10:37.96027
1323	65	Aba South	2025-08-02 14:10:38.474055
1324	65	Arochukwu	2025-08-02 14:10:38.683951
1325	65	Bende	2025-08-02 14:10:39.014033
1326	65	Ikwuano	2025-08-02 14:10:39.222505
1327	65	Isiala Ngwa North	2025-08-02 14:10:39.52259
1328	65	Isiala Ngwa South	2025-08-02 14:10:39.732314
1329	65	Isuikwuato	2025-08-02 14:10:40.049705
1330	65	Obi Ngwa	2025-08-02 14:10:40.25341
1331	65	Ohafia	2025-08-02 14:10:40.57326
1332	65	Osisioma	2025-08-02 14:10:40.767225
1333	65	Ugwunagbo	2025-08-02 14:10:40.990158
1334	65	Ukwa East	2025-08-02 14:10:41.193139
1335	65	Ukwa West	2025-08-02 14:10:41.615349
1336	65	Umuahia North	2025-08-02 14:10:41.832113
1337	65	Umuahia South	2025-08-02 14:10:42.042523
1338	65	Umu Nneochi	2025-08-02 14:10:42.243289
1339	66	Demsa	2025-08-02 14:10:42.782213
1340	66	Fufure	2025-08-02 14:10:43.122358
1341	66	Ganye	2025-08-02 14:10:43.320235
1342	66	Gayuk	2025-08-02 14:10:43.645534
1343	66	Gombi	2025-08-02 14:10:43.840107
1344	66	Grie	2025-08-02 14:10:44.165255
1345	66	Hong	2025-08-02 14:10:44.372365
1346	66	Jada	2025-08-02 14:10:44.606115
1347	66	Larmurde	2025-08-02 14:10:44.814905
1348	66	Madagali	2025-08-02 14:10:45.132387
1349	66	Maiha	2025-08-02 14:10:45.330125
1350	66	Mayo Belwa	2025-08-02 14:10:45.6632
1351	66	Michika	2025-08-02 14:10:45.86728
1352	66	Mubi North	2025-08-02 14:10:46.191684
1353	66	Mubi South	2025-08-02 14:10:46.390498
1354	66	Numan	2025-08-02 14:10:46.702426
1355	66	Shelleng	2025-08-02 14:10:46.902308
1356	66	Song	2025-08-02 14:10:47.230706
1357	66	Toungo	2025-08-02 14:10:47.428334
1358	66	Yola North	2025-08-02 14:10:47.752347
1359	66	Yola South	2025-08-02 14:10:47.950403
1360	67	Abak	2025-08-02 14:10:48.470123
1361	67	Eastern Obolo	2025-08-02 14:10:48.800109
1362	67	Eket	2025-08-02 14:10:48.995372
1986	96	Barkin Ladi	2025-08-02 14:13:51.599793
1987	96	Bassa	2025-08-02 14:13:51.812232
1988	96	Bokkos	2025-08-02 14:13:52.010407
1989	96	Jos East	2025-08-02 14:13:52.205253
1990	96	Jos North	2025-08-02 14:13:52.40083
1991	96	Jos South	2025-08-02 14:13:52.820552
1992	96	Kanam	2025-08-02 14:13:53.02509
1993	96	Kanke	2025-08-02 14:13:53.437281
1994	96	Langtang North	2025-08-02 14:13:53.903477
1995	96	Langtang South	2025-08-02 14:13:54.511268
1996	96	Mangu	2025-08-02 14:13:54.908754
1997	96	Mikang	2025-08-02 14:13:55.432467
1998	96	Pankshin	2025-08-02 14:13:55.632378
1999	96	Qua'an Pan	2025-08-02 14:13:55.893741
2000	96	Riyom	2025-08-02 14:13:56.090199
2001	96	Shendam	2025-08-02 14:13:56.422237
2002	96	Wase	2025-08-02 14:13:56.682534
2003	97	Abua/Odual	2025-08-02 14:13:57.172347
2004	97	Ahoada East	2025-08-02 14:13:57.456019
2005	97	Ahoada West	2025-08-02 14:13:57.655449
2006	97	Akuku-Toru	2025-08-02 14:13:57.97628
2007	97	Andoni	2025-08-02 14:13:58.175418
2008	97	Asari-Toru	2025-08-02 14:13:58.513948
2009	97	Bonny	2025-08-02 14:13:58.722315
2010	97	Degema	2025-08-02 14:13:59.040373
2011	97	Eleme	2025-08-02 14:13:59.242031
2012	97	Emohua	2025-08-02 14:13:59.55074
2013	97	Etche	2025-08-02 14:13:59.7652
2014	97	Gokana	2025-08-02 14:14:00.142247
2015	97	Ikwerre	2025-08-02 14:14:00.342276
2016	97	Khana	2025-08-02 14:14:00.60056
2017	97	Obio/Akpor	2025-08-02 14:14:00.845329
2018	97	Ogba/Egbema/Ndoni	2025-08-02 14:14:01.200141
2019	97	Ogu/Bolo	2025-08-02 14:14:01.395272
2020	97	Okrika	2025-08-02 14:14:01.650962
2021	97	Omuma	2025-08-02 14:14:01.845185
2022	97	Opobo/Nkoro	2025-08-02 14:14:02.041194
2023	97	Oyigbo	2025-08-02 14:14:02.255313
2024	97	Port Harcourt	2025-08-02 14:14:02.694506
2025	97	Tai	2025-08-02 14:14:02.890836
2026	98	Binji	2025-08-02 14:14:03.4224
2027	98	Bodinga	2025-08-02 14:14:03.770288
2028	98	Dange Shuni	2025-08-02 14:14:03.982048
2029	98	Gada	2025-08-02 14:14:04.283852
2030	98	Goronyo	2025-08-02 14:14:04.518155
2031	98	Gudu	2025-08-02 14:14:04.773719
2032	98	Gwadabawa	2025-08-02 14:14:04.967037
2033	98	Illela	2025-08-02 14:14:05.28952
2034	98	Isa	2025-08-02 14:14:05.485453
2035	98	Kebbe	2025-08-02 14:14:05.771514
2036	98	Kware	2025-08-02 14:14:05.970613
2037	98	Rabah	2025-08-02 14:14:06.303406
2038	98	Sabon Birni	2025-08-02 14:14:06.517211
2039	98	Shagari	2025-08-02 14:14:06.815373
2040	98	Silame	2025-08-02 14:14:07.022115
2041	98	Sokoto North	2025-08-02 14:14:07.340395
2042	98	Sokoto South	2025-08-02 14:14:07.54514
2043	98	Tambuwal	2025-08-02 14:14:07.873282
2044	98	Tangaza	2025-08-02 14:14:08.070116
2045	98	Tureta	2025-08-02 14:14:08.394335
2046	98	Wamako	2025-08-02 14:14:08.598283
2047	98	Wurno	2025-08-02 14:14:08.917125
2048	98	Yabo	2025-08-02 14:14:09.115215
2049	99	Ardo Kola	2025-08-02 14:14:09.652886
2050	99	Bali	2025-08-02 14:14:09.855069
2051	99	Donga	2025-08-02 14:14:10.060537
1363	67	Esit Eket	2025-08-02 14:10:49.333278
1364	67	Essien Udim	2025-08-02 14:10:49.5305
1365	67	Etim Ekpo	2025-08-02 14:10:49.730246
1366	67	Etinan	2025-08-02 14:10:49.933141
1367	67	Ibeno	2025-08-02 14:10:50.142062
1368	67	Ibesikpo Asutan	2025-08-02 14:10:50.550372
1369	67	Ibiono-Ibom	2025-08-02 14:10:50.772355
1370	67	Ika	2025-08-02 14:10:50.972358
1371	67	Ikono	2025-08-02 14:10:51.172694
1372	67	Ikot Abasi	2025-08-02 14:10:51.424694
1373	67	Ikot Ekpene	2025-08-02 14:10:51.622382
1374	67	Ini	2025-08-02 14:10:51.820145
1375	67	Itu	2025-08-02 14:10:52.030602
1376	67	Mbo	2025-08-02 14:10:52.232177
1377	67	Mkpat-Enin	2025-08-02 14:10:52.653121
1378	67	Nsit-Atai	2025-08-02 14:10:52.847697
1379	67	Nsit-Ibom	2025-08-02 14:10:53.268319
1380	67	Nsit-Ubium	2025-08-02 14:10:53.691354
1381	67	Obot Akara	2025-08-02 14:10:53.921046
1382	67	Okobo	2025-08-02 14:10:54.355163
1383	67	Onna	2025-08-02 14:10:54.85069
1384	67	Oron	2025-08-02 14:10:55.226606
1385	67	Oruk Anam	2025-08-02 14:10:55.424235
1386	67	Udung-Uko	2025-08-02 14:10:55.740541
1387	67	Ukanafun	2025-08-02 14:10:55.937063
1388	67	Uruan	2025-08-02 14:10:56.234386
1389	67	Urue-Offong/Oruko	2025-08-02 14:10:56.440148
\.


--
-- TOC entry 6127 (class 0 OID 18510)
-- Dependencies: 309
-- Data for Name: nigerian_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.nigerian_states (id, name, created_at) FROM stdin;
71	Benue	2025-08-02 14:11:11.837305
72	Borno	2025-08-02 14:11:19.599192
73	Cross River	2025-08-02 14:11:27.873726
74	Delta	2025-08-02 14:11:33.230496
75	Ebonyi	2025-08-02 14:11:40.471053
76	Edo	2025-08-02 14:11:44.351541
77	Ekiti	2025-08-02 14:11:49.453582
78	Enugu	2025-08-02 14:11:53.903278
79	Federal Capital Territory	2025-08-02 14:11:59.206461
80	Gombe	2025-08-02 14:12:00.760268
81	Imo	2025-08-02 14:12:03.935082
82	Jigawa	2025-08-02 14:12:11.21029
83	Kaduna	2025-08-02 14:12:19.172048
84	Kano	2025-08-02 14:12:26.679367
85	Katsina	2025-08-02 14:12:39.293324
86	Kebbi	2025-08-02 14:12:48.688229
87	Kogi	2025-08-02 14:12:54.960134
88	Kwara	2025-08-02 14:13:00.845936
89	Lagos	2025-08-02 14:13:05.555048
90	Nasarawa	2025-08-02 14:13:11.37536
91	Niger	2025-08-02 14:13:15.132178
92	Ogun	2025-08-02 14:13:22.200298
93	Ondo	2025-08-02 14:13:28.910711
94	Osun	2025-08-02 14:13:33.993323
95	Oyo	2025-08-02 14:13:42.372209
96	Plateau	2025-08-02 14:13:51.172089
97	Rivers	2025-08-02 14:13:56.95151
98	Sokoto	2025-08-02 14:14:03.21618
99	Taraba	2025-08-02 14:14:09.454326
100	Yobe	2025-08-02 14:14:13.274107
101	Zamfara	2025-08-02 14:14:17.937207
65	Abia	2025-08-02 14:10:37.68317
66	Adamawa	2025-08-02 14:10:42.586486
67	Akwa Ibom	2025-08-02 14:10:48.27548
68	Anambra	2025-08-02 14:10:57.283423
69	Bauchi	2025-08-02 14:11:02.650273
70	Bayelsa	2025-08-02 14:11:09.335373
\.


--
-- TOC entry 6139 (class 0 OID 18618)
-- Dependencies: 321
-- Data for Name: note_shares; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.note_shares (id, note_id, shared_by, shared_with, permission, created_at) FROM stdin;
\.


--
-- TOC entry 6137 (class 0 OID 18598)
-- Dependencies: 319
-- Data for Name: note_tag_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.note_tag_assignments (id, note_id, tag_id, created_at) FROM stdin;
\.


--
-- TOC entry 6135 (class 0 OID 18582)
-- Dependencies: 317
-- Data for Name: note_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.note_tags (id, user_id, name, color, created_at) FROM stdin;
1	1	Important	#EF4444	2025-08-02 18:02:36.061279
2	1	To Review	#F59E0B	2025-08-02 18:02:36.061279
3	1	Insight	#10B981	2025-08-02 18:02:36.061279
4	1	Question	#8B5CF6	2025-08-02 18:02:36.061279
5	1	Quote	#06B6D4	2025-08-02 18:02:36.061279
\.


--
-- TOC entry 6141 (class 0 OID 18659)
-- Dependencies: 323
-- Data for Name: notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notes (id, user_id, book_id, page_number, chapter_title, note_type, content, color, is_public, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6173 (class 0 OID 19155)
-- Dependencies: 355
-- Data for Name: office_location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.office_location (id, address, hours, parking_info, map_url, is_active, created_at, updated_at) FROM stdin;
1	123 Reading Street, Book City, BC 12345	Monday - Friday: 9:00 AM - 6:00 PM	Free parking available in our building	\N	t	2025-08-05 21:38:03.064211+00	2025-08-05 21:38:03.064211+00
\.


--
-- TOC entry 6067 (class 0 OID 17632)
-- Dependencies: 249
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, book_id, title, author_name, price, quantity, total_price, format, created_at) FROM stdin;
1	2	2	The Great Gatsby	Sample Author	16.99	1	16.99	ebook	2025-07-31 19:51:48.403634
2	2	3	To Kill a Mockingbird	Sample Author	14.99	1	14.99	ebook	2025-07-31 19:51:48.5303
5	5	8	Atomic Habits	Sample Author	18.99	1	18.99	ebook	2025-07-31 19:52:19.654034
35	47	1	Pride and Prejudice	Test Author	9.99	1	9.99	ebook	2025-08-06 12:27:11.411538
36	48	1	Pride and Prejudice	Test Author	9.99	1	9.99	ebook	2025-08-06 12:27:23.582502
49	78	10	Dune	Frank Herbert	18.99	2	37.98	ebook	2025-08-08 15:45:30.480295
50	79	10	Dune	Frank Herbert	18.99	2	37.98	ebook	2025-08-08 15:58:21.22265
54	83	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-08 22:45:30.515238
55	84	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-08 23:03:50.683914
56	85	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-08 23:20:29.895387
57	86	87	MobyDick	Herman Melville	1200.00	2	2400.00	physical	2025-08-08 23:26:15.218932
58	87	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-08 23:31:48.170408
59	88	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-08 23:31:52.027463
60	89	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 00:04:42.326742
61	90	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 00:04:46.040543
62	91	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 09:50:06.465313
63	92	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 09:50:44.237268
64	93	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 09:53:00.260871
65	94	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 10:37:32.057529
66	95	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 10:38:30.834684
67	96	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 10:52:00.109503
68	97	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 11:17:50.320266
69	98	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 12:24:16.799783
70	99	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 12:32:43.481643
71	100	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 12:40:57.881268
72	101	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 12:52:39.494269
73	102	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 13:06:06.08833
74	104	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 13:53:19.153061
75	106	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 14:26:17.154354
76	108	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 17:13:37.832944
77	110	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-09 17:22:26.139709
78	111	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:28:18.139875
79	112	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:28:41.390432
80	113	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:34:53.361005
81	114	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:35:16.43485
82	115	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:35:16.938858
83	116	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 20:58:35.711243
84	118	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 21:02:54.245688
85	120	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 21:31:29.336494
86	122	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 21:33:11.890565
87	124	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 21:42:42.987411
88	126	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 21:49:19.905447
89	128	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 23:27:52.635597
90	129	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 23:28:01.263608
91	130	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-10 23:29:19.428105
92	131	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-11 11:02:04.249585
93	132	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-11 11:03:07.066609
94	133	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 09:06:41.271167
95	135	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 11:01:58.478081
96	136	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 14:55:39.802755
97	137	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 14:56:12.470795
98	138	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 15:00:22.264307
99	139	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 15:30:47.410336
100	140	87	MobyDick	Herman Melville	1200.00	1	1200.00	physical	2025-08-12 16:02:49.047898
101	141	1	Pride and Prejudice	Jane Austen	9.99	1	9.99	ebook	2025-08-12 16:37:36.410343
102	142	1	Pride and Prejudice	Jane Austen	9.99	1	9.99	ebook	2025-08-12 21:14:10.308757
103	143	1	Pride and Prejudice	Jane Austen	9.99	1	9.99	ebook	2025-08-12 21:14:12.096317
\.


--
-- TOC entry 6085 (class 0 OID 17867)
-- Dependencies: 267
-- Data for Name: order_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_notes (id, order_id, user_id, note, is_internal, note_type, created_at) FROM stdin;
\.


--
-- TOC entry 6083 (class 0 OID 17847)
-- Dependencies: 265
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, order_id, status, notes, created_at, created_by) FROM stdin;
1	2	pending	Order created	2025-08-03 19:43:18.634884	1
2	4	pending	Order created	2025-08-03 19:43:18.816673	1
3	5	pending	Order created	2025-08-03 19:43:19.01067	1
4	6	pending	Order created	2025-08-03 19:43:19.187468	1
5	7	pending	Order created	2025-08-03 19:43:19.306735	1
6	57	processing	\N	2025-08-07 11:49:12.40409	1
7	57	confirmed	\N	2025-08-07 11:54:02.41515	1
8	57	processing	\N	2025-08-07 11:54:59.361745	1
9	57	refunded	\N	2025-08-07 11:55:13.404668	1
10	57	cancelled	\N	2025-08-07 12:08:56.514882	1
11	57	delivered	\N	2025-08-07 12:09:09.285218	1
12	57	confirmed	\N	2025-08-07 12:09:16.805921	1
13	57	pending	\N	2025-08-07 12:09:30.622801	1
14	57	refunded	\N	2025-08-07 12:09:35.093936	1
15	59	confirmed	\N	2025-08-07 13:04:13.280484	1
16	135	confirmed	\N	2025-08-12 11:04:05.179667	1
\.


--
-- TOC entry 6065 (class 0 OID 17606)
-- Dependencies: 247
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, user_id, guest_email, status, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, currency, payment_method, payment_status, payment_transaction_id, shipping_address, billing_address, shipping_method, tracking_number, estimated_delivery_date, notes, created_at, updated_at, order_type, digital_items_count, physical_items_count, shipping_method_id, shipping_zone_id) FROM stdin;
63	TEST-001	1	\N	pending	1000.00	0.00	0.00	0.00	1000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-08 07:43:38.810389	2025-08-08 07:43:38.810389	mixed	0	0	\N	\N
64	TEST-002	1	\N	pending	2000.00	0.00	0.00	0.00	2000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-08 07:43:38.810389	2025-08-08 07:43:38.810389	mixed	0	0	\N	\N
65	TEST-003	1	\N	pending	3000.00	0.00	0.00	0.00	3000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-08 07:43:38.810389	2025-08-08 07:43:38.810389	mixed	0	0	\N	\N
80	ORD-1754669148661-493VZXMSN	1	\N	pending	1400.00	0.00	0.00	0.00	1400.00	NGN	bank_transfer	pending	TXN-1754669149599-W26O316A4	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	Digital Download	\N	\N	\N	2025-08-08 16:05:48.997695	2025-08-08 16:05:51.704783	mixed	0	0	\N	\N
84	ORD-1754694229964-7F9QWGXYX	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 23:03:50.450074	2025-08-08 23:03:50.450074	mixed	0	0	\N	\N
88	ORD-1754695911438-7G8UQ5C9O	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 23:31:51.827516	2025-08-08 23:31:51.827516	mixed	0	0	\N	\N
2	ORD-2024-001	1	\N	confirmed	19.99	1.60	0.00	0.00	21.59	NGN	credit_card	paid	txn_123456789	{"zip": "10001", "city": "New York", "state": "NY", "street": "123 Main St", "country": "USA"}	{"zip": "10001", "city": "New York", "state": "NY", "street": "123 Main St", "country": "USA"}	digital_delivery	\N	\N	Customer requested immediate delivery	2025-07-31 19:51:48.218201	2025-07-31 19:51:48.218201	digital_only	2	0	2	\N
4	ORD-2024-002	\N	customer2@example.com	processing	31.98	2.56	0.00	5.00	29.54	NGN	paypal	paid	txn_987654321	{"zip": "90210", "city": "Los Angeles", "state": "CA", "street": "456 Oak Ave", "country": "USA"}	{"zip": "90210", "city": "Los Angeles", "state": "CA", "street": "456 Oak Ave", "country": "USA"}	digital_delivery	\N	\N	Applied discount code: WELCOME10	2025-07-31 19:52:18.714299	2025-07-31 19:52:18.714299	digital_only	2	0	2	\N
5	ORD-2024-003	\N	guest@example.com	shipped	14.99	1.20	0.00	0.00	16.19	NGN	credit_card	paid	txn_456789123	{"zip": "60601", "city": "Chicago", "state": "IL", "street": "789 Pine St", "country": "USA"}	{"zip": "60601", "city": "Chicago", "state": "IL", "street": "789 Pine St", "country": "USA"}	digital_delivery	TRK123456789	2024-01-15	Guest checkout	2025-07-31 19:52:19.529026	2025-07-31 19:52:19.529026	digital_only	1	0	2	\N
91	ORD-1754733005761-VS5XRJE9H	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 09:50:06.208949	2025-08-09 09:50:06.208949	mixed	0	0	\N	\N
94	ORD-1754735851574-R1GKSSENG	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 10:37:31.82672	2025-08-09 10:37:31.82672	mixed	0	0	\N	\N
97	ORD-1754738269983-A5ZNZVBOG	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 11:17:50.110331	2025-08-09 11:17:50.110331	mixed	0	0	\N	\N
100	ORD-1754743257170-NQ9LLDUT0	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 12:40:57.664505	2025-08-09 12:40:57.664505	mixed	0	0	\N	\N
104	ORD-1754747598670-KUDZHV9VU	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 13:53:18.932187	2025-08-09 13:53:18.932187	mixed	0	0	\N	\N
108	ORD-1754759617137-5YMIECDF2	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 17:13:37.593273	2025-08-09 17:13:37.593273	mixed	0	0	\N	\N
110	ORD-1754760145294-MN5MD8MN6	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 17:22:25.764744	2025-08-09 17:22:25.764744	mixed	0	0	\N	\N
121	ORD-1754861489274-027h84rw0	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 21:31:46.256358	2025-08-10 21:31:46.256358	mixed	0	0	\N	\N
127	ORD-1754862560210-ulijaq7qh	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 21:49:26.020243	2025-08-10 21:49:26.020243	mixed	0	0	\N	\N
85	ORD-1754695229186-E3GMZE3CE	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 23:20:29.703502	2025-08-08 23:20:29.703502	mixed	0	0	\N	\N
89	ORD-1754697881763-PB8TW1YG0	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 00:04:42.11866	2025-08-09 00:04:42.11866	mixed	0	0	\N	\N
92	ORD-1754733043549-SGYFRFOA8	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 09:50:44.014501	2025-08-09 09:50:44.014501	mixed	0	0	\N	\N
95	ORD-1754735910339-MDWP1KE1L	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 10:38:30.600807	2025-08-09 10:38:30.600807	mixed	0	0	\N	\N
98	ORD-1754742256179-5ILD1H9JJ	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 12:24:16.570064	2025-08-09 12:24:16.570064	mixed	0	0	\N	\N
101	ORD-1754743958705-0NX0SRJ2J	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 12:52:39.268538	2025-08-09 12:52:39.268538	mixed	0	0	\N	\N
105	ORD-1754747599279-4p5h6t4lp	1	\N	pending	12003000.00	0.00	0.00	0.00	12003000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-09 13:53:22.62176	2025-08-09 13:53:22.62176	mixed	0	0	\N	\N
109	ORD-1754759618131-uqw2z6ddo	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-09 17:13:41.66005	2025-08-09 17:13:41.66005	mixed	0	0	\N	\N
111	ORD-1754857698014-TFLAYEJ15	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 20:28:18.052004	2025-08-10 20:28:18.052004	mixed	0	0	\N	\N
112	ORD-1754857721266-KHS1D2UV5	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 20:28:41.305051	2025-08-10 20:28:41.305051	mixed	0	0	\N	\N
123	ORD-1754861591994-qgsu0gkx6	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 21:33:18.262226	2025-08-10 21:33:18.262226	mixed	0	0	\N	\N
31	TEST-1754415747183-975	1	test@example.com	pending	1000.00	75.00	0.00	0.00	1075.00	NGN	flutterwave	pending	\N	{"lastName": "User", "firstName": "Test"}	{"lastName": "User", "firstName": "Test"}	\N	\N	\N	\N	2025-08-05 17:42:27.544888	2025-08-05 17:42:27.544888	digital_only	0	0	\N	\N
41	RW1754425696919267	1	\N	pending	2500.00	187.50	700.00	0.00	3387.50	NGN	flutterwave	pending	\N	{"city": "asdfasdfasdfd", "phone": "07039201122", "state": "dfsdasdf", "country": "Nigeria", "postal_code": "", "address_line1": "asdfasdfasdfasdfa,dfasdfds", "address_line2": "", "recipient_name": "Admin User"}	{"city": "asdfasdfasdfd", "phone": "07039201122", "state": "dfsdasdf", "country": "Nigeria", "postal_code": "", "address_line1": "asdfasdfasdfasdfa,dfasdfds", "address_line2": "", "recipient_name": "Admin User"}	Standard Shipping	\N	\N		2025-08-05 20:28:19.21468	2025-08-05 20:28:19.21468	mixed	0	0	2	\N
45	RW1754427759549884	1	\N	pending	2500.00	187.50	700.00	0.00	3387.50	NGN	bank_transfer	pending	\N	{"city": "fgsg", "phone": "039201122", "state": "sdfgsd", "country": "Nigeria", "postal_code": "", "address_line1": "sagsdt34534sdf", "address_line2": "", "recipient_name": "Admin User"}	{"city": "fgsg", "phone": "039201122", "state": "sdfgsd", "country": "Nigeria", "postal_code": "", "address_line1": "sagsdt34534sdf", "address_line2": "", "recipient_name": "Admin User"}	Standard Shipping	\N	\N		2025-08-05 21:02:41.729478	2025-08-05 21:02:47.016382	mixed	0	0	2	\N
36	RW1754420176331266	4	\N	pending	6500.00	487.50	500.00	0.00	7487.50	NGN	flutterwave	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-05 18:56:16.643046	2025-08-05 18:56:16.643046	mixed	0	0	\N	\N
37	RW1754420928056337	4	\N	pending	13000.00	975.00	500.00	0.00	14475.00	NGN	flutterwave	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-05 19:08:48.37392	2025-08-05 19:08:48.37392	mixed	0	0	\N	\N
38	RW1754421098123772	4	\N	pending	19500.00	1462.50	500.00	0.00	21462.50	NGN	flutterwave	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-05 19:11:38.464039	2025-08-05 19:11:38.464039	mixed	0	0	\N	\N
47	TEST-1754483230968	1	\N	confirmed	9.99	0.00	0.00	0.00	9.99	NGN	\N	paid	\N	\N	\N	\N	\N	\N	\N	2025-08-06 12:27:11.254406	2025-08-06 12:27:12.441498	mixed	0	0	\N	\N
70	CONSTRAINT-BATCH-TEST	1	\N	pending	1000.00	0.00	0.00	0.00	1000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-08 07:46:12.55829	2025-08-08 07:46:12.55829	mixed	0	0	\N	\N
78	ORD-1754667929879-MPVIHPU63	1	\N	pending	37.98	0.00	0.00	0.00	37.98	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	Digital Download	\N	\N	\N	2025-08-08 15:45:30.249386	2025-08-08 15:45:30.249386	mixed	0	0	\N	\N
86	ORD-1754695574625-T6F9WFNFA	1	\N	pending	2400.00	0.00	3000.00	0.00	24003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 23:26:15.026799	2025-08-08 23:26:15.026799	mixed	0	0	\N	\N
90	ORD-1754697885514-XYD3U3LIB	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 00:04:45.849543	2025-08-09 00:04:45.849543	mixed	0	0	\N	\N
93	ORD-1754733179559-BAFATMLHD	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 09:53:00.012851	2025-08-09 09:53:00.012851	mixed	0	0	\N	\N
96	ORD-1754736719689-I9K6VY3AJ	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 10:51:59.888827	2025-08-09 10:51:59.888827	mixed	0	0	\N	\N
99	ORD-1754742762842-G4NM9E1ET	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 12:32:43.246522	2025-08-09 12:32:43.246522	mixed	0	0	\N	\N
102	ORD-1754744765412-CDVQF9IY7	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 13:06:05.868044	2025-08-09 13:06:05.868044	mixed	0	0	\N	\N
106	ORD-1754749576589-PLXDHZ1GO	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-09 14:26:16.923575	2025-08-09 14:26:16.923575	mixed	0	0	\N	\N
117	ORD-1754859515609-sj13bpfnh	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 20:58:43.121856	2025-08-10 20:58:43.121856	mixed	0	0	\N	\N
125	ORD-1754862163042-efmg4ao9g	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 21:42:45.977807	2025-08-10 21:42:45.977807	mixed	0	0	\N	\N
134	ORD-1754989601212-pwu0gzd4e	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-12 09:06:44.096739	2025-08-12 09:06:44.096739	mixed	0	0	\N	\N
42	RW1754426435800363	1	\N	pending	2500.00	187.50	700.00	0.00	3387.50	NGN	flutterwave	pending	RW1754426441247924	{"city": "dfasdfads", "phone": "07039201122", "state": "dsfsd", "country": "Nigeria", "postal_code": "", "address_line1": "sedrfasdfasdfasd", "address_line2": "", "recipient_name": "Admin User"}	{"city": "dfasdfads", "phone": "07039201122", "state": "dsfsd", "country": "Nigeria", "postal_code": "", "address_line1": "sedrfasdfasdfasd", "address_line2": "", "recipient_name": "Admin User"}	Standard Shipping	\N	\N		2025-08-05 20:40:38.075424	2025-08-05 20:40:45.817958	mixed	0	0	2	\N
43	RW1754426524896469	1	\N	pending	1500.00	112.50	0.00	0.00	1612.50	NGN	flutterwave	pending	RW1754426532705965	null	{"city": "", "phone": "", "state": "", "country": "Nigeria", "postal_code": "", "address_line1": "", "address_line2": "", "recipient_name": "Admin User"}		\N	\N		2025-08-05 20:42:07.169375	2025-08-05 20:42:15.740567	mixed	0	0	2	\N
44	RW1754427388593716	1	\N	pending	2500.00	187.50	700.00	0.00	3387.50	NGN	bank_transfer	pending	\N	{"city": "dfdf", "phone": "07039201122", "state": "wrgdfb", "country": "Nigeria", "postal_code": "", "address_line1": "1234213erfxcbzcxbzx", "address_line2": "", "recipient_name": "Admin User"}	{"city": "dfdf", "phone": "07039201122", "state": "wrgdfb", "country": "Nigeria", "postal_code": "", "address_line1": "1234213erfxcbzcxbzx", "address_line2": "", "recipient_name": "Admin User"}	Standard Shipping	\N	\N		2025-08-05 20:56:30.794467	2025-08-05 20:56:30.794467	mixed	0	0	2	\N
46	RW1754468525149276	1	\N	processing	2500.00	187.50	700.00	0.00	3387.50	NGN	flutterwave	paid	RW1754468531018981	{"city": "esh", "phone": "07039201122", "state": "geswher", "country": "Nigeria", "postal_code": "", "address_line1": "jghjhgvkj", "address_line2": "", "recipient_name": "Admin User"}	{"city": "esh", "phone": "07039201122", "state": "geswher", "country": "Nigeria", "postal_code": "", "address_line1": "jghjhgvkj", "address_line2": "", "recipient_name": "Admin User"}	Standard Shipping	2	\N		2025-08-06 08:22:05.162135	2025-08-06 11:38:09.011206	mixed	0	0	2	\N
10	TEST-API-1754342288059	\N	\N	pending	9.99	0.75	1500.00	0.00	1510.74	NGN	flutterwave	pending	\N	{"lga": "Ikeja", "city": "Test City", "email": "peter@scaleitpro.com", "phone": "1234567890", "state": "Lagos", "address": "123 Test St", "country": "NG", "lastName": "User", "firstName": "Test"}	{"city": "Test City", "state": "Lagos", "address": "123 Test St", "country": "NG", "lastName": "User", "firstName": "Test"}	standard	\N	\N	\N	2025-08-04 21:18:07.875701	2025-08-04 21:18:07.875701	mixed	0	0	2	\N
6	ORD-2024-004	1	\N	delivered	25.97	2.08	0.00	0.00	28.05	NGN	credit_card	paid	txn_789123456	{"zip": "77001", "city": "Houston", "state": "TX", "street": "321 Elm St", "country": "USA"}	{"zip": "77001", "city": "Houston", "state": "TX", "street": "321 Elm St", "country": "USA"}	digital_delivery	\N	\N	Customer satisfied with purchase	2025-07-31 19:52:19.932026	2025-07-31 19:52:19.932026	digital_only	1	0	2	\N
7	ORD-2024-005	\N	customer3@example.com	cancelled	18.99	1.52	0.00	0.00	20.51	NGN	credit_card	refunded	txn_321654987	{"zip": "10001", "city": "New York", "state": "NY", "street": "123 Main St", "country": "USA"}	{"zip": "10001", "city": "New York", "state": "NY", "street": "123 Main St", "country": "USA"}	digital_delivery	\N	\N	Customer requested cancellation	2025-07-31 19:52:20.361117	2025-07-31 19:52:20.361117	mixed	0	0	2	\N
48	TEST-1754483243108	1	\N	confirmed	9.99	0.00	0.00	0.00	9.99	NGN	\N	paid	\N	\N	\N	\N	\N	\N	\N	2025-08-06 12:27:23.411939	2025-08-06 12:27:24.53147	mixed	0	0	\N	\N
14	ORD-BANK-1754398013055	\N	\N	pending	1000.00	75.00	0.00	0.00	1075.00	NGN	bank_transfer	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-05 12:46:53.31376	2025-08-05 12:46:53.31376	mixed	0	0	\N	\N
53	ORD-1754563762956-P45XHJ1J9	1	\N	pending	2800.00	0.00	0.00	0.00	2800.00	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 10:49:23.522717	2025-08-07 10:49:23.522717	mixed	0	0	\N	\N
55	ORD-1754564104355-MGN5JY0ME	1	\N	pending	2800.00	0.00	0.00	0.00	2800.00	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 10:55:04.914882	2025-08-07 10:55:04.914882	mixed	0	0	\N	\N
56	ORD-1754564489586-0U6IYEBO9	1	\N	pending	2800.00	0.00	0.00	0.00	2800.00	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 11:01:30.144731	2025-08-07 11:01:30.144731	mixed	0	0	\N	\N
57	ORD-1754564640246-XZX8JN3D4	1	\N	refunded	2800.00	0.00	0.00	0.00	2800.00	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 11:04:00.803697	2025-08-07 12:10:21.5338	mixed	0	0	\N	\N
58	ORD-1754568861561-OWCS441WH	1	\N	pending	1400.00	0.00	0.00	0.00	1400.00	NGN	\N	pending	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 12:14:22.026691	2025-08-07 12:14:22.026691	mixed	0	0	\N	\N
54	ORD-1754563927994-HPHQY4C7P	1	\N	pending	2800.00	0.00	0.00	0.00	2800.00	NGN	\N	failed	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 10:52:08.558084	2025-08-07 12:18:40.858611	mixed	0	0	\N	\N
59	ORD-1754571577623-Z990QDLBC	1	\N	confirmed	1400.00	0.00	0.00	0.00	1400.00	NGN	\N	paid	\N	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 12:59:38.081655	2025-08-07 13:04:26.730378	mixed	0	0	\N	\N
60	TEST-1754596091159	\N	\N	pending	1000.00	0.00	0.00	0.00	1000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-07 19:48:11.56426	2025-08-07 19:48:11.56426	mixed	0	0	\N	\N
16	ORD-BANK-1754398041929	\N	\N	pending	1000.00	75.00	0.00	0.00	1075.00	NGN	bank_transfer	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-05 12:47:22.180891	2025-08-05 12:47:22.180891	mixed	0	0	\N	\N
62	ORD-1754603685146-32UPAJHIA	1	\N	pending	1400.00	0.00	0.00	0.00	1400.00	NGN	bank_transfer	pending	TXN-1754603685527-F38Q0EOFD	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	\N	\N	\N	\N	2025-08-07 21:54:45.606976	2025-08-07 21:54:46.216991	mixed	0	0	\N	\N
79	ORD-1754668700636-KL3I4WHLX	1	\N	pending	37.98	0.00	0.00	0.00	37.98	NGN	bank_transfer	pending	TXN-1754668701595-ON4WNL9YY	{"city": "Digital", "email": "admin@readnwin.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "User", "first_name": "Admin", "sameAsShipping": true}	Digital Download	\N	\N	\N	2025-08-08 15:58:21.013561	2025-08-08 15:58:23.690857	mixed	0	0	\N	\N
83	ORD-1754693129792-UYU9CCVM6	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 22:45:30.299137	2025-08-08 22:45:30.299137	mixed	0	0	\N	\N
87	ORD-1754695907599-B38TBYNQF	1	\N	pending	1200.00	0.00	3000.00	0.00	12003000.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-08 23:31:47.970675	2025-08-08 23:31:47.970675	mixed	0	0	\N	\N
103	ORD-1754744766116-jbywi9jb2	1	\N	pending	12003000.00	0.00	0.00	0.00	12003000.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-09 13:06:09.490877	2025-08-09 13:06:09.490877	mixed	0	0	\N	\N
107	ORD-1754749578217-byfw2nrfd	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-09 14:26:21.561781	2025-08-09 14:26:21.561781	mixed	0	0	\N	\N
119	ORD-1754859774592-tdhnziw0g	1	\N	pending	4200.00	0.00	0.00	0.00	4200.00	NGN	\N	pending	\N	\N	\N	\N	\N	\N	\N	2025-08-10 21:03:07.790308	2025-08-10 21:03:07.790308	mixed	0	0	\N	\N
113	ORD-1754858093235-ZOKDVRN34	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 20:34:53.274381	2025-08-10 20:34:53.274381	mixed	0	0	\N	\N
114	ORD-1754858116314-VK8P2W105	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 20:35:16.351368	2025-08-10 20:35:16.351368	mixed	0	0	\N	\N
115	ORD-1754858116817-R8JA4CS6I	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 20:35:16.855061	2025-08-10 20:35:16.855061	mixed	0	0	\N	\N
116	ORD-1754859514636-84AAZRRMX	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 20:58:35.576664	2025-08-10 20:58:35.576664	mixed	0	0	\N	\N
118	ORD-1754859772483-9QEH0NX2F	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 21:02:53.416446	2025-08-10 21:02:53.416446	mixed	0	0	\N	\N
120	ORD-1754861488363-Q7QW40XZ1	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 21:31:29.040333	2025-08-10 21:31:29.040333	mixed	0	0	\N	\N
122	ORD-1754861590832-ZIQWHBDP7	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 21:33:11.506385	2025-08-10 21:33:11.506385	mixed	0	0	\N	\N
124	ORD-1754862162186-R6N1B7EU1	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 21:42:42.816765	2025-08-10 21:42:42.816765	mixed	0	0	\N	\N
126	ORD-1754862558967-2D463DY6I	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-10 21:49:19.577178	2025-08-10 21:49:19.577178	mixed	0	0	\N	\N
128	ORD-1754868472510-BL1EJ1F0F	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 23:27:52.547888	2025-08-10 23:27:52.547888	mixed	0	0	\N	\N
129	ORD-1754868481143-THIH39RRC	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 23:28:01.181252	2025-08-10 23:28:01.181252	mixed	0	0	\N	\N
130	ORD-1754868559307-VW7O3G4AD	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	{"lga": "Demsa", "city": "dsfa", "email": "peter@scaleitpro.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "again", "firstName": "Admin"}	Not specified	\N	\N	\N	2025-08-10 23:29:19.344408	2025-08-10 23:29:19.344408	mixed	0	0	\N	\N
131	ORD-1754910124125-DNJSMKN5P	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Fufure", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "Mowe Ogun state", "country": "Nigeria", "lastName": "John", "firstName": "Peter"}	{"lga": "Fufure", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "Mowe Ogun state", "country": "Nigeria", "lastName": "John", "firstName": "Peter"}	Not specified	\N	\N	\N	2025-08-11 11:02:04.162673	2025-08-11 11:02:04.162673	mixed	0	0	\N	\N
132	ORD-1754910186939-XFACT12GE	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Fufure", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "Mowe Ogun state", "country": "Nigeria", "lastName": "John", "firstName": "Peter"}	{"lga": "Fufure", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "Mowe Ogun state", "country": "Nigeria", "lastName": "John", "firstName": "Peter"}	Not specified	\N	\N	\N	2025-08-11 11:03:06.979724	2025-08-11 11:03:06.979724	mixed	0	0	\N	\N
133	ORD-1754989600553-DUBLW0KCA	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-12 09:06:41.081491	2025-08-12 09:06:41.081491	mixed	0	0	\N	\N
135	ORD-1754996518136-QCB1DQ3VE	1	\N	confirmed	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	paid	\N	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	{"lga": "Aba North", "city": "jigawa", "email": "admin@readnwin.com", "phone": "07052565452", "state": "Abia", "address": "123, abc street", "country": "Nigeria", "lastName": "Hopkins", "firstName": "John"}	Not specified	\N	\N	\N	2025-08-12 11:01:58.337055	2025-08-12 11:04:15.859462	mixed	0	0	\N	\N
77	ORD-1754658110594-9ZTR28FA8	\N	\N	pending	1400.00	0.00	0.00	0.00	1400.00	NGN	bank_transfer	pending	TXN-1754658111025-2DGCDI521	{"city": "Digital", "email": "peter@scaleitpro.com", "phone": "+2340000000000", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "Adelodun", "first_name": "Peter"}	{"city": "Digital", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "Adelodun", "first_name": "Peter", "sameAsShipping": true}	Digital Download	\N	\N	\N	2025-08-08 13:01:50.830072	2025-08-08 13:01:51.486045	mixed	0	0	\N	\N
136	ORD-1755010539680-TAYL394W1	30	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	Not specified	\N	\N	\N	2025-08-12 14:55:39.717582	2025-08-12 14:55:39.717582	mixed	0	0	\N	\N
137	ORD-1755010572349-D03WNIBGV	30	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	Not specified	\N	\N	\N	2025-08-12 14:56:12.386801	2025-08-12 14:56:12.386801	mixed	0	0	\N	\N
138	ORD-1755010822139-NHQVVQI8E	30	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	Not specified	\N	\N	\N	2025-08-12 15:00:22.178519	2025-08-12 15:00:22.178519	mixed	0	0	\N	\N
139	ORD-1755012647276-8MCA8U1AK	30	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	{"lga": "Demsa", "city": "Lagos", "email": "adelodunpeter24@gmail.com", "phone": "0703901122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "john", "firstName": "david"}	Not specified	\N	\N	\N	2025-08-12 15:30:47.316245	2025-08-12 15:30:47.316245	mixed	0	0	\N	\N
140	ORD-1755014568921-RFYCHLQ4S	1	\N	pending	1200.00	0.00	3000.00	0.00	4200.00	NGN	\N	pending	\N	{"lga": "Demsa", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "admin", "firstName": "admin"}	{"lga": "Demsa", "city": "Mowe", "email": "admin@readnwin.com", "phone": "07039201122", "state": "Adamawa", "address": "123 main street", "country": "Nigeria", "lastName": "admin", "firstName": "admin"}	Not specified	\N	\N	\N	2025-08-12 16:02:48.961262	2025-08-12 16:02:48.961262	mixed	0	0	\N	\N
141	ORD-1755016656283-L04A2WO8X	32	\N	pending	9.99	0.00	0.00	0.00	9.99	NGN	\N	pending	\N	{"city": "Digital", "email": "mosesakinpelu40@gmail.com", "phone": "", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "Customer", "first_name": "Digital"}	{"lga": "", "city": "", "email": "mosesakinpelu40@gmail.com", "phone": "09113757271", "state": "", "address": "", "country": "Nigeria", "lastName": "Praise", "firstName": "Moses"}	Digital Download	\N	\N	\N	2025-08-12 16:37:36.32297	2025-08-12 16:37:36.32297	mixed	0	0	\N	\N
142	ORD-1755033250174-XM2H8DDMB	32	\N	pending	9.99	0.00	0.00	0.00	9.99	NGN	\N	pending	\N	{"city": "Digital", "email": "mosesakinpelu40@gmail.com", "phone": "", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "Customer", "first_name": "Digital"}	{"lga": "", "city": "", "email": "mosesakinpelu40@gmail.com", "phone": "09113757271", "state": "", "address": "", "country": "Nigeria", "lastName": "Praise", "firstName": "Moses"}	Digital Download	\N	\N	\N	2025-08-12 21:14:10.212513	2025-08-12 21:14:10.212513	mixed	0	0	\N	\N
143	ORD-1755033251973-YG62FY7B4	32	\N	pending	9.99	0.00	0.00	0.00	9.99	NGN	\N	pending	\N	{"city": "Digital", "email": "mosesakinpelu40@gmail.com", "phone": "", "state": "Digital", "address": "Digital Delivery", "country": "NG", "zip_code": "00000", "last_name": "Customer", "first_name": "Digital"}	{"lga": "", "city": "", "email": "mosesakinpelu40@gmail.com", "phone": "09113757271", "state": "", "address": "", "country": "Nigeria", "lastName": "Praise", "firstName": "Moses"}	Digital Download	\N	\N	\N	2025-08-12 21:14:12.011674	2025-08-12 21:14:12.011674	mixed	0	0	\N	\N
\.


--
-- TOC entry 6157 (class 0 OID 19055)
-- Dependencies: 339
-- Data for Name: page_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.page_content (id, page_type, hero_title, hero_subtitle, hero_background_image_url, created_at, updated_at) FROM stdin;
1	about_us	About ReadnWin	Revolutionizing the way people read, learn, and grow through technology	\N	2025-08-05 21:38:01.401297+00	2025-08-05 21:38:01.401297+00
2	contact_us	Contact Us	We'd love to hear from you. Get in touch with our team for any questions or support.	\N	2025-08-05 21:38:01.401297+00	2025-08-05 21:38:01.401297+00
\.


--
-- TOC entry 6145 (class 0 OID 18860)
-- Dependencies: 327
-- Data for Name: payment_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_analytics (id, gateway_type, date, total_transactions, successful_transactions, failed_transactions, total_amount, successful_amount, failed_amount, average_transaction_time, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6149 (class 0 OID 18906)
-- Dependencies: 331
-- Data for Name: payment_gateway_tests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_gateway_tests (id, gateway_type, test_type, test_amount, test_currency, status, result, error_message, response_time, created_at, completed_at) FROM stdin;
\.


--
-- TOC entry 6117 (class 0 OID 18365)
-- Dependencies: 299
-- Data for Name: payment_gateways; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_gateways (id, gateway_id, name, description, enabled, test_mode, public_key, secret_key, webhook_secret, hash, status, supported_currencies, supported_payment_methods, created_at, updated_at, icon, features, config, type, sort_order, is_manual_gateway, webhook_url, test_webhook_url, last_webhook_test, webhook_test_status, transaction_count, success_rate, average_response_time) FROM stdin;
5	bank_transfer	Bank Transfer	Direct bank transfer with proof of payment upload	t	f			\N	\N	active	{USD,EUR,GBP,NGN,KES,GHS,ZAR}	{bank_transfer}	2025-08-02 10:14:01.79736	2025-08-04 22:31:50.502694	ri-bank-line	{"Bank Transfers","Proof of Payment","Manual Verification","No Transaction Fees"}	{"features": ["Bank Transfers", "Proof of Payment", "Manual Verification", "No Transaction Fees"], "bankDetails": {"bankName": "ReadnWin Bank", "features": "Customers upload proof of payment after transfer\\nManual verification by admin required\\nNo transaction fees for customers\\nSupports multiple currencies\\nPayment verification takes 1-2 business days\\nFile upload support: JPG, PNG, PDF (max 5MB)\\nAutomatic expiration after 7 days", "swiftCode": "RWNBXXX", "accountName": "ReadnWin Digital Store", "instructions": "Please include your order number as payment reference when making the transfer. Payment verification may take 1-2 business days.", "accountNumber": "1234567890"}, "uploadSettings": {"maxFileSize": 5242880, "allowedFormats": ["jpg", "jpeg", "png", "pdf"], "requiredFields": ["orderNumber", "amount", "date"]}, "supportedCurrencies": ["USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR"]}	online	2	t	\N	\N	\N	\N	0	0.00	0
4	paystack	PayStack	Modern payments and financial technology in Africa	f	t			\N	\N	inactive	{NGN,USD,EUR,GBP,GHS,ZAR,KES,XOF,XAF}	{card_payment,bank_transfer,ussd,mobile_money,qr_code}	2025-08-02 10:14:01.79736	2025-08-04 22:31:50.645706	ri-bank-card-2-line	{"Card Payments","Bank Transfers",USSD,"Mobile Money","QR Codes"}	{"features": ["Card Payments", "Bank Transfers", "USSD", "Mobile Money", "QR Codes"], "webhookUrl": "http://localhost:3000/api/payment/webhook", "testWebhookUrl": "http://localhost:3000/api/payment/webhook", "supportedCurrencies": ["NGN", "USD", "EUR", "GBP", "GHS", "ZAR", "KES", "XOF", "XAF"]}	online	3	f	\N	\N	\N	\N	0	0.00	0
1	stripe	Stripe	Modern payment processing for internet businesses	f	t			\N	\N	inactive	{USD,EUR,GBP,CAD,AUD,JPY}	{credit_card,debit_card,digital_wallet,bank_transfer}	2025-08-02 10:14:01.79736	2025-08-02 21:27:52.960045	ri-bank-card-line	{"Credit Cards","Digital Wallets","Bank Transfers",Subscriptions}	{"bankDetails": null, "uploadSettings": null}	online	0	f	\N	\N	\N	\N	0	0.00	0
2	paypal	PayPal	Global payment solution trusted by millions	f	t			\N	\N	inactive	{USD,EUR,GBP,CAD,AUD,JPY}	{paypal_balance,credit_card,bank_transfer,buy_now_pay_later}	2025-08-02 10:14:01.79736	2025-08-02 21:27:53.249924	ri-paypal-line	{"PayPal Balance","Credit Cards","Bank Transfers","Buy Now Pay Later"}	{"bankDetails": null, "uploadSettings": null}	online	0	f	\N	\N	\N	\N	0	0.00	0
3	flutterwave	Flutterwave	Leading payment technology company in Africa	t	f	FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X	FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X	\N	19415f8daa7ad132cd7680f7	active	{NGN,USD,EUR,GBP,KES,GHS,ZAR,UGX,TZS,XOF,XAF}	{mobile_money,bank_transfer,credit_card,ussd,qr_payment}	2025-08-02 10:14:01.79736	2025-08-04 22:31:50.293688	ri-global-line	{"Mobile Money","Bank Transfers","Credit Cards",USSD,"QR Payments"}	{"features": ["Mobile Money", "Bank Transfers", "Credit Cards", "USSD", "QR Payments"], "webhookUrl": "http://localhost:3000/api/payment/webhook", "testWebhookUrl": "http://localhost:3000/api/payment/webhook", "supportedCurrencies": ["NGN", "USD", "EUR", "GBP", "KES", "GHS", "ZAR", "UGX", "TZS", "XOF", "XAF"]}	online	1	f	\N	\N	\N	\N	0	0.00	0
8	square	Square	Simple, powerful payment processing	f	t			\N	\N	inactive	{USD,CAD,GBP,AUD}	{credit_card,digital_wallet,in_person_payment}	2025-08-02 10:31:27.457547	2025-08-02 21:27:53.703747	ri-square-line	{"Credit Cards","Digital Wallets","In-Person Payments","Inventory Management"}	{"bankDetails": null, "uploadSettings": null}	online	0	f	\N	\N	\N	\N	0	0.00	0
\.


--
-- TOC entry 6151 (class 0 OID 18917)
-- Dependencies: 333
-- Data for Name: payment_method_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_method_preferences (id, user_id, gateway_type, is_preferred, last_used, success_count, failure_count, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6205 (class 0 OID 19514)
-- Dependencies: 387
-- Data for Name: payment_proofs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_proofs (id, bank_transfer_id, file_name, file_path, file_size, file_type, upload_date, is_verified, verified_by, verified_at, admin_notes, status, updated_at) FROM stdin;
1	3	the-art-of-mindful-reading.jpg	/uploads/payment-proofs/proof_3_1754564767342_4df3on.jpg	45440	image/jpeg	2025-08-07 11:06:07.951813	f	\N	\N	\N	pending	2025-08-09 13:13:03.36756
2	4	the-art-of-mindful-reading.jpg	/uploads/payment-proofs/proof_4_1754568882056_8uwzjt.jpg	45440	image/jpeg	2025-08-07 12:14:42.514991	f	\N	\N	\N	pending	2025-08-09 13:13:03.36756
3	5	the-art-of-mindful-reading.jpg	/uploads/payment-proofs/proof_5_1754573704045_k3zprw.jpg	45440	image/jpeg	2025-08-07 13:35:04.495682	f	\N	\N	\N	pending	2025-08-09 13:13:03.36756
4	6	Screenshot 2025-07-10 at 11.45.32 AM.png	/uploads/payment-proofs/proof_6_1754603725496_i05zfc.png	435891	image/png	2025-08-07 21:55:26.000691	f	\N	\N	\N	pending	2025-08-09 13:13:03.36756
6	11	00            *.png	/uploads/payment-proofs/proof_11_1754743266650_067qix.png	203399	image/png	2025-08-09 12:41:07.144352	f	\N	\N	\N	pending	2025-08-09 13:13:03.36756
7	12	00            *.png	/uploads/payment-proofs/proof_12_1754760152547_v2obw1.png	203399	image/png	2025-08-09 17:22:33.028836	f	\N	\N	\N	pending	2025-08-09 17:22:33.028836
8	13	Invoice-300007.pdf	/uploads/payment-proofs/proof_13_1754996524817_q5jney.pdf	29215	application/pdf	2025-08-12 11:02:05.023263	t	\N	\N	\N	verified	2025-08-12 11:04:12.516469
\.


--
-- TOC entry 6147 (class 0 OID 18885)
-- Dependencies: 329
-- Data for Name: payment_refunds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_refunds (id, refund_id, transaction_id, order_id, amount, currency, reason, status, gateway_response, processed_by, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6121 (class 0 OID 18439)
-- Dependencies: 303
-- Data for Name: payment_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_settings (id, setting_key, setting_value, description, created_at, updated_at) FROM stdin;
2	bank_transfer_expiry_hours	24	Hours before bank transfer payment expires	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
3	auto_verify_bank_transfers	false	Automatically verify bank transfers	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
4	require_proof_of_payment	true	Require proof of payment for bank transfers	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
5	max_proof_file_size_mb	5	Maximum file size for proof of payment in MB	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
6	allowed_proof_file_types	jpg,jpeg,png,pdf	Allowed file types for proof of payment	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
7	bank_transfer_instructions	Please transfer the exact amount to the provided account details and upload proof of payment.	Instructions shown to users for bank transfer	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
8	admin_notification_email	admin@readnwin.com	Email for payment notifications	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
1	default_currency	NGN	Default currency for payments	2025-08-02 10:14:01.79736	2025-08-02 10:14:01.79736
9	defaultGateway	bank_transfer	Default payment gateway for new orders	2025-08-02 10:31:25.776518	2025-08-04 22:28:35.855442
10	supportedGateways	["bank_transfer", "flutterwave"]	List of supported payment gateways	2025-08-02 10:31:25.904455	2025-08-04 22:28:35.855442
11	currency	NGN	Default currency for payments	2025-08-02 10:31:26.051102	2025-08-04 22:28:35.855442
12	taxRate	7.5	Default tax rate percentage	2025-08-02 10:31:26.25803	2025-08-04 22:28:35.855442
13	shippingCost	500	Default shipping cost in NGN	2025-08-02 10:31:26.432601	2025-08-04 22:28:35.855442
14	freeShippingThreshold	5000	Free shipping threshold in NGN	2025-08-02 10:31:26.608598	2025-08-04 22:28:35.855442
15	webhookUrl		Default webhook URL for payment notifications	2025-08-02 10:31:26.808655	2025-08-04 22:28:35.855442
16	testMode	true	Test mode enabled by default	2025-08-02 10:31:26.960486	2025-08-04 22:28:35.855442
49	paymentTimeout	3600	Payment timeout in seconds (1 hour)	2025-08-04 22:28:35.855442	2025-08-04 22:28:35.855442
50	autoExpireBankTransfers	604800	Auto-expire bank transfers after 7 days	2025-08-04 22:28:35.855442	2025-08-04 22:28:35.855442
51	maxRetryAttempts	3	Maximum retry attempts for failed payments	2025-08-04 22:28:35.855442	2025-08-04 22:28:35.855442
52	notificationEmail		Email for payment notifications	2025-08-04 22:28:35.855442	2025-08-04 22:28:35.855442
53	defaultPostalCode	100001	\N	2025-08-04 23:12:24.439465	2025-08-04 23:12:24.439465
54	defaultCountry	NG	\N	2025-08-04 23:12:24.76633	2025-08-04 23:12:24.76633
\.


--
-- TOC entry 6153 (class 0 OID 18952)
-- Dependencies: 335
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_transactions (id, transaction_id, order_id, user_id, gateway_type, amount, currency, status, gateway_response, metadata, created_at, updated_at, gateway_id) FROM stdin;
1	tx_sample_1	1	\N	bank_transfer	5000.00	NGN	completed	\N	{"test": true, "sample": true}	2025-08-04 22:31:51.126339	2025-08-04 22:31:51.126339	\N
2	tx_sample_2	2	\N	flutterwave	2500.00	NGN	pending	\N	{"test": true, "sample": true}	2025-08-04 22:31:51.317606	2025-08-04 22:31:51.317606	\N
7	TXN-1754563763361-A7V1T3PKW	ORD-1754563762956-P45XHJ1J9	1	flutterwave	2800.00	NGN	pending	\N	{}	2025-08-07 10:49:23.921648	2025-08-07 10:49:23.921648	\N
8	TXN-1754563928323-AWXE8XBRU	ORD-1754563927994-HPHQY4C7P	1	bank_transfer	2800.00	NGN	pending	\N	{}	2025-08-07 10:52:08.891938	2025-08-07 10:52:08.891938	\N
9	TXN-1754564104765-EP7UBGW6B	ORD-1754564104355-MGN5JY0ME	1	bank_transfer	2800.00	NGN	pending	\N	{}	2025-08-07 10:55:05.332047	2025-08-07 10:55:05.332047	\N
10	TXN-1754564489996-U98AVCOUW	ORD-1754564489586-0U6IYEBO9	1	bank_transfer	2800.00	NGN	pending	\N	{}	2025-08-07 11:01:30.553695	2025-08-07 11:01:30.553695	\N
11	TXN-1754564640551-WUBOS93D7	ORD-1754564640246-XZX8JN3D4	1	bank_transfer	2800.00	NGN	pending	\N	{}	2025-08-07 11:04:01.117609	2025-08-07 11:04:01.117609	\N
12	TXN-1754568861832-IHKO12TDM	ORD-1754568861561-OWCS441WH	1	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-07 12:14:22.28873	2025-08-07 12:14:22.28873	\N
13	TXN-1754571578212-D38FRN82I	ORD-1754571577623-Z990QDLBC	1	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-07 12:59:38.6659	2025-08-07 12:59:38.6659	\N
14	TXN-1754603628835-T8BE1PPLL	ORD-1754603628486-M7QBMLZKK	1	flutterwave	1400.00	NGN	pending	\N	{}	2025-08-07 21:53:49.296025	2025-08-07 21:53:49.296025	\N
15	TXN-1754603685527-F38Q0EOFD	ORD-1754603685146-32UPAJHIA	1	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-07 21:54:45.978419	2025-08-07 21:54:45.978419	\N
18	TXN-1754668701595-ON4WNL9YY	ORD-1754668700636-KL3I4WHLX	1	bank_transfer	37.98	NGN	pending	\N	{}	2025-08-08 15:58:23.457674	2025-08-08 15:58:23.457674	\N
19	TXN-1754669149599-W26O316A4	ORD-1754669148661-493VZXMSN	1	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-08 16:05:51.470806	2025-08-08 16:05:51.470806	\N
20	TXN-1754669665025-88RUMBS8S	ORD-1754669664088-D69TMC5VU	1	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-08 16:14:26.962785	2025-08-08 16:14:26.962785	\N
23	ORD-1754695086801-3rgbl35r3	123	1	flutterwave	1000.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k25zmdtbfk0nmkw5w3khpsvz"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-08 23:18:08.272706	2025-08-08 23:18:08.272706	flutterwave
24	ORD-1754695433889-vzseexrdv	123	1	flutterwave	1000.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k25zz0jwnjwdavffsvmcp5kj"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-08 23:23:55.25159	2025-08-08 23:23:55.25159	flutterwave
25	ORD-1754695719218-aihibutst	123	1	flutterwave	1000.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2607q59r3yc2d4x4qjtyyty"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-08 23:28:40.313402	2025-08-08 23:28:40.313402	flutterwave
26	ORD-1754697884496-qhyyp8yh1	89	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2629spcptkhvmey23g2c8p6"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 00:04:45.64987	2025-08-09 00:04:45.64987	flutterwave
27	ORD-1754697890608-0g2cy03mk	90	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2629zfns25thshtqfy5q919"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 00:04:51.514639	2025-08-09 00:04:51.514639	flutterwave
28	ORD-1754733008740-8hn6yqski	91	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k273spx6t6qqh303vc8rvdef"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 09:50:10.155687	2025-08-09 09:50:10.155687	flutterwave
29	ORD-1754733045948-wg0l4vo95	92	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k273tvrb5n1ny0et6p2n64s1"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 09:50:47.890207	2025-08-09 09:50:47.890207	flutterwave
30	ORD-1754735854337-pn8dgs487	94	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k276ghqtavbrqzk52hr7e80m"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 10:37:35.574283	2025-08-09 10:37:35.574283	flutterwave
31	ORD-1754735912854-85jdupdvh	95	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k276jaga72xt93ykn9qx70qm"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 10:38:33.703454	2025-08-09 10:38:33.703454	flutterwave
32	ORD-1754736721940-72lbh8a92	96	1	flutterwave	4200.00	ngn	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k277b0nq43nsv9p4swat45dy"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 10:52:02.994582	2025-08-09 10:52:02.994582	flutterwave
34	ORD-1754744766116-jbywi9jb2	ORD-1754744766116-jbywi9jb2	1	flutterwave	12003000.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k27f0jqybyy528qh73a6rw7k"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 13:06:09.706477	2025-08-09 13:06:09.706477	\N
35	ORD-1754747599279-4p5h6t4lp	ORD-1754747599279-4p5h6t4lp	1	flutterwave	12003000.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k27hq1epsm9b20n66emp4ckt"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 13:53:22.826508	2025-08-09 13:53:22.826508	\N
36	ORD-1754749578217-byfw2nrfd	ORD-1754749578217-byfw2nrfd	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k27kkdvaz78k6mrdhcm0awpk"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 14:26:21.791037	2025-08-09 14:26:21.791037	\N
37	ORD-1754759618131-uqw2z6ddo	ORD-1754759618131-uqw2z6ddo	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k27x5tngdhmwcn3mqh2ty19x"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-09 17:13:41.879498	2025-08-09 17:13:41.879498	\N
38	ORD-1754859515609-sj13bpfnh	ORD-1754859515609-sj13bpfnh	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2awejn8fwbg15xwv0tq2rjd"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 20:58:43.537111	2025-08-10 20:58:43.537111	\N
16	TXN-1754658111025-2DGCDI521	ORD-1754658110594-9ZTR28FA8	\N	bank_transfer	1400.00	NGN	pending	\N	{}	2025-08-08 13:01:51.274465	2025-08-08 13:01:51.274465	\N
39	ORD-1754859774592-tdhnziw0g	ORD-1754859774592-tdhnziw0g	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2awpmhxkm929ys0sf715d8m"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 21:03:08.140436	2025-08-10 21:03:08.140436	\N
40	ORD-1754861489274-027h84rw0	ORD-1754861489274-027h84rw0	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2ayb36cwegf5dbgfvpbcryg"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 21:31:46.757696	2025-08-10 21:31:46.757696	\N
41	ORD-1754861591994-qgsu0gkx6	ORD-1754861591994-qgsu0gkx6	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2aydx32hh9f0t1heze5htqa"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 21:33:18.571156	2025-08-10 21:33:18.571156	\N
42	ORD-1754862163042-efmg4ao9g	ORD-1754862163042-efmg4ao9g	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2ayz7r3msy4rnapweksjs8j"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 21:42:46.150954	2025-08-10 21:42:46.150954	\N
43	ORD-1754862560210-ulijaq7qh	ORD-1754862560210-ulijaq7qh	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2azbe9c5fn10tc8s2jb3tfc"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-10 21:49:26.261229	2025-08-10 21:49:26.261229	\N
44	ORD-1754989601212-pwu0gzd4e	ORD-1754989601212-pwu0gzd4e	1	flutterwave	4200.00	NGN	pending	{"data": {"link": "https://checkout.flutterwave.com/v3/hosted/pay/flwlnk-01k2ergb15ch3tya91c8yvybvr"}, "status": "success", "message": "Hosted Link"}	{}	2025-08-12 09:06:44.302724	2025-08-12 09:06:44.302724	\N
\.


--
-- TOC entry 6087 (class 0 OID 17974)
-- Dependencies: 269
-- Data for Name: payment_webhooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_webhooks (id, gateway_id, event_id, event_type, payload, processed, created_at) FROM stdin;
\.


--
-- TOC entry 6040 (class 0 OID 16961)
-- Dependencies: 222
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permissions (id, name, display_name, description, resource, action, scope, created_at) FROM stdin;
1	users.read	View Users	View user information	users	read	global	2025-07-30 21:49:03.798492
2	users.create	Create Users	Create new users	users	create	global	2025-07-30 21:49:03.798492
3	users.update	Update Users	Update user information	users	update	global	2025-07-30 21:49:03.798492
4	users.delete	Delete Users	Delete users	users	delete	global	2025-07-30 21:49:03.798492
5	users.manage_roles	Manage User Roles	Assign and remove roles from users	users	manage_roles	global	2025-07-30 21:49:03.798492
6	roles.read	View Roles	View role information	roles	read	global	2025-07-30 21:49:03.798492
7	roles.create	Create Roles	Create new roles	roles	create	global	2025-07-30 21:49:03.798492
8	roles.update	Update Roles	Update role information	roles	update	global	2025-07-30 21:49:03.798492
9	roles.delete	Delete Roles	Delete roles	roles	delete	global	2025-07-30 21:49:03.798492
10	roles.manage_permissions	Manage Role Permissions	Assign and remove permissions from roles	roles	manage_permissions	global	2025-07-30 21:49:03.798492
11	permissions.read	View Permissions	View permission information	permissions	read	global	2025-07-30 21:49:03.798492
12	permissions.create	Create Permissions	Create new permissions	permissions	create	global	2025-07-30 21:49:03.798492
13	permissions.update	Update Permissions	Update permission information	permissions	update	global	2025-07-30 21:49:03.798492
14	permissions.delete	Delete Permissions	Delete permissions	permissions	delete	global	2025-07-30 21:49:03.798492
15	content.read	View Content	View all content	content	read	global	2025-07-30 21:49:03.798492
16	content.create	Create Content	Create new content	content	create	global	2025-07-30 21:49:03.798492
17	content.update	Update Content	Update existing content	content	update	global	2025-07-30 21:49:03.798492
18	content.delete	Delete Content	Delete content	content	delete	global	2025-07-30 21:49:03.798492
19	content.publish	Publish Content	Publish content	content	publish	global	2025-07-30 21:49:03.798492
20	content.moderate	Moderate Content	Moderate user-generated content	content	moderate	global	2025-07-30 21:49:03.798492
21	system.settings	Manage System Settings	Manage system configuration	system	settings	global	2025-07-30 21:49:03.798492
22	system.analytics	View Analytics	View system analytics and reports	system	analytics	global	2025-07-30 21:49:03.798492
23	system.audit_logs	View Audit Logs	View system audit logs	system	audit_logs	global	2025-07-30 21:49:03.798492
24	profile.read	View Own Profile	View own user profile	profile	read	user	2025-07-30 21:49:03.798492
25	profile.update	Update Own Profile	Update own user profile	profile	update	user	2025-07-30 21:49:03.798492
26	content.manage	Manage Content	Full content management including blog posts, categories, and publishing	content	manage	global	2025-08-01 18:28:49.102668
27	orders.create	Create Orders	Create new orders	orders	create	user	2025-08-05 00:33:25.036441
28	orders.read	View Orders	View own orders	orders	read	user	2025-08-05 00:33:25.231379
29	orders.update	Update Orders	Update own orders	orders	update	user	2025-08-05 00:33:25.426656
30	orders.cancel	Cancel Orders	Cancel own orders	orders	cancel	user	2025-08-05 00:33:25.621338
31	checkout.access	Access Checkout	Access checkout process	checkout	access	user	2025-08-05 00:33:25.816538
32	checkout.complete	Complete Checkout	Complete purchase process	checkout	complete	user	2025-08-05 00:33:26.016512
33	checkout.guest	Guest Checkout	Complete checkout as guest	checkout	guest	global	2025-08-05 00:33:26.211453
34	library.access	Access Library	Access personal library	library	access	user	2025-08-05 00:33:26.411589
35	library.manage	Manage Library	Manage library items	library	manage	user	2025-08-05 00:33:26.614462
36	payment.process	Process Payment	Process payment transactions	payment	process	user	2025-08-05 00:33:26.811505
37	payment.verify	Verify Payment	Verify payment status	payment	verify	user	2025-08-05 00:33:27.006608
38	cart.access	Access Cart	Access shopping cart	cart	access	user	2025-08-05 00:33:27.201568
39	cart.manage	Manage Cart	Add/remove cart items	cart	manage	user	2025-08-05 00:33:27.4098
56	orders.delete	Delete Orders	Delete orders	orders	delete	global	2025-08-08 21:50:54.136444
57	orders.view	View Order Details	View detailed order information	orders	view	global	2025-08-08 21:50:54.330182
\.


--
-- TOC entry 6131 (class 0 OID 18536)
-- Dependencies: 313
-- Data for Name: public_pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_pages (id, page_type, content, created_at, updated_at) FROM stdin;
1	about_us	{"cta": {"title": "Join the Reading Revolution", "description": "Start your journey with ReadnWin and discover a world of knowledge, imagination, and growth.", "primaryButton": "Get Started Free", "secondaryButton": "Learn More"}, "hero": {"title": "About ReadnWin", "subtitle": "Revolutionizing the way people read, learn, and grow"}, "team": [{"bio": "Former publishing executive with 15+ years in digital reading innovation. Passionate about making literature accessible to everyone.", "name": "Sarah Johnson", "role": "CEO & Founder", "image": "https://picsum.photos/seed/team-sarah/300/300", "twitter": "#", "linkedin": "#"}, {"bio": "PhD in Computer Science with expertise in AI and machine learning. Leads our technology innovation and platform development.", "name": "Dr. Michael Chen", "role": "CTO", "image": "https://picsum.photos/seed/team-michael/300/300", "twitter": "#", "linkedin": "#"}, {"bio": "Former literary agent and editor. Curates our book collection and ensures quality content for our readers.", "name": "Emma Rodriguez", "role": "Head of Content", "image": "https://picsum.photos/seed/team-emma/300/300", "twitter": "#", "linkedin": "#"}, {"bio": "Award-winning UX designer focused on creating intuitive reading experiences across all devices.", "name": "David Wilson", "role": "Head of Design", "image": "https://picsum.photos/seed/team-david/300/300", "twitter": "#", "linkedin": "#"}], "stats": [{"label": "Active Readers", "number": "50K+"}, {"label": "Books Available", "number": "100K+"}, {"label": "Reader Satisfaction", "number": "95%"}, {"label": "Support Available", "number": "24/7"}], "story": {"title": "Our Story", "timeline": [{"year": "2019", "title": "Founded", "description": "Started with a vision to democratize reading"}, {"year": "2021", "title": "Growth", "description": "Reached 10,000 active readers"}, {"year": "2023", "title": "Innovation", "description": "Launched AI-powered reading recommendations"}, {"year": "2024", "title": "Expansion", "description": "Global platform with 50,000+ readers"}], "description": "ReadnWin was born from a simple observation: while technology was advancing rapidly, the way we read and access literature remained largely unchanged."}, "values": [{"icon": "ri-book-open-line", "title": "Accessibility", "description": "Making reading accessible to everyone, regardless of background or ability."}, {"icon": "ri-lightbulb-line", "title": "Innovation", "description": "Continuously innovating to enhance the reading experience with cutting-edge technology."}, {"icon": "ri-heart-line", "title": "Community", "description": "Building a global community of readers who share knowledge and inspire each other."}, {"icon": "ri-shield-check-line", "title": "Quality", "description": "Maintaining the highest standards in content curation and platform reliability."}], "mission": {"title": "Our Mission", "features": ["Unlimited Access", "Global Community"], "description": "<p>At ReadnWin, we believe that reading is the foundation of personal growth and societal progress. Our mission is to make quality literature accessible to everyone, everywhere.</p>"}}	2025-08-02 17:23:50.768718+00	2025-08-02 18:10:21.407471+00
2	contact_us	{"cta": {"title": "Ready to Get Started?", "description": "Join thousands of readers who are already enjoying the ReadnWin experience.", "primaryButton": "Start Reading Free", "secondaryButton": "Learn More"}, "faqs": [{"answer": "Simply sign up for a free account and start exploring our vast library of books. You can read on any device and sync your progress across platforms.", "question": "How do I get started with ReadnWin?"}, {"answer": "We offer a comprehensive collection including fiction, non-fiction, academic texts, self-help books, and much more. Our library is constantly growing with new releases.", "question": "What types of books are available?"}, {"answer": "Yes! You can download books to read offline. Simply tap the download button on any book and it will be available for offline reading.", "question": "Can I read offline?"}, {"answer": "We offer both free and premium plans. The free plan includes access to thousands of books, while premium unlocks our entire library and advanced features.", "question": "How much does ReadnWin cost?"}, {"answer": "You can cancel your subscription anytime from your account settings. There are no cancellation fees and you'll continue to have access until the end of your billing period.", "question": "How do I cancel my subscription?"}, {"answer": "Absolutely. We take your privacy seriously. Your reading history and personal data are encrypted and never shared with third parties without your explicit consent.", "question": "Is my reading data private?"}], "form": {"title": "Send us a Message", "subjects": ["General Inquiry", "Technical Support", "Account Issues", "Billing Questions", "Feature Request", "Partnership", "Press/Media", "Other"], "description": "Fill out the form below and we'll get back to you as soon as possible."}, "hero": {"title": "Contact Us", "subtitle": "We'd love to hear from you. Get in touch with our team for any questions."}, "office": {"hours": "Monday - Friday: 9:00 AM - 6:00 PM", "title": "Visit Our Office", "address": "123 Reading Street, Book City, BC 12345", "parking": "Free parking available in our building", "description": "Located in the heart of Book City, our headquarters is where the magic happens. Come visit us and see how we're revolutionizing the reading experience."}, "contactMethods": [{"icon": "ri-mail-line", "title": "Email Us", "action": "mailto:hello@readnwin.com", "contact": "hello@readnwin.com", "description": "Get in touch with our support team"}, {"icon": "ri-phone-line", "title": "Call Us", "action": "tel:+15551234567", "contact": "+1 (555) 123-4567", "description": "Speak with our customer service"}, {"icon": "ri-message-3-line", "title": "Live Chat", "action": "#", "contact": "Available 24/7", "description": "Chat with us in real-time"}, {"icon": "ri-map-pin-line", "title": "Visit Us", "action": "#", "contact": "123 Reading Street, Book City, BC 12345", "description": "Our headquarters location"}]}	2025-08-02 17:23:50.768718+00	2025-08-02 18:11:12.674941+00
\.


--
-- TOC entry 6197 (class 0 OID 19408)
-- Dependencies: 379
-- Data for Name: reading_goal_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_goal_progress (id, goal_id, user_id, date, value, created_at) FROM stdin;
\.


--
-- TOC entry 6109 (class 0 OID 18231)
-- Dependencies: 291
-- Data for Name: reading_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_goals (id, user_id, goal_type, target_value, current_value, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
18	1	annual_books	60	0	2025-01-01	2025-12-31	t	2025-08-12 12:00:30.729653	2025-08-12 12:00:30.729653
19	1	monthly_pages	1500	0	2025-01-01	2025-01-31	t	2025-08-12 12:00:31.096202	2025-08-12 12:00:31.096202
20	1	reading_streak	30	0	2025-01-01	2025-12-31	t	2025-08-12 12:00:31.593992	2025-08-12 12:00:31.593992
\.


--
-- TOC entry 6191 (class 0 OID 19337)
-- Dependencies: 373
-- Data for Name: reading_highlights; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_highlights (id, user_id, book_id, page_number, highlight_text, start_position, end_position, color, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6133 (class 0 OID 18555)
-- Dependencies: 315
-- Data for Name: reading_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_notes (id, user_id, book_id, page_number, chapter_title, note_type, content, color, is_public, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6071 (class 0 OID 17691)
-- Dependencies: 253
-- Data for Name: reading_progress; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_progress (id, user_id, book_id, current_page, total_pages, progress_percentage, last_read_at, created_at, updated_at) FROM stdin;
9	1	1	10	432	10.00	2025-08-01 13:39:53.772666	2025-08-01 13:39:52.54774	2025-08-01 13:39:53.772666
7	1	8	96	320	30.00	2025-05-25 14:35:14.829	2025-05-25 14:35:14.829	2025-05-25 14:35:14.829
8	1	2	167	180	93.00	2025-05-21 14:35:14.829	2025-05-21 14:35:14.829	2025-05-21 14:35:14.829
\.


--
-- TOC entry 6193 (class 0 OID 19359)
-- Dependencies: 375
-- Data for Name: reading_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_sessions (id, user_id, book_id, session_start, session_end, pages_read, reading_time_minutes, reading_speed_pages_per_hour, created_at) FROM stdin;
\.


--
-- TOC entry 6215 (class 0 OID 19645)
-- Dependencies: 397
-- Data for Name: reading_speed_tracking; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_speed_tracking (id, user_id, book_id, session_id, page_number, words_on_page, time_spent_seconds, reading_speed_wpm, created_at) FROM stdin;
\.


--
-- TOC entry 6195 (class 0 OID 19389)
-- Dependencies: 377
-- Data for Name: reading_streaks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reading_streaks (id, user_id, current_streak, longest_streak, last_read_date, streak_start_date, total_reading_days, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6044 (class 0 OID 17001)
-- Dependencies: 226
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, role_id, permission_id, granted_by, granted_at) FROM stdin;
1	1	1	\N	2025-07-30 21:49:03.798492
2	1	2	\N	2025-07-30 21:49:03.798492
3	1	3	\N	2025-07-30 21:49:03.798492
4	1	4	\N	2025-07-30 21:49:03.798492
5	1	5	\N	2025-07-30 21:49:03.798492
6	1	6	\N	2025-07-30 21:49:03.798492
7	1	7	\N	2025-07-30 21:49:03.798492
8	1	8	\N	2025-07-30 21:49:03.798492
9	1	9	\N	2025-07-30 21:49:03.798492
10	1	10	\N	2025-07-30 21:49:03.798492
11	1	11	\N	2025-07-30 21:49:03.798492
12	1	12	\N	2025-07-30 21:49:03.798492
13	1	13	\N	2025-07-30 21:49:03.798492
14	1	14	\N	2025-07-30 21:49:03.798492
15	1	15	\N	2025-07-30 21:49:03.798492
16	1	16	\N	2025-07-30 21:49:03.798492
17	1	17	\N	2025-07-30 21:49:03.798492
18	1	18	\N	2025-07-30 21:49:03.798492
19	1	19	\N	2025-07-30 21:49:03.798492
20	1	20	\N	2025-07-30 21:49:03.798492
21	1	21	\N	2025-07-30 21:49:03.798492
22	1	22	\N	2025-07-30 21:49:03.798492
23	1	23	\N	2025-07-30 21:49:03.798492
24	1	24	\N	2025-07-30 21:49:03.798492
25	1	25	\N	2025-07-30 21:49:03.798492
26	2	1	\N	2025-07-30 21:49:03.798492
27	2	2	\N	2025-07-30 21:49:03.798492
28	2	3	\N	2025-07-30 21:49:03.798492
29	2	4	\N	2025-07-30 21:49:03.798492
30	2	5	\N	2025-07-30 21:49:03.798492
31	2	6	\N	2025-07-30 21:49:03.798492
32	2	7	\N	2025-07-30 21:49:03.798492
33	2	8	\N	2025-07-30 21:49:03.798492
34	2	9	\N	2025-07-30 21:49:03.798492
35	2	10	\N	2025-07-30 21:49:03.798492
36	2	11	\N	2025-07-30 21:49:03.798492
37	2	12	\N	2025-07-30 21:49:03.798492
38	2	13	\N	2025-07-30 21:49:03.798492
39	2	14	\N	2025-07-30 21:49:03.798492
40	2	15	\N	2025-07-30 21:49:03.798492
41	2	16	\N	2025-07-30 21:49:03.798492
42	2	17	\N	2025-07-30 21:49:03.798492
43	2	18	\N	2025-07-30 21:49:03.798492
44	2	19	\N	2025-07-30 21:49:03.798492
45	2	20	\N	2025-07-30 21:49:03.798492
46	2	24	\N	2025-07-30 21:49:03.798492
47	2	25	\N	2025-07-30 21:49:03.798492
48	3	20	\N	2025-07-30 21:49:03.798492
49	3	15	\N	2025-07-30 21:49:03.798492
50	3	24	\N	2025-07-30 21:49:03.798492
51	3	25	\N	2025-07-30 21:49:03.798492
52	3	1	\N	2025-07-30 21:49:03.798492
53	4	16	\N	2025-07-30 21:49:03.798492
54	4	19	\N	2025-07-30 21:49:03.798492
55	4	15	\N	2025-07-30 21:49:03.798492
56	4	17	\N	2025-07-30 21:49:03.798492
57	4	24	\N	2025-07-30 21:49:03.798492
58	4	25	\N	2025-07-30 21:49:03.798492
59	5	15	\N	2025-07-30 21:49:03.798492
60	5	17	\N	2025-07-30 21:49:03.798492
61	5	24	\N	2025-07-30 21:49:03.798492
62	5	25	\N	2025-07-30 21:49:03.798492
63	6	15	\N	2025-07-30 21:49:03.798492
64	6	24	\N	2025-07-30 21:49:03.798492
65	6	25	\N	2025-07-30 21:49:03.798492
66	2	26	\N	2025-08-01 18:28:49.818278
67	1	26	\N	2025-08-01 18:28:50.313927
68	6	27	\N	2025-08-05 00:33:28.001325
69	6	28	\N	2025-08-05 00:33:28.401577
70	6	29	\N	2025-08-05 00:33:28.794375
71	6	30	\N	2025-08-05 00:33:29.329995
72	6	31	\N	2025-08-05 00:33:29.814389
73	6	32	\N	2025-08-05 00:33:30.22142
74	6	34	\N	2025-08-05 00:33:30.631373
75	6	35	\N	2025-08-05 00:33:31.03628
76	6	36	\N	2025-08-05 00:33:31.451605
77	6	37	\N	2025-08-05 00:33:31.861598
78	6	38	\N	2025-08-05 00:33:32.251539
79	6	39	\N	2025-08-05 00:33:32.654705
80	2	27	\N	2025-08-05 00:33:33.256363
81	2	28	\N	2025-08-05 00:33:33.646429
82	2	29	\N	2025-08-05 00:33:34.046415
83	2	30	\N	2025-08-05 00:33:34.546388
84	2	31	\N	2025-08-05 00:33:34.941543
85	2	32	\N	2025-08-05 00:33:35.33154
86	2	34	\N	2025-08-05 00:33:35.747515
87	2	35	\N	2025-08-05 00:33:36.164695
88	2	36	\N	2025-08-05 00:33:36.566482
89	2	37	\N	2025-08-05 00:33:36.977406
90	2	38	\N	2025-08-05 00:33:37.391467
91	2	39	\N	2025-08-05 00:33:37.781321
92	1	27	\N	2025-08-05 00:33:38.402324
93	1	28	\N	2025-08-05 00:33:38.802798
94	1	29	\N	2025-08-05 00:33:39.221456
95	1	30	\N	2025-08-05 00:33:39.646752
96	1	31	\N	2025-08-05 00:33:40.054443
97	1	32	\N	2025-08-05 00:33:40.456416
98	1	34	\N	2025-08-05 00:33:40.856298
99	1	35	\N	2025-08-05 00:33:41.276439
100	1	36	\N	2025-08-05 00:33:41.68668
101	1	37	\N	2025-08-05 00:33:42.08143
102	1	38	\N	2025-08-05 00:33:42.501397
103	1	39	\N	2025-08-05 00:33:42.916512
141	2	56	\N	2025-08-08 21:50:55.130085
144	2	57	\N	2025-08-08 21:50:55.742163
146	1	56	\N	2025-08-08 21:50:56.540063
149	1	57	\N	2025-08-08 21:50:57.105972
\.


--
-- TOC entry 6038 (class 0 OID 16947)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, display_name, description, priority, is_system_role, created_at) FROM stdin;
1	super_admin	Super Administrator	Full system access with all permissions	100	t	2025-07-30 21:49:03.798492
2	admin	Administrator	System administrator with most permissions	90	t	2025-07-30 21:49:03.798492
3	moderator	Moderator	Content moderator with limited admin access	70	t	2025-07-30 21:49:03.798492
4	author	Author	Content creator with publishing permissions	50	t	2025-07-30 21:49:03.798492
5	editor	Editor	Content editor with review permissions	40	t	2025-07-30 21:49:03.798492
6	reader	Reader	Standard user with basic permissions	10	t	2025-07-30 21:49:03.798492
\.


--
-- TOC entry 6089 (class 0 OID 17992)
-- Dependencies: 271
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, session_token, user_id, expires_at, last_activity, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6155 (class 0 OID 19002)
-- Dependencies: 337
-- Data for Name: shipping_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_details (id, order_id, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, shipping_method, tracking_number, status, shipped_at, delivered_at, created_at, updated_at) FROM stdin;
1	36	Test Recipient	+2348012345678	123 Test Street	\N	Lagos	Lagos	\N	Nigeria	\N	\N	pending	\N	\N	2025-08-05 18:56:17.364688	2025-08-05 18:56:17.364688
2	37	Test Recipient	+2348012345678	123 Test Street	\N	Lagos	Lagos	\N	Nigeria	\N	\N	pending	\N	\N	2025-08-05 19:08:49.053979	2025-08-05 19:08:49.053979
3	38	Test Recipient	+2348012345678	123 Test Street	\N	Lagos	Lagos	\N	Nigeria	\N	\N	pending	\N	\N	2025-08-05 19:11:39.681059	2025-08-05 19:11:39.681059
4	41	Admin User	07039201122	asdfasdfasdfasdfa,dfasdfds		asdfasdfasdfd	dfsdasdf		Nigeria	Standard Shipping	\N	pending	\N	\N	2025-08-05 20:28:19.21468	2025-08-05 20:28:19.21468
5	42	Admin User	07039201122	sedrfasdfasdfasd		dfasdfads	dsfsd		Nigeria	Standard Shipping	\N	pending	\N	\N	2025-08-05 20:40:38.075424	2025-08-05 20:40:38.075424
6	44	Admin User	07039201122	1234213erfxcbzcxbzx		dfdf	wrgdfb		Nigeria	Standard Shipping	\N	pending	\N	\N	2025-08-05 20:56:30.794467	2025-08-05 20:56:30.794467
7	45	Admin User	039201122	sagsdt34534sdf		fgsg	sdfgsd		Nigeria	Standard Shipping	\N	pending	\N	\N	2025-08-05 21:02:41.729478	2025-08-05 21:02:41.729478
8	46	Admin User	07039201122	jghjhgvkj		esh	geswher		Nigeria	Standard Shipping	\N	pending	\N	\N	2025-08-06 08:22:05.162135	2025-08-06 08:22:05.162135
\.


--
-- TOC entry 6227 (class 0 OID 19779)
-- Dependencies: 409
-- Data for Name: shipping_method_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_method_zones (id, shipping_method_id, shipping_zone_id, is_available, created_at) FROM stdin;
1	2	14	t	2025-08-09 13:43:56.288026
2	2	15	t	2025-08-09 13:43:56.288026
3	2	16	t	2025-08-09 13:43:56.288026
4	2	17	t	2025-08-09 13:43:56.288026
5	2	18	t	2025-08-09 13:43:56.288026
6	2	19	t	2025-08-09 13:43:56.288026
7	2	20	t	2025-08-09 13:43:56.288026
8	2	21	t	2025-08-09 13:43:56.288026
9	11	14	t	2025-08-09 13:44:53.513043
10	12	14	t	2025-08-09 13:44:53.513043
11	13	14	t	2025-08-09 13:44:53.513043
12	11	15	t	2025-08-09 13:44:53.513043
13	12	15	t	2025-08-09 13:44:53.513043
14	13	15	t	2025-08-09 13:44:53.513043
15	11	16	t	2025-08-09 13:44:53.513043
16	12	16	t	2025-08-09 13:44:53.513043
17	13	16	t	2025-08-09 13:44:53.513043
18	11	17	t	2025-08-09 13:44:53.513043
19	12	17	t	2025-08-09 13:44:53.513043
20	13	17	t	2025-08-09 13:44:53.513043
21	11	18	t	2025-08-09 13:44:53.513043
22	12	18	t	2025-08-09 13:44:53.513043
23	13	18	t	2025-08-09 13:44:53.513043
24	11	19	t	2025-08-09 13:44:53.513043
25	12	19	t	2025-08-09 13:44:53.513043
26	13	19	t	2025-08-09 13:44:53.513043
27	11	20	t	2025-08-09 13:44:53.513043
28	12	20	t	2025-08-09 13:44:53.513043
29	13	20	t	2025-08-09 13:44:53.513043
30	11	21	t	2025-08-09 13:44:53.513043
31	12	21	t	2025-08-09 13:44:53.513043
32	13	21	t	2025-08-09 13:44:53.513043
65	14	14	t	2025-08-09 17:25:20.061218
66	14	15	t	2025-08-09 17:25:20.061218
67	14	16	t	2025-08-09 17:25:20.061218
68	14	17	t	2025-08-09 17:25:20.061218
69	14	18	t	2025-08-09 17:25:20.061218
70	14	19	t	2025-08-09 17:25:20.061218
71	14	20	t	2025-08-09 17:25:20.061218
72	14	21	t	2025-08-09 17:25:20.061218
73	15	14	t	2025-08-09 17:25:20.061218
74	15	15	t	2025-08-09 17:25:20.061218
75	15	16	t	2025-08-09 17:25:20.061218
76	15	17	t	2025-08-09 17:25:20.061218
77	15	18	t	2025-08-09 17:25:20.061218
78	15	19	t	2025-08-09 17:25:20.061218
79	15	20	t	2025-08-09 17:25:20.061218
80	15	21	t	2025-08-09 17:25:20.061218
81	16	14	t	2025-08-09 17:25:20.061218
82	16	15	t	2025-08-09 17:25:20.061218
83	16	16	t	2025-08-09 17:25:20.061218
84	16	17	t	2025-08-09 17:25:20.061218
85	16	18	t	2025-08-09 17:25:20.061218
86	16	19	t	2025-08-09 17:25:20.061218
87	16	20	t	2025-08-09 17:25:20.061218
88	16	21	t	2025-08-09 17:25:20.061218
89	17	14	t	2025-08-09 17:25:20.061218
90	17	15	t	2025-08-09 17:25:20.061218
91	17	16	t	2025-08-09 17:25:20.061218
92	17	17	t	2025-08-09 17:25:20.061218
93	17	18	t	2025-08-09 17:25:20.061218
94	17	19	t	2025-08-09 17:25:20.061218
95	17	20	t	2025-08-09 17:25:20.061218
96	17	21	t	2025-08-09 17:25:20.061218
\.


--
-- TOC entry 6075 (class 0 OID 17763)
-- Dependencies: 257
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_methods (id, name, description, base_cost, cost_per_item, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active, sort_order, created_at) FROM stdin;
2	Express Shipping	Fast 2-3 day shipping	3000.00	0.00	10000.00	2	3	t	0	2025-07-31 12:38:38.349827
11	Same Day Lagos	Delivery within Lagos on the same day	5000.00	500.00	10000.00	0	1	t	1	2025-08-09 13:44:37.749714
12	Standard Shipping	Regular delivery within 3-5 business days	1500.00	200.00	5000.00	3	5	t	3	2025-08-09 13:44:37.749714
13	Economy Shipping	Budget-friendly delivery within 5-7 business days	800.00	150.00	3000.00	5	7	t	4	2025-08-09 13:44:37.749714
14	Same Day Delivery	Delivery within Lagos on the same day	5000.00	500.00	10000.00	0	1	t	1	2025-08-09 17:25:19.861357
15	Express Delivery	Fast delivery within 1-2 business days	3000.00	300.00	8000.00	1	2	t	2	2025-08-09 17:25:19.861357
16	Standard Delivery	Regular delivery within 3-5 business days	1500.00	200.00	5000.00	3	5	t	3	2025-08-09 17:25:19.861357
17	Economy Delivery	Budget-friendly delivery within 5-7 business days	800.00	150.00	3000.00	5	7	t	4	2025-08-09 17:25:19.861357
\.


--
-- TOC entry 6125 (class 0 OID 18479)
-- Dependencies: 307
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_rates (id, zone_id, method_id, min_order_value, max_order_value, rate, is_active, created_at, updated_at) FROM stdin;
31	16	2	0.00	999999.99	5100.00	t	2025-08-02 14:14:27.591248	2025-08-04 23:16:48.134487
34	17	2	0.00	999999.99	4500.00	t	2025-08-02 14:14:28.718325	2025-08-04 23:16:49.027507
28	15	2	0.00	999999.99	3900.00	t	2025-08-02 14:14:26.627474	2025-08-04 23:16:50.396449
24	14	2	0.00	999999.99	3000.00	t	2025-08-02 14:14:25.602227	2025-08-04 23:16:42.408372
37	18	2	0.00	999999.99	5700.00	t	2025-08-02 14:14:29.574304	2025-08-04 23:16:43.254372
43	20	2	0.00	999999.99	6900.00	t	2025-08-02 14:14:31.042301	2025-08-04 23:16:44.260466
40	19	2	0.00	999999.99	6300.00	t	2025-08-02 14:14:30.192282	2025-08-04 23:16:45.768473
46	21	2	0.00	999999.99	6000.00	t	2025-08-02 14:14:31.872371	2025-08-04 23:16:46.73439
\.


--
-- TOC entry 6123 (class 0 OID 18467)
-- Dependencies: 305
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipping_zones (id, name, countries, states, postal_codes, is_active, created_at, updated_at) FROM stdin;
14	Lagos Metropolitan	{NG}	{Lagos}	{}	t	2025-08-02 14:14:22.038738	2025-08-02 14:14:22.038738
15	South West Nigeria	{NG}	{Ogun,Ondo,Osun,Oyo,Ekiti}	{}	t	2025-08-02 14:14:22.251402	2025-08-02 14:14:22.251402
16	South East Nigeria	{NG}	{Abia,Anambra,Ebonyi,Enugu,Imo}	{}	t	2025-08-02 14:14:22.46254	2025-08-02 14:14:22.46254
17	South South Nigeria	{NG}	{"Akwa Ibom",Bayelsa,"Cross River",Delta,Edo,Rivers}	{}	t	2025-08-02 14:14:22.832129	2025-08-02 14:14:22.832129
18	North Central Nigeria	{NG}	{Benue,Kogi,Kwara,Nasarawa,Niger,Plateau,"Federal Capital Territory"}	{}	t	2025-08-02 14:14:23.042687	2025-08-02 14:14:23.042687
19	North West Nigeria	{NG}	{Jigawa,Kaduna,Kano,Katsina,Kebbi,Sokoto,Zamfara}	{}	t	2025-08-02 14:14:23.480469	2025-08-02 14:14:23.480469
20	North East Nigeria	{NG}	{Adamawa,Bauchi,Borno,Gombe,Taraba,Yobe}	{}	t	2025-08-02 14:14:23.879741	2025-08-02 14:14:23.879741
21	Rest of Nigeria	{NG}	{}	{}	t	2025-08-02 14:14:24.075447	2025-08-02 14:14:24.075447
\.


--
-- TOC entry 6050 (class 0 OID 17067)
-- Dependencies: 232
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, setting_key, setting_value, description, created_at, updated_at) FROM stdin;
111	require_account_for_checkout	false	Require users to create an account before checkout	2025-08-02 22:39:17.69265	2025-08-02 22:40:58.960592
112	allow_guest_orders	true	Allow processing of orders from guest users	2025-08-02 22:39:18.026775	2025-08-02 22:40:59.109707
113	guest_checkout_message	Guest checkout is available. Create an account for a better experience.	Message displayed to guest checkout users	2025-08-02 22:39:18.209951	2025-08-02 22:40:59.359612
114	minimum_order_amount	0	Minimum order amount required for checkout (in NGN)	2025-08-02 22:39:18.558949	2025-08-02 22:40:59.511659
115	maximum_order_amount	1000000	Maximum order amount allowed for checkout (in NGN)	2025-08-02 22:39:18.72082	2025-08-02 22:40:59.865533
116	auto_cancel_guest_orders	true	Automatically cancel unpaid guest orders after expiry	2025-08-02 22:39:19.101941	2025-08-02 22:41:00.016006
117	guest_order_expiry_hours	24	Hours before guest orders are automatically cancelled	2025-08-02 22:39:19.273708	2025-08-02 22:41:00.16258
126	user_registration	true	Allow new users to register	2025-08-04 08:47:45.378964	2025-08-04 08:47:45.378964
127	email_notifications	true	Send email notifications to users	2025-08-04 08:47:45.76196	2025-08-04 08:47:45.76196
128	double_opt_in	true	Require email verification for new user registrations	2025-08-04 08:47:45.955916	2025-08-04 08:47:45.955916
129	review_moderation	true	Moderate reviews before publishing	2025-08-04 08:47:46.28094	2025-08-04 08:47:46.28094
130	maintenance_mode	false	Temporarily disable site for maintenance	2025-08-04 08:47:46.420882	2025-08-04 08:47:46.420882
131	site_name	ReadnWin	Site name	2025-08-04 08:47:46.571208	2025-08-04 08:47:46.571208
132	site_description	Your digital library for endless reading	Site description	2025-08-04 08:47:46.802899	2025-08-04 08:47:46.802899
3	email_gateway_resend_from_email	onboarding@resend.dev	Default from email for Resend	2025-07-31 09:18:32.203244	2025-08-07 15:27:34.895638
133	default_shipping_cost	1500	\N	2025-08-04 23:12:23.362414	2025-08-04 23:12:23.362414
134	default_postal_code	100001	\N	2025-08-04 23:12:23.762499	2025-08-04 23:12:23.762499
135	default_country	NG	\N	2025-08-04 23:12:24.156463	2025-08-04 23:12:24.156463
4	email_gateway_resend_from_name	Resend	Default from name for Resend	2025-07-31 09:18:32.409555	2025-08-07 15:27:35.078703
5	email_gateway_resend_domain	readnwin.com	Domain for Resend	2025-07-31 09:18:32.614789	2025-08-07 15:27:35.278656
7	email_gateway_smtp_is_active	false	Whether SMTP gateway is active	2025-07-31 09:18:33.0245	2025-08-11 00:07:33.577829
2	email_gateway_resend_is_active	true	Whether Resend gateway is active	2025-07-31 09:18:32.00459	2025-08-11 00:07:33.706258
1	email_gateway_active	resend	Active email gateway (resend or smtp)	2025-07-31 09:18:31.807467	2025-08-11 00:07:33.447923
8	email_gateway_smtp_from_email	noreply@readnwin.com	Default from email for SMTP	2025-07-31 09:18:33.194525	2025-08-07 15:27:35.89744
9	email_gateway_smtp_from_name	ReadnWin	Default from name for SMTP	2025-07-31 09:18:33.437355	2025-08-07 15:27:36.106569
10	email_gateway_smtp_host	mail.readnwin.com	SMTP host	2025-07-31 09:18:33.639601	2025-08-07 15:27:36.29348
11	email_gateway_smtp_port	587	SMTP port	2025-07-31 09:18:33.779481	2025-08-07 15:27:36.525613
12	email_gateway_smtp_username	portal@readnwin.com	SMTP username	2025-07-31 09:18:33.944602	2025-08-07 15:27:36.682603
13	email_gateway_smtp_password	Lagsalemail@2025	SMTP password	2025-07-31 09:18:34.199538	2025-08-07 15:27:36.849534
14	email_gateway_smtp_secure	false	Whether to use SSL/TLS for SMTP	2025-07-31 09:18:34.474561	2025-08-07 15:27:37.010551
136	registration_double_opt_in	false	Require email verification for new user registrations	2025-08-06 11:33:08.779276	2025-08-12 11:21:33.148643
6	email_gateway_resend_api_key	re_iZPZgHqW_6Xk7zMMqUGMY7hWFcj8DVge6	Resend API key	2025-07-31 09:18:32.819511	2025-08-11 00:04:33.760969
110	guest_checkout_enabled	true	Enable or disable guest checkout functionality	2025-08-02 22:39:17.500748	2025-08-02 22:40:58.812539
170	about_page_content	{"hero":{"title":"About ReadnWin","subtitle":"Revolutionizing the way people read, learn, and grow through the use of technology"},"mission":{"title":"Our Mission","description":"At ReadnWin, we believe that reading is the foundation of personal growth and societal progress. Our mission is to make quality literature accessible to everyone, everywhere.","features":["Unlimited Access","AI-Powered Recommendations","Global Community"]},"missionGrid":[{"icon":"ri-book-line","title":"Digital Library","description":"Access millions of books instantly","color":"text-blue-600"},{"icon":"ri-brain-line","title":"Smart Learning","description":"AI-powered reading insights","color":"text-purple-600"},{"icon":"ri-group-line","title":"Reader Community","description":"Connect with fellow readers","color":"text-cyan-600"},{"icon":"ri-device-line","title":"Multi-Platform","description":"Read anywhere, anytime","color":"text-green-600"}],"stats":[{"number":"50K+","label":"Active Readers"},{"number":"100K+","label":"Books Available"},{"number":"95%","label":"Reader Satisfaction"},{"number":"24/7","label":"Support Available"}],"values":[{"icon":"ri-book-open-line","title":"Accessibility","description":"Making reading accessible to everyone, regardless of background or ability."},{"icon":"ri-lightbulb-line","title":"Innovation","description":"Continuously innovating to enhance the reading experience with cutting-edge technology."},{"icon":"ri-heart-line","title":"Community","description":"Building a global community of readers who share knowledge and inspire each other."},{"icon":"ri-shield-check-line","title":"Quality","description":"Maintaining the highest standards in content curation and platform reliability."}],"story":{"title":"Our Story","description":"ReadnWin was born from a simple observation: while technology was advancing rapidly, the way we read and access literature remained largely unchanged.","timeline":[{"year":"2019","title":"Founded","description":"Started with a vision to democratize reading"},{"year":"2021","title":"Growth","description":"Reached 10,000 active readers"},{"year":"2023","title":"Innovation","description":"Launched AI-powered reading recommendations"},{"year":"2024","title":"Expansion","description":"Global platform with 50,000+ readers"}]},"team":[{"name":"Sarah Johnson","role":"CEO & Founder","bio":"Former publishing executive with 15+ years in digital reading innovation. Passionate about making literature accessible to everyone.","image":"https://picsum.photos/seed/team-sarah/300/300","linkedin":"#","twitter":"#"},{"name":"Dr. Michael Chen","role":"CTO","bio":"PhD in Computer Science with expertise in AI and machine learning. Leads our technology innovation and platform development.","image":"https://picsum.photos/seed/team-michael/300/300","linkedin":"#","twitter":"#"},{"name":"Emma Rodriguez","role":"Head of Content","bio":"Former literary agent and editor. Curates our book collection and ensures quality content for our readers.","image":"https://picsum.photos/seed/team-emma/300/300","linkedin":"#","twitter":"#"},{"name":"David Wilson","role":"Head of Design","bio":"Award-winning UX designer focused on creating intuitive reading experiences across all devices.","image":"https://picsum.photos/seed/team-david/300/300","linkedin":"#","twitter":"#"}],"cta":{"title":"Join the Reading Revolution","description":"Start your journey with ReadnWin and discover a world of knowledge, imagination, and growth.","primaryButton":"Get Started Free","secondaryButton":"Learn More"}}	About page content configuration	2025-08-07 16:48:18.323815	2025-08-07 17:00:45.374475
\.


--
-- TOC entry 6077 (class 0 OID 17777)
-- Dependencies: 259
-- Data for Name: tax_rates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tax_rates (id, country, state, city, postal_code, rate, tax_name, is_active, created_at) FROM stdin;
\.


--
-- TOC entry 6161 (class 0 OID 19081)
-- Dependencies: 343
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, role, bio, image_url, linkedin_url, twitter_url, order_index, is_active, created_at, updated_at) FROM stdin;
1	Sarah Johnson	CEO & Founder	Former publishing executive with 15+ years in digital reading innovation. Passionate about making literature accessible to everyone.	https://picsum.photos/seed/team-sarah/300/300	\N	\N	1	t	2025-08-05 21:38:01.825368+00	2025-08-05 21:38:01.825368+00
2	Dr. Michael Chen	CTO	PhD in Computer Science with expertise in AI and machine learning. Leads our technology innovation and platform development.	https://picsum.photos/seed/team-michael/300/300	\N	\N	2	t	2025-08-05 21:38:01.825368+00	2025-08-05 21:38:01.825368+00
3	Emma Rodriguez	Head of Content	Former literary agent and editor. Curates our book collection and ensures quality content for our readers.	https://picsum.photos/seed/team-emma/300/300	\N	\N	3	t	2025-08-05 21:38:01.825368+00	2025-08-05 21:38:01.825368+00
4	David Wilson	Head of Design	Award-winning UX designer focused on creating intuitive reading experiences across all devices.	https://picsum.photos/seed/team-david/300/300	\N	\N	4	t	2025-08-05 21:38:01.825368+00	2025-08-05 21:38:01.825368+00
\.


--
-- TOC entry 6115 (class 0 OID 18288)
-- Dependencies: 297
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_achievements (id, user_id, achievement_type, title, description, icon, earned_at, metadata) FROM stdin;
1	1	speed_reader	Speed Reader	Read 5 books in a month	ri-flashlight-line	2025-08-01 22:46:30.00826	\N
2	1	diverse_reader	Diverse Reader	Read 5 different genres	ri-book-line	2025-08-01 22:46:30.00826	\N
3	1	speed_reader	Speed Reader	Read 5 books in a month	ri-flashlight-line	2025-08-03 19:43:32.209093	\N
4	1	diverse_reader	Diverse Reader	Read 5 different genres	ri-book-line	2025-08-03 19:43:32.209093	\N
\.


--
-- TOC entry 6111 (class 0 OID 18250)
-- Dependencies: 293
-- Data for Name: user_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_activity (id, user_id, activity_type, title, description, book_id, metadata, created_at) FROM stdin;
7	1	completed	Finished reading "The Alchemist"	Completed reading Paulo Coelho masterpiece	\N	\N	2025-08-01 22:46:29.513279
8	1	review	Wrote review for "Dune"	Shared thoughts on Frank Herbert sci-fi epic	\N	\N	2025-08-01 22:46:29.513279
9	1	started	Started reading "The Psychology of Money"	Began reading Morgan Housel financial insights	\N	\N	2025-08-01 22:46:29.513279
10	1	achievement	Reached 50 books read this year!	Milestone achievement unlocked	\N	\N	2025-08-01 22:46:29.513279
11	1	purchase	Purchased "Atomic Habits"	Added James Clear book to library	\N	\N	2025-08-01 22:46:29.513279
12	1	bookmark	Added "The Midnight Library" to wishlist	Saved Matt Haig book for later	\N	\N	2025-08-01 22:46:29.513279
13	1	completed	Finished reading "The Alchemist"	Completed reading Paulo Coelho masterpiece	\N	\N	2025-08-03 19:43:31.816824
14	1	review	Wrote review for "Dune"	Shared thoughts on Frank Herbert sci-fi epic	\N	\N	2025-08-03 19:43:31.816824
15	1	started	Started reading "The Psychology of Money"	Began reading Morgan Housel financial insights	\N	\N	2025-08-03 19:43:31.816824
16	1	achievement	Reached 50 books read this year!	Milestone achievement unlocked	\N	\N	2025-08-03 19:43:31.816824
17	1	purchase	Purchased "Atomic Habits"	Added James Clear book to library	\N	\N	2025-08-03 19:43:31.816824
18	1	bookmark	Added "The Midnight Library" to wishlist	Saved Matt Haig book for later	\N	\N	2025-08-03 19:43:31.816824
21	1	review	Wrote a 5-star review for "Moby Dick"	\N	\N	{"rating": 5}	2025-08-08 21:01:40.382441
22	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:02:20.366654
23	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:02:41.408069
24	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:04:36.314256
25	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:04:56.794807
26	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:04:59.171269
27	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:04:59.512861
28	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:20:30.359215
29	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:21:42.99083
30	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:22:13.488395
31	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:22:19.193475
32	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:23:13.874529
33	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:42:00.780983
34	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:43:12.883713
35	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:43:25.033822
36	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:43:37.930298
37	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:10.824697
38	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:21.985908
39	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:22.977163
40	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:23.177678
41	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:23.363158
42	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:23.565982
43	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:23.786677
44	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:24.044349
45	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:34.95887
46	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:45:47.330405
47	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:48:50.733273
48	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:49:27.055124
49	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:51:33.980446
50	1	started	Started reading "Moby Dick"	\N	\N	{"action": "book_started"}	2025-08-08 21:56:27.430814
\.


--
-- TOC entry 6209 (class 0 OID 19578)
-- Dependencies: 391
-- Data for Name: user_bookmarks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_bookmarks (id, user_id, book_id, page_number, title, description, created_at) FROM stdin;
\.


--
-- TOC entry 6213 (class 0 OID 19623)
-- Dependencies: 395
-- Data for Name: user_highlights; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_highlights (id, user_id, book_id, page_number, start_position, end_position, highlighted_text, highlight_color, note_text, created_at) FROM stdin;
\.


--
-- TOC entry 6073 (class 0 OID 17715)
-- Dependencies: 255
-- Data for Name: user_library; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_library (id, user_id, book_id, order_id, purchase_date, is_favorite, download_count, last_downloaded_at, reading_progress, last_read_at) FROM stdin;
30	1	3	\N	2025-08-12 10:57:16.389456	f	0	\N	0	\N
\.


--
-- TOC entry 6211 (class 0 OID 19600)
-- Dependencies: 393
-- Data for Name: user_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notes (id, user_id, book_id, page_number, note_text, note_type, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 6143 (class 0 OID 18683)
-- Dependencies: 325
-- Data for Name: user_notes_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notes_tags (id, note_id, tag_id, created_at) FROM stdin;
\.


--
-- TOC entry 6113 (class 0 OID 18271)
-- Dependencies: 295
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notifications (id, user_id, type, title, message, is_read, metadata, created_at) FROM stdin;
15	1	system	Test Notification	This is a test notification	t	\N	2025-08-08 13:48:52.827176
10	1	system	Test System Notification	This is a test notification for system verification	t	{"test": true}	2025-08-08 07:29:47.270302
6	1	book	New Book Recommendation	Based on your reading history, we recommend The Seven Husbands of Evelyn Hugo	t	\N	2025-08-03 19:43:31.956524
7	1	social	Review Liked	Someone found your review of Atomic Habits helpful	t	\N	2025-08-03 19:43:31.956524
5	1	achievement	New Achievement Unlocked!	You reached your monthly reading goal	t	\N	2025-08-03 19:43:31.956524
8	1	reminder	Reading Reminder	You have not read today. Continue with The Psychology of Money	t	\N	2025-08-03 19:43:31.956524
3	1	social	Review Liked	Someone found your review of Atomic Habits helpful	t	\N	2025-08-01 22:46:29.768043
4	1	reminder	Reading Reminder	You have not read today. Continue with The Psychology of Money	t	\N	2025-08-01 22:46:29.768043
2	1	book	New Book Recommendation	Based on your reading history, we recommend The Seven Husbands of Evelyn Hugo	t	\N	2025-08-01 22:46:29.768043
1	1	achievement	New Achievement Unlocked!	You reached your monthly reading goal	t	\N	2025-08-01 22:46:29.768043
\.


--
-- TOC entry 6046 (class 0 OID 17026)
-- Dependencies: 228
-- Data for Name: user_permission_cache; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_permission_cache (id, user_id, permission_name, is_active, cached_at) FROM stdin;
208	29	cart.access	t	2025-08-12 11:49:39.05955
209	29	cart.manage	t	2025-08-12 11:49:39.252068
210	29	checkout.access	t	2025-08-12 11:49:39.443688
211	29	checkout.complete	t	2025-08-12 11:49:39.569703
212	29	content.read	t	2025-08-12 11:49:39.866674
213	29	library.access	t	2025-08-12 11:49:40.074612
214	29	library.manage	t	2025-08-12 11:49:40.196637
215	29	orders.cancel	t	2025-08-12 11:49:40.322777
216	29	orders.create	t	2025-08-12 11:49:40.47469
217	29	orders.read	t	2025-08-12 11:49:40.695692
218	29	orders.update	t	2025-08-12 11:49:40.892575
219	29	payment.process	t	2025-08-12 11:49:41.016675
220	29	payment.verify	t	2025-08-12 11:49:41.136811
221	29	profile.read	t	2025-08-12 11:49:41.296781
222	29	profile.update	t	2025-08-12 11:49:41.422318
223	30	cart.access	t	2025-08-12 14:50:26.733343
224	30	cart.manage	t	2025-08-12 14:50:26.819069
225	30	checkout.access	t	2025-08-12 14:50:26.903526
226	30	checkout.complete	t	2025-08-12 14:50:26.987664
227	30	content.read	t	2025-08-12 14:50:27.071775
228	30	library.access	t	2025-08-12 14:50:27.155698
229	30	library.manage	t	2025-08-12 14:50:27.23971
230	30	orders.cancel	t	2025-08-12 14:50:27.323701
231	30	orders.create	t	2025-08-12 14:50:27.407611
232	30	orders.read	t	2025-08-12 14:50:27.491524
233	30	orders.update	t	2025-08-12 14:50:27.575302
234	30	payment.process	t	2025-08-12 14:50:27.658998
235	30	payment.verify	t	2025-08-12 14:50:27.742691
236	30	profile.read	t	2025-08-12 14:50:27.826768
237	30	profile.update	t	2025-08-12 14:50:27.910497
238	31	cart.access	t	2025-08-12 14:55:27.248491
239	31	cart.manage	t	2025-08-12 14:55:27.331186
108	1	cart.access	t	2025-08-08 21:56:42.731239
109	1	cart.manage	t	2025-08-08 21:56:42.93061
110	1	checkout.access	t	2025-08-08 21:56:43.138442
111	1	checkout.complete	t	2025-08-08 21:56:43.362035
112	1	content.create	t	2025-08-08 21:56:43.706648
113	1	content.delete	t	2025-08-08 21:56:44.002038
114	1	content.manage	t	2025-08-08 21:56:44.30708
115	1	content.moderate	t	2025-08-08 21:56:44.51507
116	1	content.publish	t	2025-08-08 21:56:44.70622
117	1	content.read	t	2025-08-08 21:56:45.131908
118	1	content.update	t	2025-08-08 21:56:45.346145
119	1	library.access	t	2025-08-08 21:56:45.554297
120	1	library.manage	t	2025-08-08 21:56:45.962483
121	1	orders.cancel	t	2025-08-08 21:56:46.146247
122	1	orders.create	t	2025-08-08 21:56:46.402899
123	1	orders.delete	t	2025-08-08 21:56:46.994155
124	1	orders.read	t	2025-08-08 21:56:47.194679
125	1	orders.update	t	2025-08-08 21:56:47.601976
126	1	orders.view	t	2025-08-08 21:56:47.89011
127	1	payment.process	t	2025-08-08 21:56:48.323116
128	1	payment.verify	t	2025-08-08 21:56:48.530874
129	1	permissions.create	t	2025-08-08 21:56:48.770456
130	1	permissions.delete	t	2025-08-08 21:56:49.202414
131	1	permissions.read	t	2025-08-08 21:56:49.394273
132	1	permissions.update	t	2025-08-08 21:56:49.650094
133	1	profile.read	t	2025-08-08 21:56:49.874755
134	1	profile.update	t	2025-08-08 21:56:50.090138
135	1	roles.create	t	2025-08-08 21:56:50.314414
136	1	roles.delete	t	2025-08-08 21:56:50.532833
137	1	roles.manage_permissions	t	2025-08-08 21:56:50.722115
138	1	roles.read	t	2025-08-08 21:56:50.93103
139	1	roles.update	t	2025-08-08 21:56:51.123557
140	1	system.analytics	t	2025-08-08 21:56:51.323074
141	1	system.audit_logs	t	2025-08-08 21:56:51.525649
142	1	system.settings	t	2025-08-08 21:56:51.730525
143	1	users.create	t	2025-08-08 21:56:51.940056
144	1	users.delete	t	2025-08-08 21:56:52.163457
240	31	checkout.access	t	2025-08-12 14:55:27.413784
241	31	checkout.complete	t	2025-08-12 14:55:27.49639
242	31	content.read	t	2025-08-12 14:55:27.578987
145	1	users.manage_roles	t	2025-08-08 21:56:52.405685
146	1	users.read	t	2025-08-08 21:56:52.620187
147	1	users.update	t	2025-08-08 21:56:52.858953
148	17	cart.access	t	2025-08-11 07:25:37.993313
149	17	cart.manage	t	2025-08-11 07:25:38.077716
150	17	checkout.access	t	2025-08-11 07:25:38.161702
151	17	checkout.complete	t	2025-08-11 07:25:38.245684
152	17	content.read	t	2025-08-11 07:25:38.329419
153	17	library.access	t	2025-08-11 07:25:38.413064
154	17	library.manage	t	2025-08-11 07:25:38.496936
155	17	orders.cancel	t	2025-08-11 07:25:38.580871
156	17	orders.create	t	2025-08-11 07:25:38.664645
157	17	orders.read	t	2025-08-11 07:25:38.748353
158	17	orders.update	t	2025-08-11 07:25:38.831955
159	17	payment.process	t	2025-08-11 07:25:38.915661
160	17	payment.verify	t	2025-08-11 07:25:38.999388
161	17	profile.read	t	2025-08-11 07:25:39.083087
162	17	profile.update	t	2025-08-11 07:25:39.166848
243	31	library.access	t	2025-08-12 14:55:27.661602
244	31	library.manage	t	2025-08-12 14:55:27.744226
245	31	orders.cancel	t	2025-08-12 14:55:27.826723
246	31	orders.create	t	2025-08-12 14:55:27.909177
247	31	orders.read	t	2025-08-12 14:55:27.991673
248	31	orders.update	t	2025-08-12 14:55:28.074354
249	31	payment.process	t	2025-08-12 14:55:28.156936
250	31	payment.verify	t	2025-08-12 14:55:28.23941
251	31	profile.read	t	2025-08-12 14:55:28.321921
252	31	profile.update	t	2025-08-12 14:55:28.40443
253	32	cart.access	t	2025-08-12 16:32:11.865829
254	32	cart.manage	t	2025-08-12 16:32:11.951212
255	32	checkout.access	t	2025-08-12 16:32:12.03516
256	32	checkout.complete	t	2025-08-12 16:32:12.119104
257	32	content.read	t	2025-08-12 16:32:12.20326
258	32	library.access	t	2025-08-12 16:32:12.287092
259	32	library.manage	t	2025-08-12 16:32:12.370886
260	32	orders.cancel	t	2025-08-12 16:32:12.454602
261	32	orders.create	t	2025-08-12 16:32:12.53838
262	32	orders.read	t	2025-08-12 16:32:12.622327
263	32	orders.update	t	2025-08-12 16:32:12.706123
264	32	payment.process	t	2025-08-12 16:32:12.789795
265	32	payment.verify	t	2025-08-12 16:32:12.873648
266	32	profile.read	t	2025-08-12 16:32:12.957408
267	32	profile.update	t	2025-08-12 16:32:13.04106
\.


--
-- TOC entry 6042 (class 0 OID 16975)
-- Dependencies: 224
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role_id, assigned_by, assigned_at, expires_at, is_active) FROM stdin;
1	1	1	\N	2025-08-02 17:44:19.817699	\N	t
5	17	6	\N	2025-08-11 07:25:37.732313	\N	t
11	29	6	\N	2025-08-12 11:49:38.44473	\N	t
12	30	6	\N	2025-08-12 14:50:26.473186	\N	t
13	31	6	\N	2025-08-12 14:55:26.998753	\N	t
14	32	6	\N	2025-08-12 16:32:11.597876	\N	t
\.


--
-- TOC entry 6225 (class 0 OID 19754)
-- Dependencies: 407
-- Data for Name: user_shipping_addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_shipping_addresses (id, user_id, first_name, last_name, email, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default, created_at, updated_at) FROM stdin;
1	1	John	Doe	john@example.com	1234567890	123 Main St		New York	NY	10001	USA	t	2025-08-08 17:22:33.632544	2025-08-08 17:22:33.632544
2	1	Adelodun	Peter	adelodunpeter69@gmail.com	07039201122	123 main street		Magboro	Ogun	110001	Nigeria	t	2025-08-08 18:21:04.188536	2025-08-08 18:21:04.188536
\.


--
-- TOC entry 6036 (class 0 OID 16929)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, password_hash, first_name, last_name, avatar_url, status, email_verified, created_at, updated_at, last_login, email_verification_token, email_verification_expires, welcome_email_sent, date_of_birth, preferred_language, newsletter_subscription, total_orders, total_spent, is_student, matriculation_number, course, department, school_name) FROM stdin;
29	adelodunpeter69@gmail.com	Peter	$2b$12$jlOu.47/3C2XVyiTnS23Ru9UVjKwcgkuO0Gg//ItieLObWTA7J/DS	Adelodun	Peter	\N	active	t	2025-08-12 11:49:38.014676	2025-08-12 12:00:47.907386	2025-08-12 11:55:59.514118	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
30	adelodunpeter24@gmail.com	John	$2b$12$lWJGR8hbf4TxWKRbQaPLguNLEp4Rv.IzdJS.bd2TFXTd0tvl15kYC	David	John	\N	active	t	2025-08-12 14:50:26.292017	2025-08-12 14:52:50.214236	2025-08-12 14:52:44.798043	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
4	test@user.com	testuser	hashedpassword	\N	\N	\N	active	t	2025-08-05 18:56:16.137985	2025-08-12 11:21:33.769293	\N	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
17	bobbchrisworld@gmail.com	bobbchrisworld@gmail.com	$2b$12$o7P7biyCSYB.S4pMW5/cuOWDL6Rk8SZqKZxEawF3UrOpH0X6rPOgi	ROBERT	CHRIS	\N	active	t	2025-08-11 07:25:37.557093	2025-08-12 11:21:34.170719	\N	8b08b8bc8f6f966915032df3cd9c2faa9601b33abe9cbf4c02daac714730db84	2025-08-12 07:25:37.518	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
31	stanleym37@gmail.com	martin	$2b$12$W41KbczCc0HfoIg9Z8lGiuVLDnz7JlevpARkIIZVpsq9BMObsafsm	Stanley	Martin	\N	active	t	2025-08-12 14:55:26.83289	2025-08-12 15:07:46.763709	2025-08-12 15:34:49.957089	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
32	mosesakinpelu40@gmail.com	Moses	$2b$12$GGVICXoC1gNOIBePSjt.4eX6xJPHHyHZVZ46khdUZluyHykvgINrW	Moses	Praise	\N	active	t	2025-08-12 16:32:11.421124	2025-08-12 16:33:38.040646	2025-08-12 16:33:33.794155	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
1	admin@readnwin.com	admin	$2b$10$Nlc0AESsF1mLBhlo6IB40.4C77EydHzhzeNYCODC0EVjxNG9y8o3i	Admin	User	\N	active	t	2025-07-30 21:49:03.798492	2025-08-08 19:46:38.846705	2025-08-12 20:48:13.337735	\N	\N	t	\N	en	f	0	0.00	f	\N	\N	\N	\N
\.


--
-- TOC entry 6219 (class 0 OID 19689)
-- Dependencies: 401
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist_items (id, user_id, book_id, added_at) FROM stdin;
\.


--
-- TOC entry 6340 (class 0 OID 0)
-- Dependencies: 340
-- Name: about_us_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.about_us_sections_id_seq', 2, true);


--
-- TOC entry 6341 (class 0 OID 0)
-- Dependencies: 404
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.achievements_id_seq', 26, true);


--
-- TOC entry 6342 (class 0 OID 0)
-- Dependencies: 229
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1597, true);


--
-- TOC entry 6343 (class 0 OID 0)
-- Dependencies: 235
-- Name: authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.authors_id_seq', 63, true);


--
-- TOC entry 6344 (class 0 OID 0)
-- Dependencies: 382
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 4, true);


--
-- TOC entry 6345 (class 0 OID 0)
-- Dependencies: 384
-- Name: bank_transfer_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_transfer_notifications_id_seq', 21, true);


--
-- TOC entry 6346 (class 0 OID 0)
-- Dependencies: 300
-- Name: bank_transfer_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_transfer_payments_id_seq', 3, true);


--
-- TOC entry 6347 (class 0 OID 0)
-- Dependencies: 388
-- Name: bank_transfer_proofs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_transfer_proofs_id_seq', 1, false);


--
-- TOC entry 6348 (class 0 OID 0)
-- Dependencies: 380
-- Name: bank_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bank_transfers_id_seq', 13, true);


--
-- TOC entry 6349 (class 0 OID 0)
-- Dependencies: 274
-- Name: blog_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_categories_id_seq', 8, true);


--
-- TOC entry 6350 (class 0 OID 0)
-- Dependencies: 278
-- Name: blog_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_comments_id_seq', 1, false);


--
-- TOC entry 6351 (class 0 OID 0)
-- Dependencies: 276
-- Name: blog_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_images_id_seq', 3, true);


--
-- TOC entry 6352 (class 0 OID 0)
-- Dependencies: 280
-- Name: blog_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_likes_id_seq', 1, false);


--
-- TOC entry 6353 (class 0 OID 0)
-- Dependencies: 272
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 2, true);


--
-- TOC entry 6354 (class 0 OID 0)
-- Dependencies: 282
-- Name: blog_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_views_id_seq', 20, true);


--
-- TOC entry 6355 (class 0 OID 0)
-- Dependencies: 242
-- Name: book_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.book_reviews_id_seq', 4, true);


--
-- TOC entry 6356 (class 0 OID 0)
-- Dependencies: 239
-- Name: book_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.book_tags_id_seq', 1, false);


--
-- TOC entry 6357 (class 0 OID 0)
-- Dependencies: 237
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.books_id_seq', 87, true);


--
-- TOC entry 6358 (class 0 OID 0)
-- Dependencies: 244
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 82, true);


--
-- TOC entry 6359 (class 0 OID 0)
-- Dependencies: 233
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 35, true);


--
-- TOC entry 6360 (class 0 OID 0)
-- Dependencies: 346
-- Name: company_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_stats_id_seq', 4, true);


--
-- TOC entry 6361 (class 0 OID 0)
-- Dependencies: 344
-- Name: company_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.company_values_id_seq', 4, true);


--
-- TOC entry 6362 (class 0 OID 0)
-- Dependencies: 350
-- Name: contact_faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_faqs_id_seq', 6, true);


--
-- TOC entry 6363 (class 0 OID 0)
-- Dependencies: 348
-- Name: contact_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_methods_id_seq', 4, true);


--
-- TOC entry 6364 (class 0 OID 0)
-- Dependencies: 368
-- Name: contact_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_settings_id_seq', 12, true);


--
-- TOC entry 6365 (class 0 OID 0)
-- Dependencies: 352
-- Name: contact_subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_subjects_id_seq', 8, true);


--
-- TOC entry 6366 (class 0 OID 0)
-- Dependencies: 366
-- Name: contact_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_submissions_id_seq', 1, false);


--
-- TOC entry 6367 (class 0 OID 0)
-- Dependencies: 360
-- Name: content_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_blocks_id_seq', 1, false);


--
-- TOC entry 6368 (class 0 OID 0)
-- Dependencies: 362
-- Name: content_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_images_id_seq', 1, false);


--
-- TOC entry 6369 (class 0 OID 0)
-- Dependencies: 356
-- Name: content_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_pages_id_seq', 4, true);


--
-- TOC entry 6370 (class 0 OID 0)
-- Dependencies: 358
-- Name: content_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_sections_id_seq', 16, true);


--
-- TOC entry 6371 (class 0 OID 0)
-- Dependencies: 364
-- Name: content_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.content_versions_id_seq', 1, false);


--
-- TOC entry 6372 (class 0 OID 0)
-- Dependencies: 250
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.discounts_id_seq', 1, false);


--
-- TOC entry 6373 (class 0 OID 0)
-- Dependencies: 262
-- Name: ecommerce_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ecommerce_settings_id_seq', 10, true);


--
-- TOC entry 6374 (class 0 OID 0)
-- Dependencies: 288
-- Name: email_function_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_function_assignments_id_seq', 17, true);


--
-- TOC entry 6375 (class 0 OID 0)
-- Dependencies: 286
-- Name: email_functions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_functions_id_seq', 16, true);


--
-- TOC entry 6376 (class 0 OID 0)
-- Dependencies: 402
-- Name: email_gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_gateways_id_seq', 1, true);


--
-- TOC entry 6377 (class 0 OID 0)
-- Dependencies: 410
-- Name: email_retry_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_retry_queue_id_seq', 1, false);


--
-- TOC entry 6378 (class 0 OID 0)
-- Dependencies: 284
-- Name: email_template_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_template_categories_id_seq', 6, true);


--
-- TOC entry 6379 (class 0 OID 0)
-- Dependencies: 260
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 19, true);


--
-- TOC entry 6380 (class 0 OID 0)
-- Dependencies: 370
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faqs_id_seq', 12, true);


--
-- TOC entry 6381 (class 0 OID 0)
-- Dependencies: 398
-- Name: inventory_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.inventory_transactions_id_seq', 1, false);


--
-- TOC entry 6382 (class 0 OID 0)
-- Dependencies: 310
-- Name: nigerian_lgas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nigerian_lgas_id_seq', 2095, true);


--
-- TOC entry 6383 (class 0 OID 0)
-- Dependencies: 308
-- Name: nigerian_states_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nigerian_states_id_seq', 101, true);


--
-- TOC entry 6384 (class 0 OID 0)
-- Dependencies: 320
-- Name: note_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.note_shares_id_seq', 1, false);


--
-- TOC entry 6385 (class 0 OID 0)
-- Dependencies: 318
-- Name: note_tag_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.note_tag_assignments_id_seq', 1, false);


--
-- TOC entry 6386 (class 0 OID 0)
-- Dependencies: 316
-- Name: note_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.note_tags_id_seq', 10, true);


--
-- TOC entry 6387 (class 0 OID 0)
-- Dependencies: 322
-- Name: notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notes_id_seq', 1, false);


--
-- TOC entry 6388 (class 0 OID 0)
-- Dependencies: 354
-- Name: office_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.office_location_id_seq', 1, true);


--
-- TOC entry 6389 (class 0 OID 0)
-- Dependencies: 248
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 103, true);


--
-- TOC entry 6390 (class 0 OID 0)
-- Dependencies: 266
-- Name: order_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_notes_id_seq', 1, false);


--
-- TOC entry 6391 (class 0 OID 0)
-- Dependencies: 264
-- Name: order_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_status_history_id_seq', 16, true);


--
-- TOC entry 6392 (class 0 OID 0)
-- Dependencies: 246
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 143, true);


--
-- TOC entry 6393 (class 0 OID 0)
-- Dependencies: 338
-- Name: page_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.page_content_id_seq', 2, true);


--
-- TOC entry 6394 (class 0 OID 0)
-- Dependencies: 326
-- Name: payment_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_analytics_id_seq', 1, false);


--
-- TOC entry 6395 (class 0 OID 0)
-- Dependencies: 330
-- Name: payment_gateway_tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_gateway_tests_id_seq', 1, false);


--
-- TOC entry 6396 (class 0 OID 0)
-- Dependencies: 298
-- Name: payment_gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_gateways_id_seq', 41, true);


--
-- TOC entry 6397 (class 0 OID 0)
-- Dependencies: 332
-- Name: payment_method_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_method_preferences_id_seq', 1, false);


--
-- TOC entry 6398 (class 0 OID 0)
-- Dependencies: 386
-- Name: payment_proofs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_proofs_id_seq', 8, true);


--
-- TOC entry 6399 (class 0 OID 0)
-- Dependencies: 328
-- Name: payment_refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_refunds_id_seq', 1, false);


--
-- TOC entry 6400 (class 0 OID 0)
-- Dependencies: 302
-- Name: payment_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_settings_id_seq', 55, true);


--
-- TOC entry 6401 (class 0 OID 0)
-- Dependencies: 334
-- Name: payment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_transactions_id_seq', 44, true);


--
-- TOC entry 6402 (class 0 OID 0)
-- Dependencies: 268
-- Name: payment_webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payment_webhooks_id_seq', 1, false);


--
-- TOC entry 6403 (class 0 OID 0)
-- Dependencies: 221
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permissions_id_seq', 57, true);


--
-- TOC entry 6404 (class 0 OID 0)
-- Dependencies: 312
-- Name: public_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.public_pages_id_seq', 2, true);


--
-- TOC entry 6405 (class 0 OID 0)
-- Dependencies: 378
-- Name: reading_goal_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_goal_progress_id_seq', 1, true);


--
-- TOC entry 6406 (class 0 OID 0)
-- Dependencies: 290
-- Name: reading_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_goals_id_seq', 20, true);


--
-- TOC entry 6407 (class 0 OID 0)
-- Dependencies: 372
-- Name: reading_highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_highlights_id_seq', 3, true);


--
-- TOC entry 6408 (class 0 OID 0)
-- Dependencies: 314
-- Name: reading_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_notes_id_seq', 3, true);


--
-- TOC entry 6409 (class 0 OID 0)
-- Dependencies: 252
-- Name: reading_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_progress_id_seq', 114, true);


--
-- TOC entry 6410 (class 0 OID 0)
-- Dependencies: 374
-- Name: reading_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_sessions_id_seq', 3, true);


--
-- TOC entry 6411 (class 0 OID 0)
-- Dependencies: 396
-- Name: reading_speed_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_speed_tracking_id_seq', 1, false);


--
-- TOC entry 6412 (class 0 OID 0)
-- Dependencies: 376
-- Name: reading_streaks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reading_streaks_id_seq', 1, true);


--
-- TOC entry 6413 (class 0 OID 0)
-- Dependencies: 225
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 149, true);


--
-- TOC entry 6414 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- TOC entry 6415 (class 0 OID 0)
-- Dependencies: 270
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sessions_id_seq', 10, true);


--
-- TOC entry 6416 (class 0 OID 0)
-- Dependencies: 336
-- Name: shipping_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_details_id_seq', 8, true);


--
-- TOC entry 6417 (class 0 OID 0)
-- Dependencies: 408
-- Name: shipping_method_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_method_zones_id_seq', 96, true);


--
-- TOC entry 6418 (class 0 OID 0)
-- Dependencies: 256
-- Name: shipping_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_methods_id_seq', 17, true);


--
-- TOC entry 6419 (class 0 OID 0)
-- Dependencies: 306
-- Name: shipping_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_rates_id_seq', 46, true);


--
-- TOC entry 6420 (class 0 OID 0)
-- Dependencies: 304
-- Name: shipping_zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.shipping_zones_id_seq', 21, true);


--
-- TOC entry 6421 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 174, true);


--
-- TOC entry 6422 (class 0 OID 0)
-- Dependencies: 258
-- Name: tax_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tax_rates_id_seq', 1, false);


--
-- TOC entry 6423 (class 0 OID 0)
-- Dependencies: 342
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 4, true);


--
-- TOC entry 6424 (class 0 OID 0)
-- Dependencies: 296
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 4, true);


--
-- TOC entry 6425 (class 0 OID 0)
-- Dependencies: 292
-- Name: user_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_activity_id_seq', 50, true);


--
-- TOC entry 6426 (class 0 OID 0)
-- Dependencies: 390
-- Name: user_bookmarks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_bookmarks_id_seq', 1, false);


--
-- TOC entry 6427 (class 0 OID 0)
-- Dependencies: 394
-- Name: user_highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_highlights_id_seq', 1, false);


--
-- TOC entry 6428 (class 0 OID 0)
-- Dependencies: 254
-- Name: user_library_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_library_id_seq', 30, true);


--
-- TOC entry 6429 (class 0 OID 0)
-- Dependencies: 392
-- Name: user_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notes_id_seq', 1, false);


--
-- TOC entry 6430 (class 0 OID 0)
-- Dependencies: 324
-- Name: user_notes_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notes_tags_id_seq', 1, false);


--
-- TOC entry 6431 (class 0 OID 0)
-- Dependencies: 294
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 15, true);


--
-- TOC entry 6432 (class 0 OID 0)
-- Dependencies: 227
-- Name: user_permission_cache_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_permission_cache_id_seq', 267, true);


--
-- TOC entry 6433 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 14, true);


--
-- TOC entry 6434 (class 0 OID 0)
-- Dependencies: 406
-- Name: user_shipping_addresses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_shipping_addresses_id_seq', 2, true);


--
-- TOC entry 6435 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 32, true);


--
-- TOC entry 6436 (class 0 OID 0)
-- Dependencies: 400
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 1, false);


--
-- TOC entry 5627 (class 2606 OID 19079)
-- Name: about_us_sections about_us_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.about_us_sections
    ADD CONSTRAINT about_us_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5759 (class 2606 OID 19743)
-- Name: achievements achievements_achievement_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_achievement_type_key UNIQUE (achievement_type);


--
-- TOC entry 5761 (class 2606 OID 19741)
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5292 (class 2606 OID 17050)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5307 (class 2606 OID 17494)
-- Name: authors authors_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_email_key UNIQUE (email);


--
-- TOC entry 5309 (class 2606 OID 17492)
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- TOC entry 5716 (class 2606 OID 19478)
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5720 (class 2606 OID 19490)
-- Name: bank_transfer_notifications bank_transfer_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_notifications
    ADD CONSTRAINT bank_transfer_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5512 (class 2606 OID 18418)
-- Name: bank_transfer_payments bank_transfer_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5514 (class 2606 OID 18422)
-- Name: bank_transfer_payments bank_transfer_payments_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_reference_number_key UNIQUE (reference_number);


--
-- TOC entry 5516 (class 2606 OID 18420)
-- Name: bank_transfer_payments bank_transfer_payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_transaction_id_key UNIQUE (transaction_id);


--
-- TOC entry 5729 (class 2606 OID 19549)
-- Name: bank_transfer_proofs bank_transfer_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_proofs
    ADD CONSTRAINT bank_transfer_proofs_pkey PRIMARY KEY (id);


--
-- TOC entry 5707 (class 2606 OID 19448)
-- Name: bank_transfers bank_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_pkey PRIMARY KEY (id);


--
-- TOC entry 5709 (class 2606 OID 19450)
-- Name: bank_transfers bank_transfers_transaction_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_transaction_reference_key UNIQUE (transaction_reference);


--
-- TOC entry 5441 (class 2606 OID 18057)
-- Name: blog_categories blog_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_name_key UNIQUE (name);


--
-- TOC entry 5443 (class 2606 OID 18055)
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5445 (class 2606 OID 18059)
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- TOC entry 5450 (class 2606 OID 18089)
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5447 (class 2606 OID 18071)
-- Name: blog_images blog_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_images
    ADD CONSTRAINT blog_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5454 (class 2606 OID 18112)
-- Name: blog_likes blog_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_pkey PRIMARY KEY (id);


--
-- TOC entry 5456 (class 2606 OID 18114)
-- Name: blog_likes blog_likes_post_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- TOC entry 5431 (class 2606 OID 18036)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5433 (class 2606 OID 18038)
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- TOC entry 5459 (class 2606 OID 18134)
-- Name: blog_views blog_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_views
    ADD CONSTRAINT blog_views_pkey PRIMARY KEY (id);


--
-- TOC entry 5339 (class 2606 OID 17572)
-- Name: book_reviews book_reviews_book_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_reviews
    ADD CONSTRAINT book_reviews_book_id_user_id_key UNIQUE (book_id, user_id);


--
-- TOC entry 5341 (class 2606 OID 17570)
-- Name: book_reviews book_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_reviews
    ADD CONSTRAINT book_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5337 (class 2606 OID 17544)
-- Name: book_tag_relations book_tag_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tag_relations
    ADD CONSTRAINT book_tag_relations_pkey PRIMARY KEY (book_id, tag_id);


--
-- TOC entry 5333 (class 2606 OID 17539)
-- Name: book_tags book_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tags
    ADD CONSTRAINT book_tags_name_key UNIQUE (name);


--
-- TOC entry 5335 (class 2606 OID 17537)
-- Name: book_tags book_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tags
    ADD CONSTRAINT book_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5313 (class 2606 OID 17518)
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- TOC entry 5315 (class 2606 OID 17516)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- TOC entry 5346 (class 2606 OID 17592)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5348 (class 2606 OID 17594)
-- Name: cart_items cart_items_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- TOC entry 5301 (class 2606 OID 17471)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5303 (class 2606 OID 17473)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5637 (class 2606 OID 19116)
-- Name: company_stats company_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_stats
    ADD CONSTRAINT company_stats_pkey PRIMARY KEY (id);


--
-- TOC entry 5634 (class 2606 OID 19105)
-- Name: company_values company_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_values
    ADD CONSTRAINT company_values_pkey PRIMARY KEY (id);


--
-- TOC entry 5643 (class 2606 OID 19142)
-- Name: contact_faqs contact_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_faqs
    ADD CONSTRAINT contact_faqs_pkey PRIMARY KEY (id);


--
-- TOC entry 5640 (class 2606 OID 19129)
-- Name: contact_methods contact_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_methods
    ADD CONSTRAINT contact_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5676 (class 2606 OID 19301)
-- Name: contact_settings contact_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_settings
    ADD CONSTRAINT contact_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5678 (class 2606 OID 19303)
-- Name: contact_settings contact_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_settings
    ADD CONSTRAINT contact_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5646 (class 2606 OID 19153)
-- Name: contact_subjects contact_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_subjects
    ADD CONSTRAINT contact_subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 5672 (class 2606 OID 19282)
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5662 (class 2606 OID 19230)
-- Name: content_blocks content_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5666 (class 2606 OID 19247)
-- Name: content_images content_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_images
    ADD CONSTRAINT content_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5651 (class 2606 OID 19197)
-- Name: content_pages content_pages_page_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_pages
    ADD CONSTRAINT content_pages_page_key_key UNIQUE (page_key);


--
-- TOC entry 5653 (class 2606 OID 19195)
-- Name: content_pages content_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_pages
    ADD CONSTRAINT content_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5656 (class 2606 OID 19212)
-- Name: content_sections content_sections_page_id_section_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_page_id_section_key_key UNIQUE (page_id, section_key);


--
-- TOC entry 5658 (class 2606 OID 19210)
-- Name: content_sections content_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5669 (class 2606 OID 19262)
-- Name: content_versions content_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_pkey PRIMARY KEY (id);


--
-- TOC entry 5371 (class 2606 OID 17669)
-- Name: discounts discounts_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_code_key UNIQUE (code);


--
-- TOC entry 5373 (class 2606 OID 17667)
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5400 (class 2606 OID 17809)
-- Name: ecommerce_settings ecommerce_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_settings
    ADD CONSTRAINT ecommerce_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5402 (class 2606 OID 17811)
-- Name: ecommerce_settings ecommerce_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecommerce_settings
    ADD CONSTRAINT ecommerce_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5474 (class 2606 OID 18213)
-- Name: email_function_assignments email_function_assignments_function_id_template_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_function_assignments
    ADD CONSTRAINT email_function_assignments_function_id_template_id_key UNIQUE (function_id, template_id);


--
-- TOC entry 5476 (class 2606 OID 18211)
-- Name: email_function_assignments email_function_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_function_assignments
    ADD CONSTRAINT email_function_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5466 (class 2606 OID 18198)
-- Name: email_functions email_functions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_functions
    ADD CONSTRAINT email_functions_name_key UNIQUE (name);


--
-- TOC entry 5468 (class 2606 OID 18196)
-- Name: email_functions email_functions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_functions
    ADD CONSTRAINT email_functions_pkey PRIMARY KEY (id);


--
-- TOC entry 5470 (class 2606 OID 18200)
-- Name: email_functions email_functions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_functions
    ADD CONSTRAINT email_functions_slug_key UNIQUE (slug);


--
-- TOC entry 5757 (class 2606 OID 19721)
-- Name: email_gateways email_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_gateways
    ADD CONSTRAINT email_gateways_pkey PRIMARY KEY (id);


--
-- TOC entry 5773 (class 2606 OID 19826)
-- Name: email_retry_queue email_retry_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_retry_queue
    ADD CONSTRAINT email_retry_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 5462 (class 2606 OID 18176)
-- Name: email_template_categories email_template_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_template_categories
    ADD CONSTRAINT email_template_categories_name_key UNIQUE (name);


--
-- TOC entry 5464 (class 2606 OID 18174)
-- Name: email_template_categories email_template_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_template_categories
    ADD CONSTRAINT email_template_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5393 (class 2606 OID 17798)
-- Name: email_templates email_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_name_key UNIQUE (name);


--
-- TOC entry 5395 (class 2606 OID 17796)
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 5680 (class 2606 OID 19317)
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- TOC entry 5750 (class 2606 OID 19677)
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5542 (class 2606 OID 18526)
-- Name: nigerian_lgas nigerian_lgas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_lgas
    ADD CONSTRAINT nigerian_lgas_pkey PRIMARY KEY (id);


--
-- TOC entry 5544 (class 2606 OID 18528)
-- Name: nigerian_lgas nigerian_lgas_state_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_lgas
    ADD CONSTRAINT nigerian_lgas_state_id_name_key UNIQUE (state_id, name);


--
-- TOC entry 5538 (class 2606 OID 18518)
-- Name: nigerian_states nigerian_states_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_states
    ADD CONSTRAINT nigerian_states_name_key UNIQUE (name);


--
-- TOC entry 5540 (class 2606 OID 18516)
-- Name: nigerian_states nigerian_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_states
    ADD CONSTRAINT nigerian_states_pkey PRIMARY KEY (id);


--
-- TOC entry 5570 (class 2606 OID 18628)
-- Name: note_shares note_shares_note_id_shared_with_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_note_id_shared_with_key UNIQUE (note_id, shared_with);


--
-- TOC entry 5572 (class 2606 OID 18626)
-- Name: note_shares note_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_pkey PRIMARY KEY (id);


--
-- TOC entry 5566 (class 2606 OID 18606)
-- Name: note_tag_assignments note_tag_assignments_note_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tag_assignments
    ADD CONSTRAINT note_tag_assignments_note_id_tag_id_key UNIQUE (note_id, tag_id);


--
-- TOC entry 5568 (class 2606 OID 18604)
-- Name: note_tag_assignments note_tag_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tag_assignments
    ADD CONSTRAINT note_tag_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5562 (class 2606 OID 18589)
-- Name: note_tags note_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5564 (class 2606 OID 18591)
-- Name: note_tags note_tags_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_user_id_name_key UNIQUE (user_id, name);


--
-- TOC entry 5577 (class 2606 OID 18671)
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5649 (class 2606 OID 19165)
-- Name: office_location office_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.office_location
    ADD CONSTRAINT office_location_pkey PRIMARY KEY (id);


--
-- TOC entry 5369 (class 2606 OID 17641)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5413 (class 2606 OID 17877)
-- Name: order_notes order_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5407 (class 2606 OID 17855)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5362 (class 2606 OID 17625)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 5364 (class 2606 OID 17623)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5623 (class 2606 OID 19066)
-- Name: page_content page_content_page_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_page_type_key UNIQUE (page_type);


--
-- TOC entry 5625 (class 2606 OID 19064)
-- Name: page_content page_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_pkey PRIMARY KEY (id);


--
-- TOC entry 5587 (class 2606 OID 18876)
-- Name: payment_analytics payment_analytics_gateway_type_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics
    ADD CONSTRAINT payment_analytics_gateway_type_date_key UNIQUE (gateway_type, date);


--
-- TOC entry 5589 (class 2606 OID 18874)
-- Name: payment_analytics payment_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_analytics
    ADD CONSTRAINT payment_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 5601 (class 2606 OID 18915)
-- Name: payment_gateway_tests payment_gateway_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateway_tests
    ADD CONSTRAINT payment_gateway_tests_pkey PRIMARY KEY (id);


--
-- TOC entry 5508 (class 2606 OID 18380)
-- Name: payment_gateways payment_gateways_gateway_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_gateway_id_key UNIQUE (gateway_id);


--
-- TOC entry 5510 (class 2606 OID 18378)
-- Name: payment_gateways payment_gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_gateways
    ADD CONSTRAINT payment_gateways_pkey PRIMARY KEY (id);


--
-- TOC entry 5605 (class 2606 OID 18927)
-- Name: payment_method_preferences payment_method_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_method_preferences
    ADD CONSTRAINT payment_method_preferences_pkey PRIMARY KEY (id);


--
-- TOC entry 5607 (class 2606 OID 18929)
-- Name: payment_method_preferences payment_method_preferences_user_id_gateway_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_method_preferences
    ADD CONSTRAINT payment_method_preferences_user_id_gateway_type_key UNIQUE (user_id, gateway_type);


--
-- TOC entry 5727 (class 2606 OID 19523)
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- TOC entry 5594 (class 2606 OID 18897)
-- Name: payment_refunds payment_refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 5596 (class 2606 OID 18899)
-- Name: payment_refunds payment_refunds_refund_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_refund_id_key UNIQUE (refund_id);


--
-- TOC entry 5524 (class 2606 OID 18448)
-- Name: payment_settings payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5526 (class 2606 OID 18450)
-- Name: payment_settings payment_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5615 (class 2606 OID 18966)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5617 (class 2606 OID 18968)
-- Name: payment_transactions payment_transactions_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_id_key UNIQUE (transaction_id);


--
-- TOC entry 5419 (class 2606 OID 17985)
-- Name: payment_webhooks payment_webhooks_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_webhooks
    ADD CONSTRAINT payment_webhooks_event_id_key UNIQUE (event_id);


--
-- TOC entry 5421 (class 2606 OID 17983)
-- Name: payment_webhooks payment_webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_webhooks
    ADD CONSTRAINT payment_webhooks_pkey PRIMARY KEY (id);


--
-- TOC entry 5271 (class 2606 OID 16973)
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- TOC entry 5273 (class 2606 OID 16971)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5547 (class 2606 OID 18547)
-- Name: public_pages public_pages_page_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_pages
    ADD CONSTRAINT public_pages_page_type_key UNIQUE (page_type);


--
-- TOC entry 5549 (class 2606 OID 18545)
-- Name: public_pages public_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_pages
    ADD CONSTRAINT public_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5703 (class 2606 OID 19417)
-- Name: reading_goal_progress reading_goal_progress_goal_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goal_progress
    ADD CONSTRAINT reading_goal_progress_goal_id_date_key UNIQUE (goal_id, date);


--
-- TOC entry 5705 (class 2606 OID 19415)
-- Name: reading_goal_progress reading_goal_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goal_progress
    ADD CONSTRAINT reading_goal_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5485 (class 2606 OID 18241)
-- Name: reading_goals reading_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goals
    ADD CONSTRAINT reading_goals_pkey PRIMARY KEY (id);


--
-- TOC entry 5487 (class 2606 OID 18243)
-- Name: reading_goals reading_goals_user_id_goal_type_start_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goals
    ADD CONSTRAINT reading_goals_user_id_goal_type_start_date_key UNIQUE (user_id, goal_type, start_date);


--
-- TOC entry 5687 (class 2606 OID 19347)
-- Name: reading_highlights reading_highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_highlights
    ADD CONSTRAINT reading_highlights_pkey PRIMARY KEY (id);


--
-- TOC entry 5557 (class 2606 OID 18568)
-- Name: reading_notes reading_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_notes
    ADD CONSTRAINT reading_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5559 (class 2606 OID 18570)
-- Name: reading_notes reading_notes_user_id_book_id_page_number_note_type_content_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_notes
    ADD CONSTRAINT reading_notes_user_id_book_id_page_number_note_type_content_key UNIQUE (user_id, book_id, page_number, note_type, content);


--
-- TOC entry 5377 (class 2606 OID 17701)
-- Name: reading_progress reading_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 5379 (class 2606 OID 17703)
-- Name: reading_progress reading_progress_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- TOC entry 5692 (class 2606 OID 19368)
-- Name: reading_sessions reading_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5746 (class 2606 OID 19651)
-- Name: reading_speed_tracking reading_speed_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_speed_tracking
    ADD CONSTRAINT reading_speed_tracking_pkey PRIMARY KEY (id);


--
-- TOC entry 5696 (class 2606 OID 19399)
-- Name: reading_streaks reading_streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_streaks
    ADD CONSTRAINT reading_streaks_pkey PRIMARY KEY (id);


--
-- TOC entry 5698 (class 2606 OID 19401)
-- Name: reading_streaks reading_streaks_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_streaks
    ADD CONSTRAINT reading_streaks_user_id_key UNIQUE (user_id);


--
-- TOC entry 5283 (class 2606 OID 17007)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5285 (class 2606 OID 17009)
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- TOC entry 5267 (class 2606 OID 16959)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5269 (class 2606 OID 16957)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5427 (class 2606 OID 18002)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5429 (class 2606 OID 18004)
-- Name: sessions sessions_session_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_session_token_key UNIQUE (session_token);


--
-- TOC entry 5621 (class 2606 OID 19014)
-- Name: shipping_details shipping_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_details
    ADD CONSTRAINT shipping_details_pkey PRIMARY KEY (id);


--
-- TOC entry 5769 (class 2606 OID 19786)
-- Name: shipping_method_zones shipping_method_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_method_zones
    ADD CONSTRAINT shipping_method_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5771 (class 2606 OID 19788)
-- Name: shipping_method_zones shipping_method_zones_shipping_method_id_shipping_zone_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_method_zones
    ADD CONSTRAINT shipping_method_zones_shipping_method_id_shipping_zone_id_key UNIQUE (shipping_method_id, shipping_zone_id);


--
-- TOC entry 5389 (class 2606 OID 17775)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5536 (class 2606 OID 18491)
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 5530 (class 2606 OID 18477)
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5297 (class 2606 OID 17076)
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5299 (class 2606 OID 17078)
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- TOC entry 5391 (class 2606 OID 17784)
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 5632 (class 2606 OID 19092)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5503 (class 2606 OID 18296)
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5492 (class 2606 OID 18259)
-- Name: user_activity user_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_pkey PRIMARY KEY (id);


--
-- TOC entry 5733 (class 2606 OID 19586)
-- Name: user_bookmarks user_bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_pkey PRIMARY KEY (id);


--
-- TOC entry 5735 (class 2606 OID 19588)
-- Name: user_bookmarks user_bookmarks_user_id_book_id_page_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_user_id_book_id_page_number_key UNIQUE (user_id, book_id, page_number);


--
-- TOC entry 5743 (class 2606 OID 19633)
-- Name: user_highlights user_highlights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_highlights
    ADD CONSTRAINT user_highlights_pkey PRIMARY KEY (id);


--
-- TOC entry 5383 (class 2606 OID 17723)
-- Name: user_library user_library_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_pkey PRIMARY KEY (id);


--
-- TOC entry 5385 (class 2606 OID 17725)
-- Name: user_library user_library_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- TOC entry 5739 (class 2606 OID 19611)
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5581 (class 2606 OID 18691)
-- Name: user_notes_tags user_notes_tags_note_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes_tags
    ADD CONSTRAINT user_notes_tags_note_id_tag_id_key UNIQUE (note_id, tag_id);


--
-- TOC entry 5583 (class 2606 OID 18689)
-- Name: user_notes_tags user_notes_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes_tags
    ADD CONSTRAINT user_notes_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5498 (class 2606 OID 18281)
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5288 (class 2606 OID 17033)
-- Name: user_permission_cache user_permission_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permission_cache
    ADD CONSTRAINT user_permission_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 5290 (class 2606 OID 17035)
-- Name: user_permission_cache user_permission_cache_user_id_permission_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permission_cache
    ADD CONSTRAINT user_permission_cache_user_id_permission_name_key UNIQUE (user_id, permission_name);


--
-- TOC entry 5277 (class 2606 OID 16982)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5279 (class 2606 OID 16984)
-- Name: user_roles user_roles_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- TOC entry 5765 (class 2606 OID 19764)
-- Name: user_shipping_addresses user_shipping_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shipping_addresses
    ADD CONSTRAINT user_shipping_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5261 (class 2606 OID 16943)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5263 (class 2606 OID 16941)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 16945)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5753 (class 2606 OID 19695)
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5755 (class 2606 OID 19697)
-- Name: wishlist_items wishlist_items_user_id_book_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_book_id_key UNIQUE (user_id, book_id);


--
-- TOC entry 5628 (class 1259 OID 19167)
-- Name: idx_about_us_sections_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_about_us_sections_order ON public.about_us_sections USING btree (order_index);


--
-- TOC entry 5629 (class 1259 OID 19166)
-- Name: idx_about_us_sections_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_about_us_sections_type ON public.about_us_sections USING btree (section_type);


--
-- TOC entry 5293 (class 1259 OID 17065)
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- TOC entry 5294 (class 1259 OID 17064)
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- TOC entry 5310 (class 1259 OID 17845)
-- Name: idx_authors_is_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authors_is_verified ON public.authors USING btree (is_verified);


--
-- TOC entry 5311 (class 1259 OID 17844)
-- Name: idx_authors_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_authors_status ON public.authors USING btree (status);


--
-- TOC entry 5717 (class 1259 OID 19506)
-- Name: idx_bank_accounts_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_is_active ON public.bank_accounts USING btree (is_active);


--
-- TOC entry 5718 (class 1259 OID 19507)
-- Name: idx_bank_accounts_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_accounts_is_default ON public.bank_accounts USING btree (is_default);


--
-- TOC entry 5721 (class 1259 OID 19509)
-- Name: idx_bank_transfer_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_notifications_is_read ON public.bank_transfer_notifications USING btree (is_read);


--
-- TOC entry 5722 (class 1259 OID 19508)
-- Name: idx_bank_transfer_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_notifications_user_id ON public.bank_transfer_notifications USING btree (user_id);


--
-- TOC entry 5517 (class 1259 OID 18463)
-- Name: idx_bank_transfer_payments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_created_at ON public.bank_transfer_payments USING btree (created_at);


--
-- TOC entry 5518 (class 1259 OID 18460)
-- Name: idx_bank_transfer_payments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_order_id ON public.bank_transfer_payments USING btree (order_id);


--
-- TOC entry 5519 (class 1259 OID 18461)
-- Name: idx_bank_transfer_payments_reference_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_reference_number ON public.bank_transfer_payments USING btree (reference_number);


--
-- TOC entry 5520 (class 1259 OID 18462)
-- Name: idx_bank_transfer_payments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_status ON public.bank_transfer_payments USING btree (status);


--
-- TOC entry 5521 (class 1259 OID 18458)
-- Name: idx_bank_transfer_payments_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_transaction_id ON public.bank_transfer_payments USING btree (transaction_id);


--
-- TOC entry 5522 (class 1259 OID 18459)
-- Name: idx_bank_transfer_payments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfer_payments_user_id ON public.bank_transfer_payments USING btree (user_id);


--
-- TOC entry 5710 (class 1259 OID 19505)
-- Name: idx_bank_transfers_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfers_expires_at ON public.bank_transfers USING btree (expires_at);


--
-- TOC entry 5711 (class 1259 OID 19501)
-- Name: idx_bank_transfers_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfers_order_id ON public.bank_transfers USING btree (order_id);


--
-- TOC entry 5712 (class 1259 OID 19503)
-- Name: idx_bank_transfers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfers_status ON public.bank_transfers USING btree (status);


--
-- TOC entry 5713 (class 1259 OID 19504)
-- Name: idx_bank_transfers_transaction_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfers_transaction_reference ON public.bank_transfers USING btree (transaction_reference);


--
-- TOC entry 5714 (class 1259 OID 19502)
-- Name: idx_bank_transfers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bank_transfers_user_id ON public.bank_transfers USING btree (user_id);


--
-- TOC entry 5451 (class 1259 OID 18152)
-- Name: idx_blog_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comments_post_id ON public.blog_comments USING btree (post_id);


--
-- TOC entry 5452 (class 1259 OID 18153)
-- Name: idx_blog_comments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_comments_status ON public.blog_comments USING btree (status);


--
-- TOC entry 5448 (class 1259 OID 18151)
-- Name: idx_blog_images_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_images_post_id ON public.blog_images USING btree (post_id);


--
-- TOC entry 5457 (class 1259 OID 18154)
-- Name: idx_blog_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_likes_post_id ON public.blog_likes USING btree (post_id);


--
-- TOC entry 5434 (class 1259 OID 18150)
-- Name: idx_blog_posts_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_author_id ON public.blog_posts USING btree (author_id);


--
-- TOC entry 5435 (class 1259 OID 18147)
-- Name: idx_blog_posts_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_category ON public.blog_posts USING btree (category);


--
-- TOC entry 5436 (class 1259 OID 18148)
-- Name: idx_blog_posts_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_featured ON public.blog_posts USING btree (featured);


--
-- TOC entry 5437 (class 1259 OID 18149)
-- Name: idx_blog_posts_published_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_published_at ON public.blog_posts USING btree (published_at);


--
-- TOC entry 5438 (class 1259 OID 18145)
-- Name: idx_blog_posts_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- TOC entry 5439 (class 1259 OID 18146)
-- Name: idx_blog_posts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);


--
-- TOC entry 5460 (class 1259 OID 18155)
-- Name: idx_blog_views_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blog_views_post_id ON public.blog_views USING btree (post_id);


--
-- TOC entry 5342 (class 1259 OID 17829)
-- Name: idx_book_reviews_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_reviews_book_id ON public.book_reviews USING btree (book_id);


--
-- TOC entry 5343 (class 1259 OID 17831)
-- Name: idx_book_reviews_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_reviews_rating ON public.book_reviews USING btree (rating);


--
-- TOC entry 5344 (class 1259 OID 17830)
-- Name: idx_book_reviews_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_reviews_user_id ON public.book_reviews USING btree (user_id);


--
-- TOC entry 5316 (class 1259 OID 17813)
-- Name: idx_books_author_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_author_id ON public.books USING btree (author_id);


--
-- TOC entry 5317 (class 1259 OID 17812)
-- Name: idx_books_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_category_id ON public.books USING btree (category_id);


--
-- TOC entry 5318 (class 1259 OID 17816)
-- Name: idx_books_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_created_at ON public.books USING btree (created_at);


--
-- TOC entry 5319 (class 1259 OID 18992)
-- Name: idx_books_delivery_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_delivery_type ON public.books USING btree (delivery_type);


--
-- TOC entry 5320 (class 1259 OID 18998)
-- Name: idx_books_format; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_format ON public.books USING btree (format);


--
-- TOC entry 5321 (class 1259 OID 19182)
-- Name: idx_books_inventory_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_inventory_enabled ON public.books USING btree (inventory_enabled);


--
-- TOC entry 5322 (class 1259 OID 17818)
-- Name: idx_books_is_bestseller; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_bestseller ON public.books USING btree (is_bestseller);


--
-- TOC entry 5323 (class 1259 OID 18990)
-- Name: idx_books_is_digital; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_digital ON public.books USING btree (is_digital);


--
-- TOC entry 5324 (class 1259 OID 17817)
-- Name: idx_books_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_featured ON public.books USING btree (is_featured);


--
-- TOC entry 5325 (class 1259 OID 17819)
-- Name: idx_books_is_new_release; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_new_release ON public.books USING btree (is_new_release);


--
-- TOC entry 5326 (class 1259 OID 18991)
-- Name: idx_books_is_physical; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_is_physical ON public.books USING btree (is_physical);


--
-- TOC entry 5327 (class 1259 OID 18657)
-- Name: idx_books_isbn; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);


--
-- TOC entry 5328 (class 1259 OID 17815)
-- Name: idx_books_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_price ON public.books USING btree (price);


--
-- TOC entry 5329 (class 1259 OID 17814)
-- Name: idx_books_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_status ON public.books USING btree (status);


--
-- TOC entry 5330 (class 1259 OID 17839)
-- Name: idx_books_stock_quantity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_stock_quantity ON public.books USING btree (stock_quantity);


--
-- TOC entry 5331 (class 1259 OID 19183)
-- Name: idx_books_unlimited_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_unlimited_stock ON public.books USING btree (unlimited_stock);


--
-- TOC entry 5349 (class 1259 OID 17840)
-- Name: idx_cart_items_added_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_added_at ON public.cart_items USING btree (created_at);


--
-- TOC entry 5350 (class 1259 OID 17828)
-- Name: idx_cart_items_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_book_id ON public.cart_items USING btree (book_id);


--
-- TOC entry 5351 (class 1259 OID 17841)
-- Name: idx_cart_items_user_book; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_book ON public.cart_items USING btree (user_id, book_id);


--
-- TOC entry 5352 (class 1259 OID 17827)
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- TOC entry 5304 (class 1259 OID 17843)
-- Name: idx_categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_is_active ON public.categories USING btree (is_active);


--
-- TOC entry 5305 (class 1259 OID 17842)
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- TOC entry 5638 (class 1259 OID 19171)
-- Name: idx_company_stats_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_stats_order ON public.company_stats USING btree (order_index);


--
-- TOC entry 5635 (class 1259 OID 19170)
-- Name: idx_company_values_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_company_values_order ON public.company_values USING btree (order_index);


--
-- TOC entry 5644 (class 1259 OID 19173)
-- Name: idx_contact_faqs_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_faqs_order ON public.contact_faqs USING btree (order_index);


--
-- TOC entry 5641 (class 1259 OID 19172)
-- Name: idx_contact_methods_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_methods_order ON public.contact_methods USING btree (order_index);


--
-- TOC entry 5647 (class 1259 OID 19174)
-- Name: idx_contact_subjects_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_subjects_order ON public.contact_subjects USING btree (order_index);


--
-- TOC entry 5673 (class 1259 OID 19326)
-- Name: idx_contact_submissions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions USING btree (created_at);


--
-- TOC entry 5674 (class 1259 OID 19325)
-- Name: idx_contact_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_submissions_status ON public.contact_submissions USING btree (status);


--
-- TOC entry 5663 (class 1259 OID 19321)
-- Name: idx_content_blocks_section_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_blocks_section_id ON public.content_blocks USING btree (section_id);


--
-- TOC entry 5664 (class 1259 OID 19322)
-- Name: idx_content_blocks_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_blocks_type ON public.content_blocks USING btree (block_type);


--
-- TOC entry 5667 (class 1259 OID 19323)
-- Name: idx_content_images_block_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_images_block_id ON public.content_images USING btree (block_id);


--
-- TOC entry 5654 (class 1259 OID 19318)
-- Name: idx_content_pages_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_pages_key ON public.content_pages USING btree (page_key);


--
-- TOC entry 5659 (class 1259 OID 19320)
-- Name: idx_content_sections_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_sections_key ON public.content_sections USING btree (section_key);


--
-- TOC entry 5660 (class 1259 OID 19319)
-- Name: idx_content_sections_page_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_sections_page_id ON public.content_sections USING btree (page_id);


--
-- TOC entry 5670 (class 1259 OID 19324)
-- Name: idx_content_versions_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_versions_content_id ON public.content_versions USING btree (content_id);


--
-- TOC entry 5477 (class 1259 OID 18226)
-- Name: idx_email_function_assignments_function_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_function_assignments_function_id ON public.email_function_assignments USING btree (function_id);


--
-- TOC entry 5478 (class 1259 OID 18227)
-- Name: idx_email_function_assignments_template_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_function_assignments_template_id ON public.email_function_assignments USING btree (template_id);


--
-- TOC entry 5471 (class 1259 OID 18225)
-- Name: idx_email_functions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_functions_category ON public.email_functions USING btree (category);


--
-- TOC entry 5472 (class 1259 OID 18224)
-- Name: idx_email_functions_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_functions_slug ON public.email_functions USING btree (slug);


--
-- TOC entry 5396 (class 1259 OID 18181)
-- Name: idx_email_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_templates_active ON public.email_templates USING btree (is_active);


--
-- TOC entry 5397 (class 1259 OID 18180)
-- Name: idx_email_templates_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_templates_category ON public.email_templates USING btree (category);


--
-- TOC entry 5398 (class 1259 OID 18179)
-- Name: idx_email_templates_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_templates_slug ON public.email_templates USING btree (slug);


--
-- TOC entry 5681 (class 1259 OID 19328)
-- Name: idx_faqs_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faqs_active ON public.faqs USING btree (is_active);


--
-- TOC entry 5682 (class 1259 OID 19327)
-- Name: idx_faqs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faqs_category ON public.faqs USING btree (category);


--
-- TOC entry 5747 (class 1259 OID 19729)
-- Name: idx_inventory_transactions_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_book_id ON public.inventory_transactions USING btree (book_id);


--
-- TOC entry 5748 (class 1259 OID 19770)
-- Name: idx_inventory_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_created_at ON public.inventory_transactions USING btree (created_at);


--
-- TOC entry 5560 (class 1259 OID 18647)
-- Name: idx_note_tags_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_note_tags_user ON public.note_tags USING btree (user_id);


--
-- TOC entry 5573 (class 1259 OID 18703)
-- Name: idx_notes_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_book_id ON public.notes USING btree (book_id);


--
-- TOC entry 5574 (class 1259 OID 18704)
-- Name: idx_notes_note_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_note_type ON public.notes USING btree (note_type);


--
-- TOC entry 5575 (class 1259 OID 18702)
-- Name: idx_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_user_id ON public.notes USING btree (user_id);


--
-- TOC entry 5365 (class 1259 OID 17826)
-- Name: idx_order_items_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_book_id ON public.order_items USING btree (book_id);


--
-- TOC entry 5366 (class 1259 OID 19000)
-- Name: idx_order_items_format; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_format ON public.order_items USING btree (format);


--
-- TOC entry 5367 (class 1259 OID 17825)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 5408 (class 1259 OID 18654)
-- Name: idx_order_notes_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_created_at ON public.order_notes USING btree (created_at);


--
-- TOC entry 5409 (class 1259 OID 18653)
-- Name: idx_order_notes_is_internal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_is_internal ON public.order_notes USING btree (is_internal);


--
-- TOC entry 5410 (class 1259 OID 18651)
-- Name: idx_order_notes_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_order_id ON public.order_notes USING btree (order_id);


--
-- TOC entry 5411 (class 1259 OID 18652)
-- Name: idx_order_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_notes_user_id ON public.order_notes USING btree (user_id);


--
-- TOC entry 5403 (class 1259 OID 17890)
-- Name: idx_order_status_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_history_created_at ON public.order_status_history USING btree (created_at);


--
-- TOC entry 5404 (class 1259 OID 17888)
-- Name: idx_order_status_history_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);


--
-- TOC entry 5405 (class 1259 OID 17889)
-- Name: idx_order_status_history_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_history_status ON public.order_status_history USING btree (status);


--
-- TOC entry 5353 (class 1259 OID 17823)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- TOC entry 5354 (class 1259 OID 17824)
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- TOC entry 5355 (class 1259 OID 18989)
-- Name: idx_orders_order_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_type ON public.orders USING btree (order_type);


--
-- TOC entry 5356 (class 1259 OID 18999)
-- Name: idx_orders_payment_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_payment_method ON public.orders USING btree (payment_method);


--
-- TOC entry 5357 (class 1259 OID 17822)
-- Name: idx_orders_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);


--
-- TOC entry 5358 (class 1259 OID 19749)
-- Name: idx_orders_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_shipping_method_id ON public.orders USING btree (shipping_method_id);


--
-- TOC entry 5359 (class 1259 OID 17821)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5360 (class 1259 OID 17820)
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- TOC entry 5584 (class 1259 OID 18937)
-- Name: idx_payment_analytics_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_date ON public.payment_analytics USING btree (date);


--
-- TOC entry 5585 (class 1259 OID 18936)
-- Name: idx_payment_analytics_gateway_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_analytics_gateway_date ON public.payment_analytics USING btree (gateway_type, date);


--
-- TOC entry 5597 (class 1259 OID 18943)
-- Name: idx_payment_gateway_tests_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateway_tests_created_at ON public.payment_gateway_tests USING btree (created_at);


--
-- TOC entry 5598 (class 1259 OID 18941)
-- Name: idx_payment_gateway_tests_gateway_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateway_tests_gateway_type ON public.payment_gateway_tests USING btree (gateway_type);


--
-- TOC entry 5599 (class 1259 OID 18942)
-- Name: idx_payment_gateway_tests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateway_tests_status ON public.payment_gateway_tests USING btree (status);


--
-- TOC entry 5504 (class 1259 OID 18452)
-- Name: idx_payment_gateways_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateways_enabled ON public.payment_gateways USING btree (enabled);


--
-- TOC entry 5505 (class 1259 OID 18451)
-- Name: idx_payment_gateways_gateway_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateways_gateway_id ON public.payment_gateways USING btree (gateway_id);


--
-- TOC entry 5506 (class 1259 OID 19752)
-- Name: idx_payment_gateways_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_gateways_status ON public.payment_gateways USING btree (status);


--
-- TOC entry 5602 (class 1259 OID 18945)
-- Name: idx_payment_method_preferences_preferred; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_method_preferences_preferred ON public.payment_method_preferences USING btree (is_preferred);


--
-- TOC entry 5603 (class 1259 OID 18944)
-- Name: idx_payment_method_preferences_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_method_preferences_user_id ON public.payment_method_preferences USING btree (user_id);


--
-- TOC entry 5723 (class 1259 OID 19534)
-- Name: idx_payment_proofs_bank_transfer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_proofs_bank_transfer_id ON public.payment_proofs USING btree (bank_transfer_id);


--
-- TOC entry 5724 (class 1259 OID 19774)
-- Name: idx_payment_proofs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_proofs_status ON public.payment_proofs USING btree (status);


--
-- TOC entry 5725 (class 1259 OID 19535)
-- Name: idx_payment_proofs_upload_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_proofs_upload_date ON public.payment_proofs USING btree (upload_date);


--
-- TOC entry 5590 (class 1259 OID 18939)
-- Name: idx_payment_refunds_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_refunds_order_id ON public.payment_refunds USING btree (order_id);


--
-- TOC entry 5591 (class 1259 OID 18940)
-- Name: idx_payment_refunds_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_refunds_status ON public.payment_refunds USING btree (status);


--
-- TOC entry 5592 (class 1259 OID 18938)
-- Name: idx_payment_refunds_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_refunds_transaction_id ON public.payment_refunds USING btree (transaction_id);


--
-- TOC entry 5608 (class 1259 OID 18978)
-- Name: idx_payment_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions USING btree (created_at);


--
-- TOC entry 5609 (class 1259 OID 18976)
-- Name: idx_payment_transactions_gateway_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_gateway_type ON public.payment_transactions USING btree (gateway_type);


--
-- TOC entry 5610 (class 1259 OID 18974)
-- Name: idx_payment_transactions_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions USING btree (order_id);


--
-- TOC entry 5611 (class 1259 OID 18977)
-- Name: idx_payment_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions USING btree (status);


--
-- TOC entry 5612 (class 1259 OID 18979)
-- Name: idx_payment_transactions_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_transaction_id ON public.payment_transactions USING btree (transaction_id);


--
-- TOC entry 5613 (class 1259 OID 18975)
-- Name: idx_payment_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions USING btree (user_id);


--
-- TOC entry 5414 (class 1259 OID 18935)
-- Name: idx_payment_webhooks_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_webhooks_created_at ON public.payment_webhooks USING btree (created_at);


--
-- TOC entry 5415 (class 1259 OID 19175)
-- Name: idx_payment_webhooks_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_webhooks_event_id ON public.payment_webhooks USING btree (event_id);


--
-- TOC entry 5416 (class 1259 OID 17989)
-- Name: idx_payment_webhooks_gateway_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_webhooks_gateway_id ON public.payment_webhooks USING btree (gateway_id);


--
-- TOC entry 5417 (class 1259 OID 17990)
-- Name: idx_payment_webhooks_processed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_webhooks_processed ON public.payment_webhooks USING btree (processed);


--
-- TOC entry 5545 (class 1259 OID 18548)
-- Name: idx_public_pages_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_pages_type ON public.public_pages USING btree (page_type);


--
-- TOC entry 5699 (class 1259 OID 19434)
-- Name: idx_reading_goal_progress_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goal_progress_date ON public.reading_goal_progress USING btree (date);


--
-- TOC entry 5700 (class 1259 OID 19432)
-- Name: idx_reading_goal_progress_goal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goal_progress_goal_id ON public.reading_goal_progress USING btree (goal_id);


--
-- TOC entry 5701 (class 1259 OID 19433)
-- Name: idx_reading_goal_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goal_progress_user_id ON public.reading_goal_progress USING btree (user_id);


--
-- TOC entry 5479 (class 1259 OID 19431)
-- Name: idx_reading_goals_end_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goals_end_date ON public.reading_goals USING btree (end_date);


--
-- TOC entry 5480 (class 1259 OID 18303)
-- Name: idx_reading_goals_goal_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goals_goal_type ON public.reading_goals USING btree (goal_type);


--
-- TOC entry 5481 (class 1259 OID 18304)
-- Name: idx_reading_goals_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goals_is_active ON public.reading_goals USING btree (is_active);


--
-- TOC entry 5482 (class 1259 OID 19430)
-- Name: idx_reading_goals_start_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goals_start_date ON public.reading_goals USING btree (start_date);


--
-- TOC entry 5483 (class 1259 OID 18302)
-- Name: idx_reading_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_goals_user_id ON public.reading_goals USING btree (user_id);


--
-- TOC entry 5683 (class 1259 OID 19380)
-- Name: idx_reading_highlights_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_highlights_book_id ON public.reading_highlights USING btree (book_id);


--
-- TOC entry 5684 (class 1259 OID 19381)
-- Name: idx_reading_highlights_page_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_highlights_page_number ON public.reading_highlights USING btree (page_number);


--
-- TOC entry 5685 (class 1259 OID 19379)
-- Name: idx_reading_highlights_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_highlights_user_id ON public.reading_highlights USING btree (user_id);


--
-- TOC entry 5550 (class 1259 OID 19383)
-- Name: idx_reading_notes_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_book_id ON public.reading_notes USING btree (book_id);


--
-- TOC entry 5551 (class 1259 OID 18645)
-- Name: idx_reading_notes_page; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_page ON public.reading_notes USING btree (book_id, page_number);


--
-- TOC entry 5552 (class 1259 OID 19384)
-- Name: idx_reading_notes_page_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_page_number ON public.reading_notes USING btree (page_number);


--
-- TOC entry 5553 (class 1259 OID 18646)
-- Name: idx_reading_notes_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_type ON public.reading_notes USING btree (note_type);


--
-- TOC entry 5554 (class 1259 OID 18644)
-- Name: idx_reading_notes_user_book; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_user_book ON public.reading_notes USING btree (user_id, book_id);


--
-- TOC entry 5555 (class 1259 OID 19382)
-- Name: idx_reading_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_notes_user_id ON public.reading_notes USING btree (user_id);


--
-- TOC entry 5374 (class 1259 OID 17835)
-- Name: idx_reading_progress_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_progress_book_id ON public.reading_progress USING btree (book_id);


--
-- TOC entry 5375 (class 1259 OID 17834)
-- Name: idx_reading_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_progress_user_id ON public.reading_progress USING btree (user_id);


--
-- TOC entry 5688 (class 1259 OID 19386)
-- Name: idx_reading_sessions_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_sessions_book_id ON public.reading_sessions USING btree (book_id);


--
-- TOC entry 5689 (class 1259 OID 19387)
-- Name: idx_reading_sessions_session_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_sessions_session_start ON public.reading_sessions USING btree (session_start);


--
-- TOC entry 5690 (class 1259 OID 19385)
-- Name: idx_reading_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_sessions_user_id ON public.reading_sessions USING btree (user_id);


--
-- TOC entry 5744 (class 1259 OID 19728)
-- Name: idx_reading_speed_tracking_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_speed_tracking_user_id ON public.reading_speed_tracking USING btree (user_id);


--
-- TOC entry 5693 (class 1259 OID 19429)
-- Name: idx_reading_streaks_last_read_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_streaks_last_read_date ON public.reading_streaks USING btree (last_read_date);


--
-- TOC entry 5694 (class 1259 OID 19428)
-- Name: idx_reading_streaks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reading_streaks_user_id ON public.reading_streaks USING btree (user_id);


--
-- TOC entry 5280 (class 1259 OID 17062)
-- Name: idx_role_permissions_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);


--
-- TOC entry 5281 (class 1259 OID 17061)
-- Name: idx_role_permissions_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


--
-- TOC entry 5422 (class 1259 OID 18012)
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);


--
-- TOC entry 5423 (class 1259 OID 18013)
-- Name: idx_sessions_last_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_last_activity ON public.sessions USING btree (last_activity);


--
-- TOC entry 5424 (class 1259 OID 18010)
-- Name: idx_sessions_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_token ON public.sessions USING btree (session_token);


--
-- TOC entry 5425 (class 1259 OID 18011)
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);


--
-- TOC entry 5618 (class 1259 OID 19043)
-- Name: idx_shipping_details_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_details_order_id ON public.shipping_details USING btree (order_id);


--
-- TOC entry 5619 (class 1259 OID 19044)
-- Name: idx_shipping_details_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_details_status ON public.shipping_details USING btree (status);


--
-- TOC entry 5766 (class 1259 OID 19809)
-- Name: idx_shipping_method_zones_method; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_method_zones_method ON public.shipping_method_zones USING btree (shipping_method_id);


--
-- TOC entry 5767 (class 1259 OID 19810)
-- Name: idx_shipping_method_zones_zone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_method_zones_zone ON public.shipping_method_zones USING btree (shipping_zone_id);


--
-- TOC entry 5386 (class 1259 OID 19804)
-- Name: idx_shipping_methods_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_methods_active ON public.shipping_methods USING btree (is_active);


--
-- TOC entry 5387 (class 1259 OID 19805)
-- Name: idx_shipping_methods_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_methods_sort ON public.shipping_methods USING btree (sort_order);


--
-- TOC entry 5531 (class 1259 OID 18505)
-- Name: idx_shipping_rates_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_rates_is_active ON public.shipping_rates USING btree (is_active);


--
-- TOC entry 5532 (class 1259 OID 18504)
-- Name: idx_shipping_rates_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_rates_method_id ON public.shipping_rates USING btree (method_id);


--
-- TOC entry 5533 (class 1259 OID 18507)
-- Name: idx_shipping_rates_order_value_range; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_rates_order_value_range ON public.shipping_rates USING btree (min_order_value, max_order_value);


--
-- TOC entry 5534 (class 1259 OID 18503)
-- Name: idx_shipping_rates_zone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_rates_zone_id ON public.shipping_rates USING btree (zone_id);


--
-- TOC entry 5527 (class 1259 OID 19806)
-- Name: idx_shipping_zones_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_zones_active ON public.shipping_zones USING btree (is_active);


--
-- TOC entry 5528 (class 1259 OID 18502)
-- Name: idx_shipping_zones_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shipping_zones_is_active ON public.shipping_zones USING btree (is_active);


--
-- TOC entry 5295 (class 1259 OID 17079)
-- Name: idx_system_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (setting_key);


--
-- TOC entry 5630 (class 1259 OID 19168)
-- Name: idx_team_members_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_team_members_order ON public.team_members USING btree (order_index);


--
-- TOC entry 5499 (class 1259 OID 18313)
-- Name: idx_user_achievements_achievement_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_achievement_type ON public.user_achievements USING btree (achievement_type);


--
-- TOC entry 5500 (class 1259 OID 18314)
-- Name: idx_user_achievements_earned_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_earned_at ON public.user_achievements USING btree (earned_at);


--
-- TOC entry 5501 (class 1259 OID 18312)
-- Name: idx_user_achievements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id);


--
-- TOC entry 5488 (class 1259 OID 18306)
-- Name: idx_user_activity_activity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_activity_type ON public.user_activity USING btree (activity_type);


--
-- TOC entry 5489 (class 1259 OID 18307)
-- Name: idx_user_activity_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_created_at ON public.user_activity USING btree (created_at);


--
-- TOC entry 5490 (class 1259 OID 18305)
-- Name: idx_user_activity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_activity_user_id ON public.user_activity USING btree (user_id);


--
-- TOC entry 5730 (class 1259 OID 19723)
-- Name: idx_user_bookmarks_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_bookmarks_book_id ON public.user_bookmarks USING btree (book_id);


--
-- TOC entry 5731 (class 1259 OID 19722)
-- Name: idx_user_bookmarks_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_bookmarks_user_id ON public.user_bookmarks USING btree (user_id);


--
-- TOC entry 5740 (class 1259 OID 19727)
-- Name: idx_user_highlights_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_highlights_book_id ON public.user_highlights USING btree (book_id);


--
-- TOC entry 5741 (class 1259 OID 19726)
-- Name: idx_user_highlights_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_highlights_user_id ON public.user_highlights USING btree (user_id);


--
-- TOC entry 5380 (class 1259 OID 17833)
-- Name: idx_user_library_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_library_book_id ON public.user_library USING btree (book_id);


--
-- TOC entry 5381 (class 1259 OID 17832)
-- Name: idx_user_library_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_library_user_id ON public.user_library USING btree (user_id);


--
-- TOC entry 5736 (class 1259 OID 19725)
-- Name: idx_user_notes_book_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notes_book_id ON public.user_notes USING btree (book_id);


--
-- TOC entry 5578 (class 1259 OID 18705)
-- Name: idx_user_notes_tags_note_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notes_tags_note_id ON public.user_notes_tags USING btree (note_id);


--
-- TOC entry 5579 (class 1259 OID 18706)
-- Name: idx_user_notes_tags_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notes_tags_tag_id ON public.user_notes_tags USING btree (tag_id);


--
-- TOC entry 5737 (class 1259 OID 19724)
-- Name: idx_user_notes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notes_user_id ON public.user_notes USING btree (user_id);


--
-- TOC entry 5493 (class 1259 OID 18311)
-- Name: idx_user_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_created_at ON public.user_notifications USING btree (created_at);


--
-- TOC entry 5494 (class 1259 OID 18310)
-- Name: idx_user_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_is_read ON public.user_notifications USING btree (is_read);


--
-- TOC entry 5495 (class 1259 OID 18309)
-- Name: idx_user_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_type ON public.user_notifications USING btree (type);


--
-- TOC entry 5496 (class 1259 OID 18308)
-- Name: idx_user_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_user_id ON public.user_notifications USING btree (user_id);


--
-- TOC entry 5286 (class 1259 OID 17063)
-- Name: idx_user_permission_cache_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_permission_cache_user_id ON public.user_permission_cache USING btree (user_id);


--
-- TOC entry 5274 (class 1259 OID 17060)
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);


--
-- TOC entry 5275 (class 1259 OID 17059)
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- TOC entry 5762 (class 1259 OID 19808)
-- Name: idx_user_shipping_addresses_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_shipping_addresses_default ON public.user_shipping_addresses USING btree (user_id, is_default);


--
-- TOC entry 5763 (class 1259 OID 19807)
-- Name: idx_user_shipping_addresses_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_shipping_addresses_user ON public.user_shipping_addresses USING btree (user_id);


--
-- TOC entry 5252 (class 1259 OID 19333)
-- Name: idx_users_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_course ON public.users USING btree (course);


--
-- TOC entry 5253 (class 1259 OID 19334)
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department ON public.users USING btree (department);


--
-- TOC entry 5254 (class 1259 OID 17056)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5255 (class 1259 OID 19331)
-- Name: idx_users_is_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_is_student ON public.users USING btree (is_student);


--
-- TOC entry 5256 (class 1259 OID 19332)
-- Name: idx_users_matriculation_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_matriculation_number ON public.users USING btree (matriculation_number);


--
-- TOC entry 5257 (class 1259 OID 19335)
-- Name: idx_users_school_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_school_name ON public.users USING btree (school_name);


--
-- TOC entry 5258 (class 1259 OID 17058)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 5259 (class 1259 OID 17057)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 5751 (class 1259 OID 19730)
-- Name: idx_wishlist_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items USING btree (user_id);


--
-- TOC entry 5888 (class 2620 OID 19512)
-- Name: bank_accounts update_bank_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5887 (class 2620 OID 19511)
-- Name: bank_transfers update_bank_transfers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bank_transfers_updated_at BEFORE UPDATE ON public.bank_transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5884 (class 2620 OID 18159)
-- Name: blog_comments update_blog_comment_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_comment_count_trigger AFTER INSERT OR DELETE ON public.blog_comments FOR EACH ROW EXECUTE FUNCTION public.update_blog_comment_count();


--
-- TOC entry 5885 (class 2620 OID 18161)
-- Name: blog_likes update_blog_like_count_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_like_count_trigger AFTER INSERT OR DELETE ON public.blog_likes FOR EACH ROW EXECUTE FUNCTION public.update_blog_like_count();


--
-- TOC entry 5883 (class 2620 OID 18157)
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_posts_updated_at();


--
-- TOC entry 5886 (class 2620 OID 18229)
-- Name: email_function_assignments update_email_function_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_function_assignments_updated_at BEFORE UPDATE ON public.email_function_assignments FOR EACH ROW EXECUTE FUNCTION public.update_email_function_assignments_updated_at();


--
-- TOC entry 5889 (class 2620 OID 19777)
-- Name: payment_proofs update_payment_proofs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_payment_proofs_updated_at BEFORE UPDATE ON public.payment_proofs FOR EACH ROW EXECUTE FUNCTION public.update_payment_proofs_updated_at();


--
-- TOC entry 5781 (class 2606 OID 19049)
-- Name: audit_logs audit_logs_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id);


--
-- TOC entry 5782 (class 2606 OID 17051)
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5860 (class 2606 OID 19491)
-- Name: bank_transfer_notifications bank_transfer_notifications_bank_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_notifications
    ADD CONSTRAINT bank_transfer_notifications_bank_transfer_id_fkey FOREIGN KEY (bank_transfer_id) REFERENCES public.bank_transfers(id) ON DELETE CASCADE;


--
-- TOC entry 5861 (class 2606 OID 19496)
-- Name: bank_transfer_notifications bank_transfer_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_notifications
    ADD CONSTRAINT bank_transfer_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5823 (class 2606 OID 18428)
-- Name: bank_transfer_payments bank_transfer_payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5824 (class 2606 OID 18423)
-- Name: bank_transfer_payments bank_transfer_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5825 (class 2606 OID 18433)
-- Name: bank_transfer_payments bank_transfer_payments_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_payments
    ADD CONSTRAINT bank_transfer_payments_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- TOC entry 5864 (class 2606 OID 19550)
-- Name: bank_transfer_proofs bank_transfer_proofs_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_proofs
    ADD CONSTRAINT bank_transfer_proofs_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.payment_transactions(transaction_id);


--
-- TOC entry 5865 (class 2606 OID 19555)
-- Name: bank_transfer_proofs bank_transfer_proofs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfer_proofs
    ADD CONSTRAINT bank_transfer_proofs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5857 (class 2606 OID 19451)
-- Name: bank_transfers bank_transfers_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5858 (class 2606 OID 19456)
-- Name: bank_transfers bank_transfers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5859 (class 2606 OID 19461)
-- Name: bank_transfers bank_transfers_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bank_transfers
    ADD CONSTRAINT bank_transfers_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- TOC entry 5809 (class 2606 OID 18100)
-- Name: blog_comments blog_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.blog_comments(id) ON DELETE CASCADE;


--
-- TOC entry 5810 (class 2606 OID 18090)
-- Name: blog_comments blog_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5811 (class 2606 OID 18095)
-- Name: blog_comments blog_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5808 (class 2606 OID 18072)
-- Name: blog_images blog_images_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_images
    ADD CONSTRAINT blog_images_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5812 (class 2606 OID 18115)
-- Name: blog_likes blog_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5813 (class 2606 OID 18120)
-- Name: blog_likes blog_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_likes
    ADD CONSTRAINT blog_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5807 (class 2606 OID 18039)
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5814 (class 2606 OID 18135)
-- Name: blog_views blog_views_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_views
    ADD CONSTRAINT blog_views_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5815 (class 2606 OID 18140)
-- Name: blog_views blog_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_views
    ADD CONSTRAINT blog_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5788 (class 2606 OID 17573)
-- Name: book_reviews book_reviews_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_reviews
    ADD CONSTRAINT book_reviews_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5789 (class 2606 OID 17578)
-- Name: book_reviews book_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_reviews
    ADD CONSTRAINT book_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5786 (class 2606 OID 17545)
-- Name: book_tag_relations book_tag_relations_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tag_relations
    ADD CONSTRAINT book_tag_relations_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5787 (class 2606 OID 17550)
-- Name: book_tag_relations book_tag_relations_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_tag_relations
    ADD CONSTRAINT book_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.book_tags(id) ON DELETE CASCADE;


--
-- TOC entry 5784 (class 2606 OID 17519)
-- Name: books books_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id);


--
-- TOC entry 5785 (class 2606 OID 17524)
-- Name: books books_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 5790 (class 2606 OID 17600)
-- Name: cart_items cart_items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5791 (class 2606 OID 17595)
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5783 (class 2606 OID 17474)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- TOC entry 5849 (class 2606 OID 19283)
-- Name: contact_submissions contact_submissions_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- TOC entry 5846 (class 2606 OID 19231)
-- Name: content_blocks content_blocks_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_blocks
    ADD CONSTRAINT content_blocks_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.content_sections(id) ON DELETE CASCADE;


--
-- TOC entry 5847 (class 2606 OID 19248)
-- Name: content_images content_images_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_images
    ADD CONSTRAINT content_images_block_id_fkey FOREIGN KEY (block_id) REFERENCES public.content_blocks(id) ON DELETE CASCADE;


--
-- TOC entry 5845 (class 2606 OID 19213)
-- Name: content_sections content_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_sections
    ADD CONSTRAINT content_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.content_pages(id) ON DELETE CASCADE;


--
-- TOC entry 5848 (class 2606 OID 19263)
-- Name: content_versions content_versions_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_versions
    ADD CONSTRAINT content_versions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- TOC entry 5816 (class 2606 OID 18214)
-- Name: email_function_assignments email_function_assignments_function_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_function_assignments
    ADD CONSTRAINT email_function_assignments_function_id_fkey FOREIGN KEY (function_id) REFERENCES public.email_functions(id) ON DELETE CASCADE;


--
-- TOC entry 5817 (class 2606 OID 18219)
-- Name: email_function_assignments email_function_assignments_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_function_assignments
    ADD CONSTRAINT email_function_assignments_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id) ON DELETE CASCADE;


--
-- TOC entry 5882 (class 2606 OID 19827)
-- Name: email_retry_queue email_retry_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_retry_queue
    ADD CONSTRAINT email_retry_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5875 (class 2606 OID 19678)
-- Name: inventory_transactions inventory_transactions_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- TOC entry 5876 (class 2606 OID 19683)
-- Name: inventory_transactions inventory_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5828 (class 2606 OID 18529)
-- Name: nigerian_lgas nigerian_lgas_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nigerian_lgas
    ADD CONSTRAINT nigerian_lgas_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.nigerian_states(id) ON DELETE CASCADE;


--
-- TOC entry 5834 (class 2606 OID 18629)
-- Name: note_shares note_shares_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.reading_notes(id) ON DELETE CASCADE;


--
-- TOC entry 5835 (class 2606 OID 18634)
-- Name: note_shares note_shares_shared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5836 (class 2606 OID 18639)
-- Name: note_shares note_shares_shared_with_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_shares
    ADD CONSTRAINT note_shares_shared_with_fkey FOREIGN KEY (shared_with) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5832 (class 2606 OID 18607)
-- Name: note_tag_assignments note_tag_assignments_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tag_assignments
    ADD CONSTRAINT note_tag_assignments_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.reading_notes(id) ON DELETE CASCADE;


--
-- TOC entry 5833 (class 2606 OID 18612)
-- Name: note_tag_assignments note_tag_assignments_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tag_assignments
    ADD CONSTRAINT note_tag_assignments_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.note_tags(id) ON DELETE CASCADE;


--
-- TOC entry 5831 (class 2606 OID 18592)
-- Name: note_tags note_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.note_tags
    ADD CONSTRAINT note_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5837 (class 2606 OID 18677)
-- Name: notes notes_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5838 (class 2606 OID 18672)
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5795 (class 2606 OID 17647)
-- Name: order_items order_items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- TOC entry 5796 (class 2606 OID 17642)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5804 (class 2606 OID 17878)
-- Name: order_notes order_notes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5805 (class 2606 OID 17883)
-- Name: order_notes order_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_notes
    ADD CONSTRAINT order_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5802 (class 2606 OID 17861)
-- Name: order_status_history order_status_history_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5803 (class 2606 OID 17856)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5792 (class 2606 OID 19744)
-- Name: orders orders_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id);


--
-- TOC entry 5793 (class 2606 OID 19799)
-- Name: orders orders_shipping_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_zone_id_fkey FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id);


--
-- TOC entry 5794 (class 2606 OID 17626)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5842 (class 2606 OID 18930)
-- Name: payment_method_preferences payment_method_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_method_preferences
    ADD CONSTRAINT payment_method_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5862 (class 2606 OID 19524)
-- Name: payment_proofs payment_proofs_bank_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_bank_transfer_id_fkey FOREIGN KEY (bank_transfer_id) REFERENCES public.bank_transfers(id) ON DELETE CASCADE;


--
-- TOC entry 5863 (class 2606 OID 19529)
-- Name: payment_proofs payment_proofs_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- TOC entry 5841 (class 2606 OID 18900)
-- Name: payment_refunds payment_refunds_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_refunds
    ADD CONSTRAINT payment_refunds_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- TOC entry 5843 (class 2606 OID 18969)
-- Name: payment_transactions payment_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5855 (class 2606 OID 19418)
-- Name: reading_goal_progress reading_goal_progress_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goal_progress
    ADD CONSTRAINT reading_goal_progress_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.reading_goals(id) ON DELETE CASCADE;


--
-- TOC entry 5856 (class 2606 OID 19423)
-- Name: reading_goal_progress reading_goal_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goal_progress
    ADD CONSTRAINT reading_goal_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5818 (class 2606 OID 18244)
-- Name: reading_goals reading_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_goals
    ADD CONSTRAINT reading_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5850 (class 2606 OID 19353)
-- Name: reading_highlights reading_highlights_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_highlights
    ADD CONSTRAINT reading_highlights_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5851 (class 2606 OID 19348)
-- Name: reading_highlights reading_highlights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_highlights
    ADD CONSTRAINT reading_highlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5829 (class 2606 OID 18576)
-- Name: reading_notes reading_notes_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_notes
    ADD CONSTRAINT reading_notes_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5830 (class 2606 OID 18571)
-- Name: reading_notes reading_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_notes
    ADD CONSTRAINT reading_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5797 (class 2606 OID 17709)
-- Name: reading_progress reading_progress_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5798 (class 2606 OID 17704)
-- Name: reading_progress reading_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_progress
    ADD CONSTRAINT reading_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5852 (class 2606 OID 19374)
-- Name: reading_sessions reading_sessions_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5853 (class 2606 OID 19369)
-- Name: reading_sessions reading_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_sessions
    ADD CONSTRAINT reading_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5872 (class 2606 OID 19657)
-- Name: reading_speed_tracking reading_speed_tracking_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_speed_tracking
    ADD CONSTRAINT reading_speed_tracking_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5873 (class 2606 OID 19662)
-- Name: reading_speed_tracking reading_speed_tracking_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_speed_tracking
    ADD CONSTRAINT reading_speed_tracking_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.reading_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5874 (class 2606 OID 19652)
-- Name: reading_speed_tracking reading_speed_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_speed_tracking
    ADD CONSTRAINT reading_speed_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5854 (class 2606 OID 19402)
-- Name: reading_streaks reading_streaks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reading_streaks
    ADD CONSTRAINT reading_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5777 (class 2606 OID 17020)
-- Name: role_permissions role_permissions_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- TOC entry 5778 (class 2606 OID 17015)
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5779 (class 2606 OID 17010)
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5806 (class 2606 OID 18005)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5844 (class 2606 OID 19015)
-- Name: shipping_details shipping_details_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_details
    ADD CONSTRAINT shipping_details_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5880 (class 2606 OID 19789)
-- Name: shipping_method_zones shipping_method_zones_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_method_zones
    ADD CONSTRAINT shipping_method_zones_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(id) ON DELETE CASCADE;


--
-- TOC entry 5881 (class 2606 OID 19794)
-- Name: shipping_method_zones shipping_method_zones_shipping_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_method_zones
    ADD CONSTRAINT shipping_method_zones_shipping_zone_id_fkey FOREIGN KEY (shipping_zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- TOC entry 5826 (class 2606 OID 18497)
-- Name: shipping_rates shipping_rates_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.shipping_methods(id) ON DELETE CASCADE;


--
-- TOC entry 5827 (class 2606 OID 18492)
-- Name: shipping_rates shipping_rates_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(id) ON DELETE CASCADE;


--
-- TOC entry 5822 (class 2606 OID 18297)
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5819 (class 2606 OID 18265)
-- Name: user_activity user_activity_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE SET NULL;


--
-- TOC entry 5820 (class 2606 OID 18260)
-- Name: user_activity user_activity_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_activity
    ADD CONSTRAINT user_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5866 (class 2606 OID 19594)
-- Name: user_bookmarks user_bookmarks_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5867 (class 2606 OID 19589)
-- Name: user_bookmarks user_bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_bookmarks
    ADD CONSTRAINT user_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5870 (class 2606 OID 19639)
-- Name: user_highlights user_highlights_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_highlights
    ADD CONSTRAINT user_highlights_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5871 (class 2606 OID 19634)
-- Name: user_highlights user_highlights_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_highlights
    ADD CONSTRAINT user_highlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5799 (class 2606 OID 17731)
-- Name: user_library user_library_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5800 (class 2606 OID 17736)
-- Name: user_library user_library_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- TOC entry 5801 (class 2606 OID 17726)
-- Name: user_library user_library_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5868 (class 2606 OID 19617)
-- Name: user_notes user_notes_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5839 (class 2606 OID 18692)
-- Name: user_notes_tags user_notes_tags_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes_tags
    ADD CONSTRAINT user_notes_tags_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE;


--
-- TOC entry 5840 (class 2606 OID 18697)
-- Name: user_notes_tags user_notes_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes_tags
    ADD CONSTRAINT user_notes_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.note_tags(id) ON DELETE CASCADE;


--
-- TOC entry 5869 (class 2606 OID 19612)
-- Name: user_notes user_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5821 (class 2606 OID 18282)
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5780 (class 2606 OID 17036)
-- Name: user_permission_cache user_permission_cache_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_permission_cache
    ADD CONSTRAINT user_permission_cache_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5774 (class 2606 OID 16995)
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- TOC entry 5775 (class 2606 OID 16990)
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5776 (class 2606 OID 16985)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5879 (class 2606 OID 19765)
-- Name: user_shipping_addresses user_shipping_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_shipping_addresses
    ADD CONSTRAINT user_shipping_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5877 (class 2606 OID 19703)
-- Name: wishlist_items wishlist_items_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 5878 (class 2606 OID 19698)
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-08-13 02:38:56 WAT

--
-- PostgreSQL database dump complete
--


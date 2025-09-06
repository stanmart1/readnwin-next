UPDATE system_settings 
SET value = REPLACE(value, '"AI-Powered Recommendations",', ''),
    value = REPLACE(value, ',"AI-Powered Recommendations"', ''),
    value = REPLACE(value, '"AI-Powered Recommendations"', ''),
    updated_at = NOW()
WHERE key = 'about_page_content' 
AND value LIKE '%AI-Powered Recommendations%';
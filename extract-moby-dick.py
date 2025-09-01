#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path

def clean_html(content):
    # Remove XML declaration and namespace
    content = re.sub(r'<\?xml[^>]*\?>', '', content)
    content = re.sub(r'xmlns="[^"]*"', '', content)
    content = re.sub(r'lang="[^"]*"', '', content)
    
    # Remove Project Gutenberg boilerplate
    content = re.sub(r'<section class="pg-boilerplate[^>]*>.*?</section>', '', content, flags=re.DOTALL)
    content = re.sub(r'<div[^>]*id="pg-[^"]*"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
    
    # Clean up extra whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)
    
    return content.strip()

def extract_chapters():
    base_dir = Path('storage/books/143/extracted/OEBPS')
    chapters = []
    
    # Get all XHTML files
    xhtml_files = sorted([f for f in base_dir.glob('*.xhtml') if 'h-' in f.name])
    
    for i, file_path in enumerate(xhtml_files):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Clean the content
            cleaned = clean_html(content)
            
            # Extract title from content or use default
            title_match = re.search(r'<h[1-6][^>]*>([^<]+)</h[1-6]>', cleaned)
            if title_match:
                title = title_match.group(1).strip()
                # Clean up common patterns
                title = re.sub(r'CHAPTER \d+\.?\s*', 'Chapter ', title, flags=re.IGNORECASE)
                if not title.startswith('Chapter'):
                    title = f'Chapter {i+1} - {title}'
            else:
                title = f'Chapter {i+1}'
            
            chapters.append({
                'id': f'chapter-{i+1}',
                'title': title[:100],  # Limit title length
                'content': cleaned,
                'order': i+1
            })
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return chapters

def create_full_html(chapters):
    html_content = '''<!DOCTYPE html>
<html>
<head>
    <title>Moby Dick; Or, The Whale</title>
    <meta charset="utf-8">
    <meta name="author" content="Herman Melville">
    <style>
      body { font-family: serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
      .chapter { margin-bottom: 3em; page-break-before: auto; }
      .chapter-title { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5em; margin-bottom: 1em; }
      p { margin-bottom: 1em; text-align: justify; }
      h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; }
    </style>
</head>
<body>'''
    
    for chapter in chapters:
        html_content += f'''
    <div class="chapter" data-chapter-id="{chapter['id']}">
      <h2 class="chapter-title">{chapter['title']}</h2>
      {chapter['content']}
    </div>'''
    
    html_content += '''
</body>
</html>'''
    
    return html_content

def main():
    print("Extracting Moby Dick chapters...")
    chapters = extract_chapters()
    print(f"Extracted {len(chapters)} chapters")
    
    # Create full HTML
    full_html = create_full_html(chapters)
    
    # Write content.html
    with open('storage/books/143/content.html', 'w', encoding='utf-8') as f:
        f.write(full_html)
    
    # Create structure.json
    structure = {
        'type': 'epub',
        'chapters': [{'id': ch['id'], 'title': ch['title'], 'order': ch['order']} for ch in chapters]
    }
    
    with open('storage/books/143/structure.json', 'w', encoding='utf-8') as f:
        json.dump(structure, f, indent=2)
    
    print(f"✅ Created full Moby Dick content with {len(chapters)} chapters")
    print(f"Content length: {len(full_html)} characters")

if __name__ == '__main__':
    main()
/**
 * Fetches book cover from public domain sources
 */
export async function fetchBookCover(title: string): Promise<string | null> {
  try {
    // Clean title for search
    const cleanTitle = title.replace(/[^\w\s]/g, '').trim();
    
    // Try Open Library first
    const openLibraryUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=1`;
    const response = await fetch(openLibraryUrl);
    const data = await response.json();
    
    if (data.docs?.[0]?.cover_i) {
      return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
    }
    
    return null;
  } catch (error) {
    console.warn('Error fetching book cover:', error);
    return null;
  }
}
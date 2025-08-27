export class EbookContentLoader {
  static async loadBook(bookId: string, userId: string) {
    try {
      // Get book file info
      const fileInfoResponse = await fetch(`/api/books/${bookId}/file-info`);
      if (!fileInfoResponse.ok) {
        throw new Error('Failed to get book file information');
      }
      
      const fileInfo = await fileInfoResponse.json();
      
      // Load book content based on format
      if (fileInfo.fileFormat === 'epub') {
        return await this.loadEpubBook(bookId, fileInfo);
      } else if (fileInfo.fileFormat === 'html') {
        return await this.loadHtmlBook(bookId, fileInfo);
      } else {
        throw new Error(`Unsupported book format: ${fileInfo.fileFormat}`);
      }
    } catch (error) {
      throw new Error(`Failed to load book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async loadEpubBook(bookId: string, fileInfo: any) {
    const contentUrl = `/api/secure/books/${bookId}/${fileInfo.filename}`;
    
    return {
      id: bookId,
      title: fileInfo.bookMetadata.title,
      format: 'epub',
      contentUrl,
      metadata: {
        wordCount: fileInfo.bookMetadata.wordCount,
        estimatedReadingTime: fileInfo.bookMetadata.estimatedReadingTime,
        pages: fileInfo.bookMetadata.pages
      },
      chapters: [], // Will be loaded dynamically from EPUB
      loadContent: async () => {
        const response = await fetch(contentUrl);
        if (!response.ok) throw new Error('Failed to load EPUB content');
        return await response.arrayBuffer();
      }
    };
  }

  private static async loadHtmlBook(bookId: string, fileInfo: any) {
    const contentUrl = `/api/secure/books/${bookId}/${fileInfo.filename}`;
    
    return {
      id: bookId,
      title: fileInfo.bookMetadata.title,
      format: 'html',
      contentUrl,
      metadata: {
        wordCount: fileInfo.bookMetadata.wordCount,
        estimatedReadingTime: fileInfo.bookMetadata.estimatedReadingTime,
        pages: fileInfo.bookMetadata.pages
      },
      chapters: [], // Will be extracted from HTML structure
      loadContent: async () => {
        const response = await fetch(contentUrl);
        if (!response.ok) throw new Error('Failed to load HTML content');
        return await response.text();
      }
    };
  }

  static async getBookStructure(bookId: string) {
    try {
      const response = await fetch(`/api/books/${bookId}/structure`);
      if (!response.ok) return null;
      
      const structure = await response.json();
      return structure.chapters || [];
    } catch (error) {
      console.error('Failed to load book structure:', error);
      return [];
    }
  }
}
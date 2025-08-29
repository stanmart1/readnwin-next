interface FileInfo {
  filename: string;
  fileFormat: string;
  bookMetadata: {
    title: string;
    wordCount: number;
    estimatedReadingTime: number;
    pages: number;
  };
}

export class EbookContentLoader {
  static async loadBook(bookId: string, userId: string) {
    try {
      // Get book file info
      const fileInfoResponse = await fetch(`/api/books/${bookId}/file-info`);
      if (!fileInfoResponse.ok) {
        throw new Error(`Failed to get book file information: ${fileInfoResponse.status} ${fileInfoResponse.statusText}`);
      }
      
      const fileInfo: FileInfo = await fileInfoResponse.json();
      
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

  private static async loadEpubBook(bookId: string, fileInfo: FileInfo) {
    const contentUrl = `/api/ebooks/${bookId}/${fileInfo.filename}`;
    
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
      chapters: [{
        id: '1',
        chapter_number: 1,
        chapter_title: 'Chapter 1',
        content_html: '<p>Loading EPUB content...</p>',
        reading_time_minutes: Math.ceil(fileInfo.bookMetadata.estimatedReadingTime / 60)
      }],
      loadContent: async () => {
        const response = await fetch(contentUrl);
        if (!response.ok) throw new Error(`Failed to load EPUB content: ${response.status} ${response.statusText}`);
        return await response.arrayBuffer();
      }
    };
  }

  private static async loadHtmlBook(bookId: string, fileInfo: FileInfo) {
    const contentUrl = `/api/ebooks/${bookId}/${fileInfo.filename}`;
    
    try {
      const response = await fetch(contentUrl);
      if (!response.ok) throw new Error(`Failed to load HTML content: ${response.status} ${response.statusText}`);
      const htmlContent = await response.text();
      
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
        chapters: [{
          id: '1',
          chapter_number: 1,
          chapter_title: fileInfo.bookMetadata.title,
          content_html: htmlContent,
          reading_time_minutes: Math.ceil(fileInfo.bookMetadata.estimatedReadingTime / 60)
        }],
        loadContent: async () => htmlContent
      };
    } catch (error) {
      throw new Error(`Failed to load HTML book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBookStructure(bookId: string) {
    try {
      const response = await fetch(`/api/books/${bookId}/structure`);
      if (!response.ok) return [];
      
      const structure = await response.json();
      return structure.chapters || [];
    } catch (error) {
      console.error('Failed to load book structure:', error);
      return [];
    }
  }
}
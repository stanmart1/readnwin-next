declare module 'epubjs' {
  export class Zip {
    loadAsync(buffer: Buffer): Promise<unknown>;
    file(path: string): { async(type: string): Promise<string> } | null;
  }

  export class Book {
    constructor(path: string);
    open(): Promise<void>;
    getMetadata(): Promise<{ title?: string; creator?: string; description?: string }>;
    getSpine(): Promise<{ items: Array<{ id: string; href: string }> }>;
    getToc(): Promise<Array<{ id: string; href: string; label: string }>>;
    getChapterRaw(id: string): Promise<string>;
    getChapter(id: string): Promise<string>;
  }

  export function open(path: string): Promise<Book>;
}

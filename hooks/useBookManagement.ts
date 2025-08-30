import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useDebounce } from './useDebounce';

interface Book {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  price: number;
  status: string;
  stock_quantity: number;
  is_featured: boolean;
  cover_image_url: string;
  format: string;
  created_at: string;
}

interface Filters {
  search: string;
  status: string;
  category_id: number | undefined;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useBookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    category_id: undefined
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
        status: filters.status
      });
      
      if (filters.category_id) {
        params.append('category_id', filters.category_id.toString());
      }
      
      console.log('Loading books with params:', params.toString());
      
      const response = await fetch(`/api/admin/books?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Books loaded successfully:', result);
      
      setBooks(result.books || []);
      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total || 0,
          pages: result.pagination.pages || 0
        }));
      }
      
      // Show warning if there's an error but books were still returned
      if (result.error) {
        toast.error(`Warning: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Load books error:', error);
      setError(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filters.status, filters.category_id]);

  const updateBook = useCallback(async (bookId: number, updates: Partial<Book>) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update book');
      }

      await loadBooks();
      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update book');
      return false;
    }
  }, [loadBooks]);

  const deleteBooks = useCallback(async (bookIds: number[]) => {
    try {
      // Optimistically remove books from UI immediately
      setBooks(prevBooks => prevBooks.filter(book => !bookIds.includes(book.id)));
      
      const params = new URLSearchParams({ ids: bookIds.join(',') });
      const response = await fetch(`/api/admin/books?${params}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Revert optimistic update on error
        await loadBooks();
        throw new Error(errorData.error || 'Failed to delete books');
      }
      
      const result = await response.json();
      // Refresh the list to ensure consistency
      await loadBooks();
      toast.success(`Successfully deleted ${result.deleted_count || bookIds.length} books`);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete books');
      return false;
    }
  }, [loadBooks]);

  const batchUpdateBooks = useCallback(async (bookIds: number[], updates: any) => {
    try {
      // Validate numeric inputs
      if (updates.category_id && isNaN(parseInt(updates.category_id))) {
        throw new Error('Invalid category ID');
      }
      
      if (updates.price_adjustment?.value && isNaN(parseFloat(updates.price_adjustment.value))) {
        throw new Error('Invalid price adjustment value');
      }

      const updatePayload: any = { book_ids: bookIds };

      if (updates.status) updatePayload.status = updates.status;
      if (updates.category_id) updatePayload.category_id = parseInt(updates.category_id);
      if (updates.price_adjustment?.value) {
        updatePayload.price_adjustment = {
          value: parseFloat(updates.price_adjustment.value),
          type: updates.price_adjustment.type
        };
      }

      const response = await fetch('/api/admin/books/batch-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update books');
      }

      const result = await response.json();
      await loadBooks();
      toast.success(`Successfully updated ${result.updated_count || bookIds.length} books`);
      return true;
    } catch (error) {
      console.error('Batch update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update books');
      return false;
    }
  }, [loadBooks]);

  // Load books when dependencies change
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Reset to first page when filters change (except pagination)
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearch, filters.status, filters.category_id]);

  return {
    books,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPagination,
    loadBooks,
    updateBook,
    deleteBooks,
    batchUpdateBooks,
    setError
  };
}
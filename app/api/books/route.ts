import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import ModernBookService from '@/lib/services/ModernBookService';
import StorageService from '@/lib/services/StorageService';
import { sanitizeForLog, sanitizeHtml, sanitizeInt, safeJsonParse } from '@/utils/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if this is an admin request (requires authentication)
    const isAdminRequest = searchParams.get('admin') === 'true' || 
                          searchParams.get('status') === 'draft' ||
                          searchParams.get('status') === 'archived';
    
    // Only require authentication for admin requests
    if (isAdminRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      category_id: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined,
      author_id: searchParams.get('author_id') ? parseInt(searchParams.get('author_id')!) : undefined,
      book_type: searchParams.get('book_type') || undefined,
      status: isAdminRequest ? (searchParams.get('status') || undefined) : 'published',
      is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
      is_bestseller: searchParams.get('is_bestseller') === 'true' ? true : undefined,
      is_new_release: searchParams.get('is_new_release') === 'true' ? true : undefined,
      visibility: isAdminRequest ? undefined : 'public',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Validate pagination
    if (filters.page < 1) filters.page = 1;
    if (filters.limit < 1 || filters.limit > 100) filters.limit = 20;

    console.log('Fetching books with filters:', sanitizeForLog(JSON.stringify(filters)));
    console.log('Is admin request:', isAdminRequest);

    const result = await ModernBookService.getBooks(filters);

    return NextResponse.json({
      success: true,
      books: result.books,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.pages,
        totalItems: result.total,
        itemsPerPage: filters.limit,
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch books',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role) || session.user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const bookData = {
      title: formData.get('title') as string,
      subtitle: formData.get('subtitle') as string || undefined,
      author_id: sanitizeInt(formData.get('author_id')),
      category_id: sanitizeInt(formData.get('category_id')),
      isbn: formData.get('isbn') as string || undefined,
      description: formData.get('description') as string || undefined,
      short_description: formData.get('short_description') as string || undefined,
      
      book_type: formData.get('book_type') as 'physical' | 'ebook' | 'hybrid' || 'ebook',
      primary_format: formData.get('primary_format') as string || undefined,
      
      price: sanitizeInt(formData.get('price')),
      original_price: formData.get('original_price') ? sanitizeInt(formData.get('original_price')) : undefined,
      cost_price: formData.get('cost_price') ? sanitizeInt(formData.get('cost_price')) : undefined,
      currency: formData.get('currency') as string || 'NGN',
      
      weight_grams: formData.get('weight_grams') ? sanitizeInt(formData.get('weight_grams')) : undefined,
      dimensions: formData.get('dimensions') ? safeJsonParse(formData.get('dimensions') as string) : undefined,
      shipping_class: formData.get('shipping_class') as string || undefined,
      stock_quantity: sanitizeInt(formData.get('stock_quantity')),
      low_stock_threshold: sanitizeInt(formData.get('low_stock_threshold'), 5),
      inventory_tracking: formData.get('inventory_tracking') === 'true',
      
      download_limit: sanitizeInt(formData.get('download_limit'), -1),
      drm_protected: formData.get('drm_protected') === 'true',
      
      language: formData.get('language') as string || 'en',
      pages: formData.get('pages') ? sanitizeInt(formData.get('pages')) : undefined,
      publication_date: formData.get('publication_date') as string || undefined,
      publisher: formData.get('publisher') as string || undefined,
      edition: formData.get('edition') as string || undefined,
      
      status: formData.get('status') as 'draft' | 'published' | 'archived' | 'out_of_stock' || 'draft',
      is_featured: formData.get('is_featured') === 'true',
      is_bestseller: formData.get('is_bestseller') === 'true',
      is_new_release: formData.get('is_new_release') === 'true',
      visibility: formData.get('visibility') as 'public' | 'private' | 'members_only' || 'public',
      
      seo_title: formData.get('seo_title') as string || undefined,
      seo_description: formData.get('seo_description') as string || undefined,
      seo_keywords: formData.get('seo_keywords') as string || undefined,
      marketing_tags: formData.get('marketing_tags') ? (formData.get('marketing_tags') as string).split(',') : undefined,
      
      cover_image: formData.get('cover_image') as File || undefined,
      ebook_file: formData.get('ebook_file') as File || undefined,
      sample_content: formData.get('sample_content') as File || undefined,
      
      created_by: sanitizeInt(session.user.id),
    };

    // Validate required fields
    if (!bookData.title || !bookData.author_id || !bookData.category_id || !bookData.price) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          details: 'Title, author, category, and price are required'
        },
        { status: 400 }
      );
    }

    // Validate book type and files
    if (bookData.book_type === 'ebook' && !bookData.ebook_file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ebook file is required for digital books',
        },
        { status: 400 }
      );
    }

    console.log('Creating book:', sanitizeForLog(bookData.title));

    const result = await ModernBookService.createBook(bookData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to create book'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      book: result.book,
      message: 'Book created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create book',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const isAdmin = ['admin', 'super_admin'].includes(session.user.role) || session.user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'No book IDs provided' },
        { status: 400 }
      );
    }

    const bookIds = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (bookIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid book IDs' },
        { status: 400 }
      );
    }

    console.log('Bulk deleting books:', sanitizeForLog(bookIds.join(',')));

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete books concurrently for better performance
    const deletePromises = bookIds.map(async (bookId) => {
      try {
        const result = await ModernBookService.deleteBook(bookId);
        return { bookId, success: result.success, error: result.error };
      } catch (error) {
        return { bookId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.allSettled(deletePromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          deletedCount++;
        } else {
          errors.push(`Book ${result.value.bookId}: ${sanitizeHtml(result.value.error || 'Unknown error')}`);
        }
      } else {
        errors.push(`Delete operation failed: ${sanitizeHtml(result.reason)}`);
      }
    });

    return NextResponse.json({
      success: deletedCount > 0,
      deleted_count: deletedCount,
      total_requested: bookIds.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully deleted ${deletedCount} of ${bookIds.length} books`,
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete books',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
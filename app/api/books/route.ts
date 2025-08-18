import { NextRequest, NextResponse } from 'next/server';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📚 API: /api/books - Request started');
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category_id = searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!) : undefined;
    const author_id = searchParams.get('author_id') ? parseInt(searchParams.get('author_id')!) : undefined;
    const min_price = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const max_price = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const is_featured = searchParams.get('is_featured') === 'true';
    const is_bestseller = searchParams.get('is_bestseller') === 'true';
    const is_new_release = searchParams.get('is_new_release') === 'true';
    const min_rating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined;

    console.log('📋 API: Query parameters:', {
      page,
      limit,
      search: search || 'none',
      category_id: category_id || 'none',
      author_id: author_id || 'none',
      is_featured,
      is_bestseller,
      is_new_release
    });

    // Build filters object
    const filters: any = {};
    if (search) filters.search = search;
    if (category_id) filters.category_id = category_id;
    if (author_id) filters.author_id = author_id;
    if (min_price) filters.min_price = min_price;
    if (max_price) filters.max_price = max_price;
    if (is_featured) filters.is_featured = is_featured;
    if (is_bestseller) filters.is_bestseller = is_bestseller;
    if (is_new_release) filters.is_new_release = is_new_release;
    if (min_rating) filters.min_rating = min_rating;

    console.log('🔍 API: Calling ecommerceService.getBooks...');
    
    // Get books from service (public API only shows published books)
    const result = await ecommerceService.getBooks(filters, page, limit, false);

    console.log(`✅ API: Successfully retrieved ${result.books.length} books`);

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  API: Request completed in ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      books: result.books,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ API: /api/books - Error occurred:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    });

    // Enhanced error response based on error type
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        statusCode = 503;
        errorMessage = 'Database connection error. Please try again.';
        errorCode = 'DATABASE_ERROR';
      } else if (error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'Request timed out. Please try again.';
        errorCode = 'TIMEOUT_ERROR';
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        statusCode = 403;
        errorMessage = 'Access denied.';
        errorCode = 'ACCESS_DENIED';
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.author_id || !body.category_id || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields: title, author_id, category_id, price' },
        { status: 400 }
      );
    }

    // Create book
    const book = await ecommerceService.createBook(body);

    return NextResponse.json({
      success: true,
      book,
      message: 'Book created successfully'
    });

  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
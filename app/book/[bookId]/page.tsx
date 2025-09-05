'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import SafeImage from '@/components/ui/SafeImage';
import { formatNumber } from '@/utils/dateUtils';
import { useGuestCart } from '@/contexts/GuestCartContext';
import ReviewForm from '@/components/ReviewForm';
import { sanitizeHtml, sanitizeForXSS } from '@/utils/security';


interface BookDetails {
  id: number;
  title: string;
  subtitle?: string;
  author_name: string;
  category_name: string;
  price: number;
  original_price?: number;
  rating?: number;
  review_count?: number;
  cover_image_url: string;
  stock_quantity: number;
  description?: string;
  short_description?: string;
  pages?: number;
  language: string;
  publisher?: string;
  publication_date?: string;
  isbn?: string;
  format: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_release: boolean;
  status: string;
}

export default function BookDetailsPage({ params }: { params: { bookId: string } }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [book, setBook] = useState<BookDetails | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<BookDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface Review {
    id: number;
    rating: number;
    review_text: string;
    title?: string;
    first_name: string;
    last_name: string;
    created_at: string;
    is_verified_purchase?: boolean;
  }
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { data: session } = useSession();
  const { addToCart } = useGuestCart();

  // Load reviews for the book
  const loadReviews = useCallback(async () => {
    if (!book) return;
    
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/reviews?bookId=${book.id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        console.error('Failed to load reviews:', response.status);
        setError('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  }, [book]);

  // Load book data from API
  const loadBookData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load book and related books concurrently when possible
      const response = await fetch(`/api/books/${params.bookId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBook(data.book);
        
        // Load related books concurrently if category_id is available
        if (data.book?.category_id) {
          const relatedPromise = fetch(`/api/books?category_id=${data.book.category_id}&limit=4`)
            .then(relatedResponse => {
              if (relatedResponse.ok) {
                return relatedResponse.json();
              }
              throw new Error(`Failed to load related books: ${relatedResponse.status}`);
            })
            .then(relatedData => {
              const filteredRelatedBooks = relatedData.books?.filter((relatedBook: BookDetails) => relatedBook.id !== data.book.id) || [];
              setRelatedBooks(filteredRelatedBooks.slice(0, 3));
            })
            .catch(relatedError => {
              console.error('Error loading related books:', relatedError);
            });
          
          // Don't await - let it load in background
          relatedPromise;
        }
      } else {
        setError('Book not found');
      }
    } catch (error) {
      console.error('Error loading book:', error);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [params.bookId]);

  useEffect(() => {
    loadBookData();
  }, [loadBookData]);

  useEffect(() => {
    if (book && selectedTab === 'reviews') {
      loadReviews();
    }
  }, [book, selectedTab, loadReviews]);

  // Update tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== selectedTab) {
      setSelectedTab(tab);
    }
  }, [searchParams, selectedTab]);

  const handleWishlist = () => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async () => {
    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (!book) return;

    try {
      await addToCart(book, quantity);
      // Show success message or update cart count
      alert('Item added to cart successfully!');
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`ri-star-${i <= rating ? 'fill' : 'line'} text-yellow-400 text-lg`}
        ></i>
      );
    }
    return stars;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-file-text-line' },
    { id: 'reviews', label: 'Reviews', icon: 'ri-star-line' },
    { id: 'details', label: 'Details', icon: 'ri-information-line' },
    { id: 'related', label: 'Related Books', icon: 'ri-book-line' }
  ];



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
              <p className="text-gray-600 mb-8">{sanitizeForXSS(error || 'The book you are looking for does not exist.')}</p>
              <Link 
                href="/books" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors cursor-pointer">Home</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link href="/books" className="hover:text-blue-600 transition-colors cursor-pointer">Books</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900 font-medium">{sanitizeForXSS(book.title)}</span>
        </nav>

        {/* Book Details Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="lg:col-span-1">
              <div className="relative group">
                <SafeImage 
                  src={book.cover_image_url}
                  alt={book.title}
                  bookTitle={book.title}
                  className="w-full rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                {book.stock_quantity <= 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-2 rounded-full font-medium shadow-lg">
                    Out of Stock
                  </div>
                )}
                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
                  <button 
                    onClick={handleWishlist}
                    className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    title={session ? (isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist') : 'Login to Wishlist'}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className={`ri-heart-${isWishlisted ? 'fill text-red-500' : 'line text-gray-600'} text-lg`}></i>
                    </div>
                  </button>
                  <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-share-line text-gray-600 text-lg"></i>
                    </div>
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                    disabled={book.stock_quantity <= 0}
                    title={session ? 'Add to Cart' : 'Login to Add to Cart'}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      <i className="ri-shopping-cart-line text-lg"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h1 className="text-5xl font-bold text-gray-900 mb-3 leading-tight">{sanitizeForXSS(book.title)}</h1>
                <p className="text-2xl text-gray-600 mb-6">by <span className="font-semibold text-blue-600">{sanitizeForXSS(book.author_name)}</span></p>
                
                {/* Rating */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      {renderStars(book.rating || 0)}
                    </div>
                    <span className="text-xl font-bold text-gray-900">{book.rating || 0}</span>
                  </div>
                  <span className="text-gray-500 text-lg">({formatNumber(book.review_count || 0)} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4 mb-8">
                  <span className="text-4xl font-bold gradient-text">₦{book.price.toLocaleString()}</span>
                  {book.original_price && (
                    <span className="text-2xl text-gray-500 line-through">₦{book.original_price.toLocaleString()}</span>
                  )}
                  {book.original_price && (
                    <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      {Math.round(((book.original_price - book.price) / book.original_price) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center space-x-6 mb-8">
                  {session && (
                    <div className="flex items-center space-x-3">
                      <label className="text-lg font-medium text-gray-700">Quantity:</label>
                      <select 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="border-2 border-gray-300 rounded-lg px-4 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button 
                    onClick={handleAddToCart}
                    className="btn-primary text-lg px-10 py-4"
                    disabled={book.stock_quantity <= 0}
                  >
                    <i className="ri-shopping-cart-line mr-2"></i>
                    {!session ? 'Add to Cart' : (book.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock')}
                  </button>
                  <button 
                    onClick={handleWishlist}
                    className={`p-4 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-110 ${
                      isWishlisted 
                        ? 'border-red-500 text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title={session ? (isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist') : 'Login to Wishlist'}
                  >
                    <i className={`ri-heart-${isWishlisted ? 'fill' : 'line'} text-2xl`}></i>
                  </button>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                    <span className="text-gray-500 text-sm font-medium">Category</span>
                    <p className="font-semibold text-gray-900 text-lg">{sanitizeForXSS(book.category_name)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                    <span className="text-gray-500 text-sm font-medium">Pages</span>
                    <p className="font-semibold text-gray-900 text-lg">{book.pages ? formatNumber(book.pages) : 'Not specified'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <span className="text-gray-500 text-sm font-medium">Format</span>
                    <p className="font-semibold text-gray-900 text-lg">
                      {book.format === 'ebook' ? 'Ebook' : 
                       book.format === 'physical' ? 'Physical' :
                       book.format === 'hybrid' ? 'Hybrid' :
                       book.format}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
                    <span className="text-gray-500 text-sm font-medium">Language</span>
                    <p className="font-semibold text-gray-900 text-lg">{sanitizeForXSS(book.language)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-3 py-6 px-1 border-b-2 font-semibold text-base whitespace-nowrap cursor-pointer transition-all duration-300 ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} text-xl`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'overview' && (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">About this book</h3>
                <div className="prose prose-lg max-w-none">
                  {book.description ? (
                    <p className="text-gray-600 leading-relaxed text-lg">{sanitizeForXSS(book.description)}</p>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-file-text-line text-gray-400 text-2xl"></i>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">No Description Available</h4>
                      <p className="text-gray-600 text-lg">
                        This book doesn't have a description yet. Check back later for more details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                <div className="space-y-8">
                  {/* Review Form */}
                  <ReviewForm 
                    bookId={book.id} 
                    onReviewSubmitted={() => {
                      loadReviews();
                      // Optionally reload book data to update review count
                      loadBookData();
                    }}
                  />

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      <h4 className="text-xl font-semibold text-gray-900">All Reviews ({reviews.length})</h4>
                      {reviews.map((review: Review) => (
                        <div key={review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {review.first_name?.charAt(0)}{review.last_name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {review.first_name} {review.last_name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    {renderStars(review.rating)}
                                  </div>
                                  {review.is_verified_purchase && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h5 className="font-semibold text-gray-900 mb-2">{sanitizeForXSS(review.title)}</h5>
                          )}
                          <p className="text-gray-700 leading-relaxed">{sanitizeForXSS(review.review_text)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-star-line text-gray-400 text-2xl"></i>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                      <p className="text-gray-600 text-lg">
                        Be the first to review this book! Share your thoughts and help other readers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedTab === 'details' && (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Book Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                      <span className="text-gray-500 text-sm font-medium">Publisher</span>
                      <p className="font-semibold text-gray-900 text-xl">{book.publisher || 'Not specified'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
                      <span className="text-gray-500 text-sm font-medium">Publication Date</span>
                      <p className="font-semibold text-gray-900 text-xl">{book.publication_date || 'Not specified'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                      <span className="text-gray-500 text-sm font-medium">ISBN</span>
                      <p className="font-semibold text-gray-900 text-xl">{book.isbn || 'Not specified'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100">
                      <span className="text-gray-500 text-sm font-medium">Format</span>
                      <p className="font-semibold text-gray-900 text-xl">
                        {book.format === 'ebook' ? 'Ebook' : 
                         book.format === 'physical' ? 'Physical' :
                         book.format === 'hybrid' ? 'Hybrid' :
                         book.format}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                      <span className="text-gray-500 text-sm font-medium">Pages</span>
                      <p className="font-semibold text-gray-900 text-xl">{book.pages ? formatNumber(book.pages) : 'Not specified'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
                      <span className="text-gray-500 text-sm font-medium">Language</span>
                      <p className="font-semibold text-gray-900 text-xl">{sanitizeForXSS(book.language)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 p-6 rounded-2xl border border-rose-100">
                      <span className="text-gray-500 text-sm font-medium">Category</span>
                      <p className="font-semibold text-gray-900 text-xl">{sanitizeForXSS(book.category_name)}</p>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'related' && (
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Related Books</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedBooks.map((relatedBook) => (
                    <Link 
                      key={relatedBook.id} 
                      href={`/book/${relatedBook.id}`}
                      className="group cursor-pointer"
                    >
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                        <div className="relative">
                          <SafeImage 
                            src={relatedBook.cover_image_url}
                            alt={relatedBook.title}
                            bookTitle={relatedBook.title}
                            className="w-full h-56 object-cover object-top"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <i className="ri-eye-line text-gray-600 text-lg"></i>
                              </div>
                            </button>
                            <button className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <i className="ri-heart-line text-gray-600 text-lg"></i>
                              </div>
                            </button>
                            <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <i className="ri-shopping-cart-line text-lg"></i>
                              </div>
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg">
                            {sanitizeForXSS(relatedBook.title)}
                          </h4>
                          <p className="text-gray-600 mb-3">{sanitizeForXSS(relatedBook.author_name)}</p>
                          <span className="text-xl font-bold gradient-text">₦{relatedBook.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
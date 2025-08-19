"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "react-hot-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  progress?: number;
  totalPages: number;
  currentPage?: number;
  lastRead?: string;
  status: "reading" | "completed" | "unread";
  category?: string;
  rating?: number;
  format?: string;
  ebook_file_url?: string;
  content?: {
    chapters: Array<{ title: string; pages: number }>;
  };
}

export default function UserLibrary() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's library
  useEffect(() => {
    const fetchLibrary = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/user/library");

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Transform the API data to match our Book interface
            // Only include books with valid essential data
            const transformedBooks = data.libraryItems
              .filter((item: any) => {
                // Ensure we have essential book data
                const hasValidTitle = item.book_title || item.title;
                const hasValidAuthor = item.author_name || item.author;
                const hasValidBookId = item.book_id || item.id;

                return hasValidTitle && hasValidAuthor && hasValidBookId;
              })
              .map((item: any) => ({
                id: item.book_id?.toString() || item.id?.toString(),
                title: item.book?.title || item.book_title || item.title,
                author:
                  item.book?.author_name || item.author_name || item.author,
                cover:
                  item.book?.cover_image_url ||
                  item.cover_image ||
                  item.cover ||
                  "",
                progress:
                  item.readingProgress?.progressPercentage ||
                  item.progress_percentage ||
                  0,
                totalPages:
                  item.readingProgress?.totalPages || item.total_pages || 0,
                currentPage:
                  item.readingProgress?.currentPage || item.current_page || 0,
                lastRead: item.readingProgress?.lastReadAt || item.last_read_at,
                status: item.status || "unread",
                category:
                  item.book?.category_name ||
                  item.category_name ||
                  item.category ||
                  "",
                rating: item.rating || 0,
                format: item.book?.format || item.format || "",
                ebook_file_url:
                  item.book?.ebook_file_url || item.ebook_file_url || "",
                content: {
                  chapters: item.chapters || [],
                },
              }));

            setBooks(transformedBooks);
          } else {
            setError("Failed to load library");
          }
        } else {
          setError("Failed to load library");
        }
      } catch (error) {
        console.error("Error fetching library:", error);
        setError("Failed to load library");
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [session]);

  // Filter books based on search and status
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.category &&
        book.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reading":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "unread":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "reading":
        return "Currently Reading";
      case "completed":
        return "Completed";
      case "unread":
        return "Not Started";
      default:
        return status;
    }
  };

  const handleBookClick = async (book: Book) => {
    if (book.ebook_file_url) {
      // Track reading activity if not already started
      if (book.status === "unread" || !book.progress || book.progress === 0) {
        try {
          await fetch("/api/dashboard/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activity_type: "started",
              title: `Started reading "${book.title}"`,
              book_id: parseInt(book.id),
              metadata: { action: "book_started" },
            }),
          });
        } catch (error) {
          console.error("Error tracking reading activity:", error);
        }
      }

      // Navigate to the dedicated reading page
      router.push(`/reading/${book.id}`);
    } else {
      toast.error("Book file not available for reading");
    }
  };

  // Check for book in sessionStorage (from BookCard)
  useEffect(() => {
    const storedBook = sessionStorage.getItem("selectedBook");
    if (storedBook) {
      try {
        const bookData = JSON.parse(storedBook);
        setSelectedBook(bookData);
        sessionStorage.removeItem("selectedBook"); // Clear after reading
      } catch (error) {
        console.error("Error parsing stored book:", error);
        sessionStorage.removeItem("selectedBook");
      }
    }
  }, []);

  // E-Reader integration removed - now navigates to dedicated reading page

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading library
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Reading Library
        </h1>
        <p className="text-gray-600">Manage and read your ebook collection</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            {["all", "reading", "completed", "unread"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All Books" : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => handleBookClick(book)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <div className="relative">
              <img
                src={book.cover || "/placeholder-book.jpg"}
                alt={book.title}
                className="w-full h-64 object-cover object-top"
                onError={(e) => {
                  // Fallback to placeholder image
                  e.currentTarget.src = "/placeholder-book.jpg";
                }}
              />

              {/* Progress Overlay */}
              {book.progress && book.progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-xs">{book.progress}%</span>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}
              >
                {getStatusText(book.status)}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{book.author}</p>
              {book.category && (
                <p className="text-gray-500 text-xs mb-3">{book.category}</p>
              )}

              {/* Reading Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>
                  Page {book.currentPage || 0} of {book.totalPages || 0}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`ri-star-${i < (book.rating || 0) ? "fill" : "line"} text-yellow-400 text-xs`}
                    ></i>
                  ))}
                </div>
              </div>

              {/* Last Read */}
              {book.lastRead && (
                <p className="text-xs text-gray-400 mb-3">
                  Last read: {formatDate(book.lastRead)}
                </p>
              )}

              {/* Action Button */}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
                {book.progress && book.progress > 0
                  ? "Continue Reading"
                  : "Read Book"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="ri-book-line text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {books.length === 0 ? "Your library is empty" : "No books found"}
          </h3>
          <p className="text-gray-600">
            {books.length === 0
              ? "Purchase some books to start building your reading library"
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      )}
    </div>
  );
}

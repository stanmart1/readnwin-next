
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useUnifiedCart } from '@/contexts/UnifiedCartContext';
import { protectNavigation, ensureNavigationResponsive } from '@/utils/navigationProtection';


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  
  const { cartItems, getTotalItems } = useUnifiedCart();
  const totalItems = getTotalItems();
  
  // Force re-render when cart changes
  useEffect(() => {
    // This will trigger a re-render when cart items change
  }, [cartItems, totalItems]);
  
  // Listen for cart refresh events
  useEffect(() => {
    const handleCartRefresh = () => {
      // Force re-render by updating a state
      setIsMenuOpen(prev => prev);
    };

    window.addEventListener('cart-refresh', handleCartRefresh);
    return () => window.removeEventListener('cart-refresh', handleCartRefresh);
  }, []);



  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Protect navigation from interference
  useEffect(() => {
    protectNavigation();
    
    // Ensure navigation remains responsive after page loads
    const timer = setTimeout(() => {
      ensureNavigationResponsive();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const closeMenus = () => {
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 navigation-safe" data-navigation="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <i className="ri-book-line text-white text-lg"></i>
            </div>
            <span className="text-xl font-bold font-pacifico text-gray-900">
              ReadnWin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 navigation-safe">
            <Link href="/" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>Home</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
            <Link href="/books" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>Books</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
            <Link href="/blog" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>Blog</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
            <Link href="/faq" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>FAQ</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
            <Link href="/about" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>About</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
            <Link href="/contact" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium group">
              <span>Contact</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-4/5 transform -translate-x-1/2"></div>
            </Link>
          </nav>

          {/* Right side - Cart, User */}
          <div className="flex items-center space-x-4 navigation-safe">
            {/* Cart */}
            <Link href="/cart" className="relative flex items-center justify-center p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer navigation-safe" data-navigation="cart-link">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5M7 13l-1.5 5m0 0h9m-9 0a1 1 0 102 0m7 0a1 1 0 102 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse pointer-events-none z-10">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {session?.user?.profileImage ? (
                      <img
                        src={session.user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="ri-user-line text-white text-sm"></i>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{session.user.firstName || session.user.email}</span>
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Show admin link for admin users */}
                    {(session.user.role === 'admin' || session.user.role === 'super_admin') && (
                      <Link 
                        href="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={closeMenus}
                      >
                        <i className="ri-admin-line mr-3"></i>
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={closeMenus}>
                      <i className="ri-dashboard-line mr-3"></i>
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={closeMenus}>
                      <i className="ri-user-line mr-3"></i>
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link href="/dashboard/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={closeMenus}>
                      <i className="ri-shopping-bag-line mr-3"></i>
                      <span className="font-medium">Orders</span>
                    </Link>
                    <Link href="/dashboard?tab=library" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={closeMenus}>
                      <i className="ri-book-open-line mr-3"></i>
                      <span className="font-medium">My Library</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-logout-box-line mr-3"></i>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium navigation-safe" data-navigation="login-link">
                  Sign In
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium navigation-safe" data-navigation="register-link">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 navigation-safe"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Side Drawer */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Side Drawer */}
            <div className="md:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out navigation-safe">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <i className="ri-book-line text-white text-sm"></i>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">ReadnWin</h2>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 p-4 overflow-y-auto navigation-safe">
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-home-line text-lg"></i>
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link 
                      href="/books" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-book-line text-lg"></i>
                      <span className="font-medium">Books</span>
                    </Link>
                    {session && (
                      <Link 
                        href="/dashboard?tab=library" 
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                        onClick={closeMenus}
                      >
                        <i className="ri-library-line text-lg"></i>
                        <span className="font-medium">My Library</span>
                      </Link>
                    )}
                    <Link 
                      href="/blog" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-article-line text-lg"></i>
                      <span className="font-medium">Blog</span>
                    </Link>
                    <Link 
                      href="/faq" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-question-line text-lg"></i>
                      <span className="font-medium">FAQ</span>
                    </Link>
                    <Link 
                      href="/about" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-information-line text-lg"></i>
                      <span className="font-medium">About</span>
                    </Link>
                    <Link 
                      href="/contact" 
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 py-3 px-3 rounded-lg"
                      onClick={closeMenus}
                    >
                      <i className="ri-customer-service-line text-lg"></i>
                      <span className="font-medium">Contact</span>
                    </Link>
                  </div>
                </nav>
                
                {/* Auth Section */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  {session ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                          {session?.user?.profileImage ? (
                            <img
                              src={session.user.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <i className="ri-user-line text-white text-sm"></i>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{session.user?.firstName || 'User'}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          closeMenus();
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                      >
                        <i className="ri-logout-box-line"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link 
                        href="/login" 
                        className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-white transition-all duration-200 py-3 px-4 rounded-lg border border-gray-200 font-medium"
                        onClick={closeMenus}
                      >
                        <i className="ri-login-box-line"></i>
                        <span>Sign In</span>
                      </Link>
                      <Link 
                        href="/register" 
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                        onClick={closeMenus}
                      >
                        <i className="ri-user-add-line"></i>
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

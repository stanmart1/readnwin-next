'use client';

import { ShoppingCart } from 'lucide-react';
import { useSecureCart } from '@/contexts/SecureCartContext';
import Link from 'next/link';

interface CartIconProps {
  className?: string;
  showCount?: boolean;
}

export default function CartIcon({ className = '', showCount = true }: CartIconProps) {
  const { totalItems, isEmpty } = useSecureCart();

  return (
    <Link 
      href="/cart/secure" 
      className={`relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      title={`Cart (${totalItems} items)`}
    >
      <ShoppingCart className="h-6 w-6" />
      {showCount && !isEmpty && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
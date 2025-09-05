'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Check, Loader2 } from 'lucide-react';
import { useUnifiedCart } from '@/contexts/UnifiedCartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CartButtonProps {
  bookId: number;
  quantity?: number;
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
  disabled?: boolean;
}

export default function CartButton({ 
  bookId, 
  quantity = 1, 
  variant = 'default',
  className = '',
  disabled = false
}: CartButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart, cartItems, isLoading } = useUnifiedCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isInCart = items.some(item => item.book_id === bookId);
  const isButtonDisabled = disabled || isLoading || isAdding;

  const handleAddToCart = async () => {
    if (!session) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/login');
      return;
    }

    if (isInCart) {
      router.push('/cart');
      return;
    }

    setIsAdding(true);
    try {
      await addItem(bookId, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {variant !== 'icon' && <span className="ml-2">Adding...</span>}
        </>
      );
    }

    if (justAdded) {
      return (
        <>
          <Check className="h-4 w-4 text-green-600" />
          {variant !== 'icon' && <span className="ml-2 text-green-600">Added!</span>}
        </>
      );
    }

    if (isInCart) {
      return (
        <>
          <ShoppingCart className="h-4 w-4" />
          {variant !== 'icon' && <span className="ml-2">View Cart</span>}
        </>
      );
    }

    return (
      <>
        <Plus className="h-4 w-4" />
        {variant !== 'icon' && <span className="ml-2">Add to Cart</span>}
      </>
    );
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    if (justAdded) {
      return `${baseClasses} bg-green-50 text-green-700 border border-green-200 hover:bg-green-100`;
    }

    if (isInCart) {
      return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200`;
    }

    const variantClasses = {
      default: 'px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
      compact: 'px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
      icon: 'p-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 rounded-full'
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isButtonDisabled}
      className={`${getButtonClasses()} ${className}`}
      title={
        !session ? 'Sign in to add to cart' :
        isInCart ? 'View cart' :
        'Add to cart'
      }
    >
      {getButtonContent()}
    </button>
  );
}
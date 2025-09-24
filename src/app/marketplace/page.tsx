'use client';
import { MarketplacePage } from "@/components/MarketplacePage";
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Marketplace() {
  const router = useRouter();
  const [cartItems, setCartItems] = React.useState<any[]>([]);

  const handleNavigate = (page: string, productId?: number) => {
      if (page === 'product' && productId) {
          router.push(`/product/${productId}`);
      } else {
          router.push(`/${page}`);
      }
  };

  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  return <MarketplacePage onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
}

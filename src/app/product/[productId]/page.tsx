'use client';
import { ProductPage } from "@/components/ProductPage";
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Product({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
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

  return <ProductPage productId={Number(params.productId)} onNavigate={handleNavigate} onAddToCart={handleAddToCart} />;
}

'use client';
import { CartPage } from "@/components/CartPage";
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = React.useState<any[]>([]);
    const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return <CartPage cartItems={cartItems} onNavigate={handleNavigate} onUpdateCart={setCartItems} />;
}

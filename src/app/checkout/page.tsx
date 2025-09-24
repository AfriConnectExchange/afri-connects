'use client';
import { CheckoutPage } from "@/components/CheckoutPage";
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  return <CheckoutPage cartItems={cartItems} onNavigate={handleNavigate} onUpdateCart={setCartItems} />;
}

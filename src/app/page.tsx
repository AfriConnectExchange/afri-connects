'use client';
import { HomePage } from "@/components/HomePage";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };
  return <HomePage onNavigate={handleNavigate} />;
}

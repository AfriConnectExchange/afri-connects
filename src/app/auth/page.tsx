'use client';
import { AuthPage } from "@/components/AuthPage";
import { useRouter } from 'next/navigation';

export default function Auth() {
  const router = useRouter();
  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };
  return <AuthPage onNavigate={handleNavigate} />;
}

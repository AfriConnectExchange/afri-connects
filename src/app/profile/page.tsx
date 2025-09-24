'use client';
import { ProfilePage } from "@/components/ProfilePage";
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };
  return <ProfilePage onNavigate={handleNavigate} />;
}

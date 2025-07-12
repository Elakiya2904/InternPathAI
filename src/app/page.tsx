// This is now a redirector component.
// The main logic has been moved to /dashboard for authenticated users
// and /generate for the roadmap creation process.
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}


'use client';

import Link from 'next/link';
import { BrainCircuit, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export default function AppHeader() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <Link href="/" className="flex items-center gap-3 cursor-pointer">
        <BrainCircuit className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">InternPathAI</h1>
      </Link>
      <div className="flex items-center gap-4">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome!</span>
            <Button onClick={logout} variant="outline">
              <LogOut className="mr-2" /> Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

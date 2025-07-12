
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Plus, BrainCircuit, LogOut, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [latestRoadmap, setLatestRoadmap] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchLatestRoadmap = async () => {
        setLoading(true);
        try {
          // Note: Firestore does not support ordering by creation time automatically
          // for subcollections without a timestamp field. We'll just get one doc for now.
          // For a real app, add a `createdAt` field and order by it.
          const q = query(collection(db, `users/${user.uid}/roadmaps`), limit(1));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const roadmapDoc = querySnapshot.docs[0];
            setLatestRoadmap({ id: roadmapDoc.id, ...roadmapDoc.data() });
          }
        } catch (error) {
          console.error("Error fetching roadmaps:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLatestRoadmap();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const AppHeader = () => (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
        <BrainCircuit className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">InternPathAI</h1>
      </div>
       <div className='flex items-center gap-2'>
        {user && <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>}
        <Button variant="ghost" onClick={handleLogout}><LogOut className='mr-2' /> Logout</Button>
       </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <AppHeader />
       <main className="flex-grow flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl animate-in fade-in-50 duration-500">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-headline text-4xl font-bold">Your Dashboard</h1>
                    <Button size="lg" onClick={() => router.push('/generate')}>
                        <Plus className="mr-2" />
                        New Roadmap
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : latestRoadmap ? (
                    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow">
                        <CardHeader>
                            <CardTitle>Your Latest Roadmap</CardTitle>
                            <CardDescription>
                                Field of Interest: <strong>{latestRoadmap.userInput.fieldOfInterest}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground mb-4">This roadmap has {latestRoadmap.roadmapData.roadmap.length} steps.</p>
                             <ul className="list-disc list-inside space-y-1">
                                {latestRoadmap.roadmapData.roadmap.slice(0, 5).map((step: any) => (
                                    <li key={step.title}>{step.title}</li>
                                ))}
                                {latestRoadmap.roadmapData.roadmap.length > 5 && <li>...and more</li>}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {/* This would navigate to a detailed view of the roadmap */}
                            <Button variant="outline" className="w-full" disabled>
                                View Details <ArrowRight className="ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="text-center py-20 px-6 border-2 border-dashed">
                       <CardHeader>
                        <CardTitle className="text-2xl font-bold">No roadmaps yet!</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground mt-2">
                           Ready to create your first personalized internship roadmap?
                        </CardDescription>
                       </CardHeader>
                       <CardContent>
                           <Button size="lg" onClick={() => router.push('/generate')}>
                                <Plus className="mr-2" />
                                Create New Roadmap
                           </Button>
                       </CardContent>
                    </Card>
                )}
            </div>
        </main>
    </div>
  );
}

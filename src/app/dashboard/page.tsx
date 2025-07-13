
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, BrainCircuit, ListTodo, BookOpen, Lightbulb, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// A type for the roadmap data structure after it's been stored in Firestore
type SavedRoadmap = {
  id: string;
  fieldOfInterest: string;
  advice: string;
  roadmap: {
    title: string;
    description: string;
    icon: string;
    tasks: { subTaskTitle: string; description: string }[];
    resources: string[];
    project: string;
  }[];
  createdAt: Date;
};

const iconMap: { [key: string]: LucideIcon } = {
  Code: ListTodo,
  BookOpen: BookOpen,
  Milestone: ListTodo,
  Database: ListTodo,
  Server: ListTodo,
  BrainCircuit: BrainCircuit,
  ListTodo: ListTodo,
  Lightbulb: Lightbulb,
};


const SavedRoadmapCard = ({ savedRoadmap }: { savedRoadmap: SavedRoadmap }) => {
    const Icon = iconMap[savedRoadmap.roadmap[0]?.icon] || BrainCircuit;
    return (
        <Card className="shadow-lg border-2 border-border transition-all hover:border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <Icon className="w-8 h-8 text-primary" />
                    {savedRoadmap.fieldOfInterest}
                </CardTitle>
                <CardDescription>
                    Saved on: {savedRoadmap.createdAt.toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible>
                    <AccordionItem value="details">
                        <AccordionTrigger>View Details</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <h3 className="font-bold text-lg mt-4">Personalized Advice</h3>
                            <p className="text-muted-foreground">{savedRoadmap.advice}</p>
                            <h3 className="font-bold text-lg mt-4">Roadmap Steps</h3>
                            <ul className="space-y-2">
                                {savedRoadmap.roadmap.map((step, index) => (
                                    <li key={index} className="p-2 bg-secondary/50 rounded-md">
                                        {step.title}
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  
  useEffect(() => {
    if (user) {
      const roadmapsRef = collection(db, 'users', user.uid, 'roadmaps');
      const q = query(roadmapsRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const roadmaps: SavedRoadmap[] = [];
          querySnapshot.forEach((doc) => {
              const data = doc.data();
              roadmaps.push({
                  id: doc.id,
                  fieldOfInterest: data.fieldOfInterest,
                  advice: data.advice,
                  roadmap: data.roadmap,
                  createdAt: data.createdAt.toDate(),
              });
          });
          setSavedRoadmaps(roadmaps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
          setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [user]);


  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Your Dashboard</h1>
            <Link href="/generate">
                <Button size="lg">
                    <PlusCircle className="mr-2" />
                    Generate New Roadmap
                </Button>
            </Link>
        </div>

        {savedRoadmaps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRoadmaps.map((roadmap) => (
                    <SavedRoadmapCard key={roadmap.id} savedRoadmap={roadmap} />
                ))}
            </div>
        ) : (
            <Card className="text-center p-12 border-2 border-dashed">
                <CardHeader>
                    <CardTitle className="text-2xl">No Saved Roadmaps Yet</CardTitle>
                    <CardDescription className="text-lg">
                        You haven't saved any roadmaps. Click the button above to generate your first one!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Link href="/generate">
                        <Button size="lg" variant="outline">
                            <PlusCircle className="mr-2" />
                            Get Started
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

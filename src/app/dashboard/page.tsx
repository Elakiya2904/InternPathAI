
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, BrainCircuit, ListTodo, BookOpen, Lightbulb, type LucideIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';


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
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const handleCardClick = () => {
        if (!user) return;
        
        const key = `internpath-roadmap-${user.uid}`;
        const dataToStore = {
            roadmapData: {
                roadmap: savedRoadmap.roadmap.map(step => ({ ...step, isCompleted: false })), // Reset completion state for viewing
                advice: savedRoadmap.advice,
            },
            userInput: {
                fieldOfInterest: [savedRoadmap.fieldOfInterest],
                technologiesKnown: [], // This info isn't saved, so default to empty
            },
            roadmapContext: {
                fieldOfInterest: [savedRoadmap.fieldOfInterest],
            },
        };
        
        localStorage.setItem(key, JSON.stringify(dataToStore));
        router.push('/generate');
    };
    
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;

        try {
            const roadmapRef = doc(db, 'users', user.uid, 'roadmaps', savedRoadmap.id);
            await deleteDoc(roadmapRef);
            toast({
                title: "Success",
                description: "Roadmap deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting roadmap:", error);
            toast({
                title: "Error",
                description: "Failed to delete roadmap. Please try again.",
                variant: "destructive"
            })
        }
    };
    
    const Icon = iconMap[savedRoadmap.roadmap[0]?.icon] || BrainCircuit;
    return (
        <Card className="shadow-lg border-2 border-border transition-all hover:border-primary h-full flex flex-col">
            <div onClick={handleCardClick} className="cursor-pointer flex-grow">
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
                    <Accordion type="single" collapsible onClick={(e) => e.stopPropagation()}>
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
            </div>
            <div className="p-4 pt-0 mt-auto">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="mr-2" /> Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                "{savedRoadmap.fieldOfInterest}" roadmap.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
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
      }, (error) => {
          console.error("Error fetching roadmaps:", error);
          setSavedRoadmaps([]);
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
                        You haven't generated any roadmaps. Click the button above to generate your first one!
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

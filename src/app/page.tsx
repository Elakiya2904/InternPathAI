
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Sparkles, ListTodo, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-card/50 p-6 rounded-lg border-2 border-border text-center flex flex-col items-center">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
)

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  if (loading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
        <section className="text-center py-20 px-4">
            <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4">
                Your AI-Powered Internship Roadmap
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Stop guessing. Start learning. InternPathAI creates a personalized, step-by-step learning plan to land your dream internship.
            </p>
            <div className="flex justify-center gap-4">
                <Link href="/signup">
                    <Button size="lg" className="text-lg py-7 px-8">
                        Get Your Free Roadmap <ArrowRight className="ml-2" />
                    </Button>
                </Link>
            </div>
        </section>

        <section className="py-20 px-4 bg-secondary/30">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <Image src="https://placehold.co/600x400" data-ai-hint="learning path" alt="Roadmap visualization" width={600} height={400} className="rounded-lg shadow-2xl" />
                    </div>
                    <div>
                        <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <ul className="space-y-6 text-lg">
                            <li className="flex items-start gap-4">
                                <div className="text-2xl font-bold text-primary">1.</div>
                                <div>
                                    <h3 className="font-bold">Tell Us Your Goal</h3>
                                    <p className="text-muted-foreground">Specify your field of interest (e.g., Frontend, AI/ML) and the technologies you already know.</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-4">
                                <div className="text-2xl font-bold text-primary">2.</div>
                                <div>
                                    <h3 className="font-bold">Get a Custom Plan</h3>
                                    <p className="text-muted-foreground">Our AI analyzes your profile and generates a unique learning path with specific tasks, resources, and projects.</p>
                                </div>
                            </li>
                             <li className="flex items-start gap-4">
                                <div className="text-2xl font-bold text-primary">3.</div>
                                <div>
                                    <h3 className="font-bold">Track & Achieve</h3>
                                    <p className="text-muted-foreground">Save your roadmap, track your progress, and get matched with relevant internship opportunities.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        
        <section className="py-20 px-4">
             <div className="container mx-auto text-center">
                <h2 className="font-headline text-3xl md:text-4xl font-bold mb-10">Features Designed For Your Success</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <FeatureCard 
                        icon={<BrainCircuit size={40} />}
                        title="Personalized Paths"
                        description="Roadmaps are tailored to your existing skills and future ambitions, ensuring you learn what's most important."
                    />
                    <FeatureCard 
                        icon={<Sparkles size={40} />}
                        title="AI-Powered Advice"
                        description="Get strategic advice and insights on how to navigate your career path and stand out to recruiters."
                    />
                    <FeatureCard 
                        icon={<ListTodo size={40} />}
                        title="Actionable Steps"
                        description="Each roadmap is broken down into concrete tasks, projects, and resources so you always know what to do next."
                    />
                </div>
             </div>
        </section>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { generateSkillsChecklist } from '@/ai/flows/generate-skills-checklist';
import { generatePersonalizedRoadmap, type GeneratePersonalizedRoadmapOutput } from '@/ai/flows/generate-personalized-roadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Wand2, ArrowRight, BrainCircuit, Briefcase, PlusCircle, Sparkles, LucideIcon, ListTodo, BookOpen, Lightbulb, Code, Milestone, Database, Server, CheckCircle, Lock, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoginDialog } from '@/components/login-dialog';

const userInputSchema = z.object({
  fieldOfInterest: z.array(z.string()).min(1, 'Field of interest is required').max(1, 'Please select only one field of interest.'),
  technologiesKnown: z.array(z.string()),
});

const roadmapContextSchema = z.object({
    fieldOfInterest: z.array(z.string()).min(1, 'Field of interest is required').max(1, 'Please select only one field of interest.'),
});

type UserInput = z.infer<typeof userInputSchema>;
type RoadmapContext = z.infer<typeof roadmapContextSchema>;

const internships = [
    { title: 'Frontend Developer Intern', company: 'Vercel', link: 'https://vercel.com/careers', dataAiHint: "frontend developer" },
    { title: 'Full-stack Engineer Intern', company: 'Firebase', link: 'https://careers.google.com/teams/firebase/', dataAiHint: "full stack" },
    { title: 'AI/ML Research Intern', company: 'Google DeepMind', link: 'https://deepmind.google/careers/', dataAiHint: "AI research" },
    { title: 'Product Manager Intern', company: 'Stripe', link: 'https://stripe.com/jobs/search?role=intern', dataAiHint: "product manager" },
];

const iconMap: { [key: string]: LucideIcon } = {
  Code,
  BookOpen,
  Milestone,
  Database,
  Server,
  BrainCircuit,
  ListTodo,
  Lightbulb,
  CheckCircle,
};

type RoadmapStepWithCompletion = GeneratePersonalizedRoadmapOutput['roadmap'][0] & { isCompleted: boolean; };

type StoredRoadmap = {
    roadmapData: { roadmap: RoadmapStepWithCompletion[], advice: string };
    userInput: UserInput;
    roadmapContext: RoadmapContext;
};

const RoadmapDetailCard = ({ 
  detail,
  onComplete,
  isLocked,
  index,
}: { 
  detail: RoadmapStepWithCompletion,
  onComplete: (index: number) => void,
  isLocked: boolean,
  index: number
}) => {
  const Icon = iconMap[detail.icon] || BrainCircuit;
  const { user } = useAuth();
  
  const handleComplete = () => {
    onComplete(index);
  };

  return (
    <AccordionItem value={detail.title} className="border-2 rounded-lg shadow-2xl shadow-primary/10 mb-4 bg-card" disabled={isLocked && !!user}>
      <AccordionTrigger className="p-6 text-left hover:no-underline" disabled={isLocked && !!user}>
        <div className="w-full">
            <CardTitle as="h3" className="text-2xl flex items-center gap-3">
              {(isLocked && !!user) ? <Lock className="w-8 h-8 text-muted-foreground" /> : <Icon className="w-8 h-8 text-primary" />}
              {detail.title}
              {detail.isCompleted && <CheckCircle className="w-7 h-7 text-green-500" />}
            </CardTitle>
            <CardDescription className="text-base mt-2">{detail.description}</CardDescription>
            {user && <Progress value={detail.isCompleted ? 100 : 0} className="mt-4 h-2" />}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <CardContent className="space-y-6 pt-0">
          <div>
            <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><ListTodo /> Tasks</h4>
            <ul className="space-y-3">
              {detail.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-md">
                  <div className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{task.subTaskTitle}</p>
                    <p className="text-muted-foreground text-sm">{task.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><BookOpen /> Resources</h4>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground pl-2">
              {detail.resources.map((resource, i) => <li key={i} className="mb-1">{resource}</li>)}
            </ul>
          </div>
          <Separator />
          <div>
            <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><Lightbulb /> Project Idea</h4>
            <p className="text-muted-foreground p-4 bg-secondary/50 rounded-md border border-border">{detail.project}</p>
          </div>
          {!!user && (
            <>
            <Separator />
            {!detail.isCompleted && (
                <div>
                    <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-primary"><CheckCircle /> Complete Step</h4>
                    <div className="p-4 bg-secondary/50 rounded-md border border-border space-y-4">
                        <p className="text-muted-foreground">Mark this step as completed to unlock the next one.</p>
                        <Button onClick={handleComplete}>Mark as Complete</Button>
                    </div>
                </div>
            )}
            {detail.isCompleted && (
                <div>
                <h4 className="font-bold text-xl mb-3 flex items-center gap-2 text-green-500"><CheckCircle /> Step Completed</h4>
                <div className="p-4 bg-green-500/10 rounded-md border border-green-500/30">
                    <p className="font-semibold text-green-400">Great job! Keep up the momentum.</p>
                </div>
                </div>
            )}
            </>
          )}
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function GenerateRoadmapPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'checklist' | 'roadmap'>('input');
  const [loading, setLoading] = useState(false);
  const [skillsChecklist, setSkillsChecklist] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [additionalSkill, setAdditionalSkill] = useState('');
  const [roadmapData, setRoadmapData] = useState<{ roadmap: RoadmapStepWithCompletion[], advice: string } | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [roadmapContext, setRoadmapContext] = useState<RoadmapContext | null>(null);
  const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
  const [pendingRoadmapGeneration, setPendingRoadmapGeneration] = useState<RoadmapContext | null>(null);


  const { toast } = useToast();
  
  const LOCAL_STORAGE_KEY = 'internpath-roadmap';
  const router = useRouter();

  const form = useForm<UserInput>({
    resolver: zodResolver(userInputSchema),
    defaultValues: {
      fieldOfInterest: [],
      technologiesKnown: [],
    },
  });

  const contextForm = useForm<RoadmapContext>({
      resolver: zodResolver(roadmapContextSchema),
      defaultValues: {
          fieldOfInterest: [],
      },
  });
  
  const getStoredData = () => {
    const key = user ? `${LOCAL_STORAGE_KEY}-${user.uid}` : LOCAL_STORAGE_KEY;
    const savedRoadmap = localStorage.getItem(key);
    if (savedRoadmap) {
        try {
            const { roadmapData: loadedData, userInput: loadedInput, roadmapContext: loadedContext }: StoredRoadmap = JSON.parse(savedRoadmap);
            setRoadmapData(loadedData);
            setUserInput(loadedInput);
            setRoadmapContext(loadedContext);
            setStep('roadmap');
        } catch (error) {
            console.error("Failed to parse saved roadmap from localStorage", error);
            localStorage.removeItem(key);
        }
    }
  }

  useEffect(() => {
    getStoredData();
  }, [user]);

  useEffect(() => {
    if (roadmapData && userInput && roadmapContext) {
        const key = user ? `${LOCAL_STORAGE_KEY}-${user.uid}` : LOCAL_STORAGE_KEY;
        const dataToStore: StoredRoadmap = {
            roadmapData,
            userInput,
            roadmapContext,
        };
        localStorage.setItem(key, JSON.stringify(dataToStore));
    }
  }, [roadmapData, userInput, roadmapContext, user]);

  const recommendedFields = [
      { value: 'AI/ML', label: 'AI/ML' },
      { value: 'Frontend Development', label: 'Frontend Development' },
      { value: 'Full Stack Development', label: 'Full Stack Development' },
      { value: 'Product Management', label: 'Product Management' },
      { value: 'Data Science', label: 'Data Science' },
      { value: 'UI/UX Design', label: 'UI/UX Design' },
  ];
  
  const knownTechnologies = [
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'React', label: 'React' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'Tailwind CSS', label: 'Tailwind CSS' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Python', label: 'Python' },
    { value: 'SQL', label: 'SQL' },
    { value: 'NoSQL', label: 'NoSQL' },
    { value: 'Git', label: 'Git' },
  ];

  const handleGenerateChecklist = async (data: UserInput) => {
    setLoading(true);
    setUserInput(data);
    try {
      const result = await generateSkillsChecklist({
        fieldOfInterest: data.fieldOfInterest[0],
        technologiesKnown: data.technologiesKnown.join(', '),
      });
      setSkillsChecklist(result.skillsChecklist);
      setSelectedSkills(result.skillsChecklist);
      contextForm.setValue('fieldOfInterest', data.fieldOfInterest);
      setStep('checklist');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate skills checklist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSkill = () => {
    if (additionalSkill && !selectedSkills.includes(additionalSkill)) {
      const updatedSkills = [...selectedSkills, additionalSkill];
      setSelectedSkills(updatedSkills);
      if (!skillsChecklist.includes(additionalSkill)) {
        setSkillsChecklist(updatedSkills);
      }
      setAdditionalSkill('');
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };
  
  const handleGenerateRoadmap = async (data: RoadmapContext) => {
      if (!user) {
        setPendingRoadmapGeneration(data);
        setLoginDialogOpen(true);
        return;
      }
      if (!userInput) return;
      setLoading(true);
      setRoadmapContext(data);
      try {
        const result = await generatePersonalizedRoadmap({
          fieldOfInterest: data.fieldOfInterest[0],
          selectedSkills,
          additionalSkills: skillsChecklist.filter(s => !selectedSkills.includes(s)),
        });
        const roadmapWithCompletion = result.roadmap.map(step => ({
          ...step,
          isCompleted: false,
        }));
        setRoadmapData({ ...result, roadmap: roadmapWithCompletion });
        setStep('roadmap');
        
        if (user) {
            try {
                const roadmapsRef = collection(db, 'users', user.uid, 'roadmaps');
                await addDoc(roadmapsRef, {
                    fieldOfInterest: data.fieldOfInterest[0],
                    roadmap: result.roadmap,
                    advice: result.advice,
                    createdAt: serverTimestamp(),
                });
            } catch (error) {
                 console.error("Error saving roadmap to Firestore:", error);
                 toast({
                    title: 'Warning',
                    description: 'Could not save your roadmap. It will be available in this session but will not be saved to your account.',
                    variant: 'destructive'
                 })
            }
        }

      } catch (error) {
        console.error(error);
         toast({
          title: 'Error',
          description: 'Failed to generate your roadmap. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
  };

  const onLoginSuccess = () => {
    setLoginDialogOpen(false);
    if(pendingRoadmapGeneration) {
        handleGenerateRoadmap(pendingRoadmapGeneration);
        setPendingRoadmapGeneration(null);
    }
  }


  const handleCompleteStep = (index: number) => {
      if (roadmapData) {
        const newRoadmap = [...roadmapData.roadmap];
        newRoadmap[index].isCompleted = true;
        setRoadmapData({ ...roadmapData, roadmap: newRoadmap });
      }
  };
  
  const handleStartOver = () => {
    const key = user ? `${LOCAL_STORAGE_KEY}-${user.uid}` : LOCAL_STORAGE_KEY;
    localStorage.removeItem(key);

    setStep('input');
    setRoadmapData(null);
    setUserInput(null);
    setRoadmapContext(null);
    setSkillsChecklist([]);
    setSelectedSkills([]);
    form.reset();
    contextForm.reset();
  };

  return (
    <div className="flex-grow flex flex-col items-center p-4 sm:p-8">
      <LoginDialog open={isLoginDialogOpen} onOpenChange={setLoginDialogOpen} onSuccess={onLoginSuccess} />
      <div className="w-full max-w-4xl xl:max-w-5xl animate-in fade-in-50 duration-500">
        
        {step === 'input' && (
          <Card className="shadow-2xl shadow-primary/10 border-2">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl md:text-4xl">Welcome to InternPathAI</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">Let's craft your personalized internship roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerateChecklist)} className="space-y-8">
                  <FormField
                      control={form.control}
                      name="fieldOfInterest"
                      render={({ field }) => (
                      <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-semibold">What's your primary field of interest?</FormLabel>
                          <MultiSelectCombobox
                              options={recommendedFields}
                              selected={field.value}
                              onChange={field.onChange}
                              placeholder="Select or type a field..."
                              inputPlaceholder="Search or add a new field..."
                              mode="single"
                          />
                          <FormMessage />
                      </FormItem>
                      )}
                  />

                  <FormField
                    control={form.control}
                    name="technologiesKnown"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base font-semibold">What technologies do you already know?</FormLabel>
                          <FormDescription>Select all that apply.</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 p-4 border rounded-md">
                          {knownTechnologies.map((tech) => (
                            <FormField
                              key={tech.value}
                              control={form.control}
                              name="technologiesKnown"
                              render={({ field }) => (
                                <FormItem
                                  key={tech.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tech.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), tech.value])
                                          : field.onChange(
                                              (field.value || [])?.filter(
                                                (value) => value !== tech.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {tech.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <Button type="submit" disabled={loading} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-7">
                      {loading ? <Loader2 className="animate-spin" /> : "Generate Skills Checklist"}
                      {!loading && <ArrowRight className="ml-2" />}
                    </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {step === 'checklist' && (
          <Card className="shadow-2xl shadow-primary/10 border-2">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                <ListTodo className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-3xl md:text-4xl">Review Your Skills</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                We've generated a list of skills. Refine them and tell us your main goal.
              </CardDescription>
            </CardHeader>
            <Form {...contextForm}>
                <form onSubmit={contextForm.handleSubmit(handleGenerateRoadmap)}>
                    <CardContent className="space-y-6">
                        <FormField
                            control={contextForm.control}
                            name="fieldOfInterest"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-base font-semibold">Confirm your primary field of interest</FormLabel>
                                <MultiSelectCombobox
                                    options={recommendedFields}
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select or type a field..."
                                    inputPlaceholder="Search or add a new field..."
                                    mode="single"
                                />
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Separator />
                        <div>
                            <Label className="text-base font-semibold">Select the skills for your roadmap</Label>
                            <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                                {skillsChecklist.map((skill) => (
                                    <div key={skill} className="flex items-center space-x-2 p-3 bg-secondary/50 rounded-md">
                                        <Checkbox
                                            id={skill}
                                            checked={selectedSkills.includes(skill)}
                                            onCheckedChange={() => handleSkillToggle(skill)}
                                        />
                                        <label htmlFor={skill} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
                                            {skill}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="additional-skill" className="font-semibold">Add a missing skill</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="additional-skill"
                                    value={additionalSkill}
                                    onChange={(e) => setAdditionalSkill(e.target.value)}
                                    placeholder="e.g., GraphQL"
                                />
                                <Button onClick={handleAddSkill} variant="outline" type="button"><PlusCircle className="mr-2" /> Add</Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-4">
                        <Button type="submit" disabled={loading || selectedSkills.length === 0} size="lg" className="w-full sm:w-auto flex-grow bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-7">
                            {loading ? <Loader2 className="animate-spin" /> : "Generate My Roadmap"}
                            {!loading && <ArrowRight className="ml-2" />}
                        </Button>
                        <Button onClick={() => setStep('input')} variant="outline" size="lg" className="w-full sm:w-auto" type="button">
                            Back
                        </Button>
                    </CardFooter>
                </form>
            </Form>
          </Card>
        )}


        {step === 'roadmap' && roadmapData && (
           <div className="space-y-8 w-full">
             <div className="text-center mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="font-headline text-3xl font-bold flex items-center justify-center sm:justify-start gap-3"><Wand2 className="text-primary" /> Your Detailed Roadmap</h2>
                    <p className="text-lg text-muted-foreground mt-2">Here is your step-by-step plan to prepare for your dream internship.</p>
                </div>
                <Button onClick={handleStartOver} variant="outline" size="lg">
                    <RotateCcw />
                    Start Over
                </Button>
             </div>
            
            <Accordion type="single" collapsible className="w-full space-y-4">
              {roadmapData.roadmap.map((detail, index) => (
                <RoadmapDetailCard
                    key={index}
                    detail={detail}
                    onComplete={handleCompleteStep}
                    isLocked={index > 0 && !!user && !roadmapData.roadmap[index - 1].isCompleted}
                    index={index}
                />
              ))}
            </Accordion>

            <Card className="shadow-2xl shadow-primary/10 border-2">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3"><Sparkles className="text-primary" /> AI-Powered Advice</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none prose-p:text-lg prose-headings:text-primary prose-strong:text-foreground">
                    <ReactMarkdown>{roadmapData.advice}</ReactMarkdown>
                </CardContent>
            </Card>

            <Card className="shadow-2xl shadow-primary/10 border-2">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3"><Briefcase className="text-primary" /> Internship Recommendations</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">Check out these opportunities that align with your skills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        {internships.map(internship => (
                          <a key={internship.title} href={internship.link} target="_blank" rel="noopener noreferrer" className="block p-4 border-2 bg-card hover:bg-secondary/50 rounded-lg transition-colors group">
                            <h4 className="font-bold text-lg text-primary group-hover:text-accent-foreground transition-colors">{internship.title}</h4>
                            <p className="text-muted-foreground">{internship.company}</p>
                          </a>
                        ))}
                    </div>
                </CardContent>
            </Card>
           </div>
        )}
      </div>
    </div>
  );
}

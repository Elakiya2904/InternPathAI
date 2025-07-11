
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { generateSkillsChecklist, type GenerateSkillsChecklistOutput } from '@/ai/flows/generate-skills-checklist';
import { generatePersonalizedRoadmap, type GeneratePersonalizedRoadmapOutput } from '@/ai/flows/generate-personalized-roadmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Wand2, ArrowRight, BrainCircuit, Briefcase, PlusCircle, Sparkles, type LucideIcon, icons, CheckCircle, ListTodo, BookOpen, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const userInputSchema = z.object({
  fieldOfInterest: z.string({
    required_error: "Please select or enter a field of interest."
  }).min(1, 'Field of interest is required'),
  technologiesKnown: z.string().min(2, 'Please list at least one technology'),
});

type UserInput = z.infer<typeof userInputSchema>;

const internships = [
    { title: 'Frontend Developer Intern', company: 'Vercel', link: 'https://vercel.com/careers', dataAiHint: "frontend developer" },
    { title: 'Full-stack Engineer Intern', company: 'Firebase', link: 'https://careers.google.com/teams/firebase/', dataAiHint: "full stack" },
    { title: 'AI/ML Research Intern', company: 'Google DeepMind', link: 'https://deepmind.google/careers/', dataAiHint: "AI research" },
    { title: 'Product Manager Intern', company: 'Stripe', link: 'https://stripe.com/jobs/search?role=intern', dataAiHint: "product manager" },
];

const RoadmapStep = ({ step, isLast }: { step: GeneratePersonalizedRoadmapOutput['roadmap'][0], isLast: boolean }) => {
  const Icon = icons[step.icon as keyof typeof icons] as LucideIcon || BrainCircuit;

  return (
    <div className="relative flex items-start">
        <div className="flex-shrink-0 w-24 flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center border-2 border-primary/20">
                <Icon className="w-6 h-6" />
            </div>
            {!isLast && <div className="mt-2 w-0.5 h-full min-h-24 bg-primary/20" />}
        </div>
        <div className="ml-4 -mt-2 w-full">
             <Card className="bg-accent/80 border-2 border-foreground rounded-lg shadow-md mb-8">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-accent-foreground flex items-center justify-between">
                        {step.title}
                        <CheckCircle className="w-6 h-6 text-primary" />
                    </CardTitle>
                    <CardDescription className="text-accent-foreground/80">{step.description}</CardDescription>
                </CardHeader>
                <Accordion type="single" collapsible className="w-full bg-card rounded-b-lg">
                    <AccordionItem value="item-1" className="border-t-2 border-foreground">
                        <AccordionContent className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary"><ListTodo/> Tasks</h4>
                                    <ul className="space-y-3">
                                        {step.tasks.map((task, i) => (
                                            <li key={i} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-md">
                                                <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">{task.subTaskTitle}</p>
                                                    <p className="text-muted-foreground text-sm">{task.description}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary"><BookOpen/> Resources</h4>
                                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                                        {step.resources.map((resource, i) => <li key={i}>{resource}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-primary"><Lightbulb/> Project Idea</h4>
                                    <p className="text-muted-foreground">{step.project}</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
             </Card>
        </div>
    </div>
  );
};


export default function Home() {
  const [step, setStep] = useState<'input' | 'checklist' | 'roadmap'>('input');
  const [loading, setLoading] = useState(false);
  const [skillsData, setSkillsData] = useState<GenerateSkillsChecklistOutput | null>(null);
  const [roadmapData, setRoadmapData] = useState<GeneratePersonalizedRoadmapOutput | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [additionalSkill, setAdditionalSkill] = useState('');
  const [additionalSkillsList, setAdditionalSkillsList] = useState<string[]>([]);
  
  const { toast } = useToast();

  const recommendedFields = [
      { value: 'AI/ML', label: 'AI/ML' },
      { value: 'Frontend Development', label: 'Frontend Development' },
      { value: 'Full Stack Development', label: 'Full Stack Development' },
      { value: 'Product Management', label: 'Product Management' },
      { value: 'Data Science', label: 'Data Science' },
      { value: 'UI/UX Design', label: 'UI/UX Design' },
  ];

  const form = useForm<UserInput>({
    resolver: zodResolver(userInputSchema),
    defaultValues: {
      fieldOfInterest: '',
      technologiesKnown: '',
    },
  });

  const handleGenerateChecklist = async (data: UserInput) => {
    setLoading(true);
    setUserInput(data);
    try {
      const result = await generateSkillsChecklist(data);
      setSkillsData(result);
      setSelectedSkills(result.skillsChecklist);
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
  
  const handleAddAdditionalSkill = () => {
    if (additionalSkill.trim() && !additionalSkillsList.includes(additionalSkill.trim())) {
      setAdditionalSkillsList([...additionalSkillsList, additionalSkill.trim()]);
      setAdditionalSkill('');
    }
  };

  const handleGenerateRoadmap = async () => {
    if (selectedSkills.length === 0 && additionalSkillsList.length === 0) {
      toast({
        title: 'No Skills Selected',
        description: 'Please select or add at least one skill to generate a roadmap.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      if (!userInput) throw new Error('User input is missing');
      const result = await generatePersonalizedRoadmap({
        fieldOfInterest: userInput.fieldOfInterest,
        selectedSkills: selectedSkills,
        additionalSkills: additionalSkillsList,
      });
      setRoadmapData(result);
      setStep('roadmap');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate roadmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };
  
  const resetApp = () => {
    setStep('input');
    setLoading(false);
    setSkillsData(null);
    setRoadmapData(null);
    setUserInput(null);
    setSelectedSkills([]);
    setAdditionalSkill('');
    setAdditionalSkillsList([]);
    form.reset();
  }

  const AppHeader = () => (
    <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <BrainCircuit className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-foreground">InternPathAI</h1>
      </div>
       {step !== 'input' && (
        <Button variant="ghost" onClick={resetApp}>Start Over</Button>
      )}
    </header>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl animate-in fade-in-50 duration-500">
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
                  <form onSubmit={form.handleSubmit(handleGenerateChecklist)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fieldOfInterest"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base">What's your field of interest?</FormLabel>
                           <Combobox
                              options={recommendedFields}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select or type a field..."
                              inputPlaceholder="Search or add a new field..."
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
                          <FormLabel className="text-base">What technologies do you know?</FormLabel>
                          <FormControl>
                            <Input className="py-6 text-base" placeholder="e.g., React, Python, TensorFlow" {...field} />
                          </FormControl>
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

          {step === 'checklist' && skillsData && (
            <Card className="shadow-2xl shadow-primary/10 border-2">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">Customize Your Skillset</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">Select the skills you want to focus on. We've suggested some based on your interests.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-primary">Suggested Skills</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {skillsData.skillsChecklist.map((skill) => (
                      <div key={skill} className="flex items-center space-x-3 p-3 bg-card border-2 border-foreground/30 rounded-lg transition-all has-[:checked]:bg-primary/10 has-[:checked]:ring-2 has-[:checked]:ring-primary">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor={skill}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-2 text-primary">Add More Skills</h3>
                   <div className="flex gap-2">
                      <Input
                        value={additionalSkill}
                        onChange={(e) => setAdditionalSkill(e.target.value)}
                        placeholder="e.g., Docker, Kubernetes"
                        onKeyDown={(e) => {if (e.key === 'Enter') { e.preventDefault(); handleAddAdditionalSkill();}}}
                        className="py-6 text-base"
                      />
                      <Button onClick={handleAddAdditionalSkill} variant="outline" size="lg"><PlusCircle className="w-5 h-5"/></Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {additionalSkillsList.map(skill => <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>)}
                    </div>
                </div>

              </CardContent>
              <CardFooter>
                 <Button onClick={handleGenerateRoadmap} disabled={loading} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-7">
                    {loading ? <Loader2 className="animate-spin" /> : "Create My Personalized Roadmap"}
                     {!loading && <Wand2 className="ml-2" />}
                  </Button>
              </CardFooter>
            </Card>
          )}

          {step === 'roadmap' && roadmapData && (
             <div className="space-y-4">
               <div>
                  <div className="text-center mb-8">
                    <h2 className="font-headline text-3xl font-bold flex items-center justify-center gap-3"><Wand2 className="text-primary" /> Your Personalized Roadmap</h2>
                    <p className="text-lg text-muted-foreground mt-2">Here's a step-by-step guide to help you prepare for your dream internship.</p>
                  </div>
                  <div className="space-y-0">
                    {roadmapData.roadmap.map((step, index) => (
                       <RoadmapStep key={index} step={step} isLast={index === roadmapData.roadmap.length - 1} />
                    ))}
                  </div>
                </div>

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
      </main>
    </div>
  );
}

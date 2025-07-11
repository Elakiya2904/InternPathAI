// use server'
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized roadmap based on selected skills.
 *
 * - generatePersonalizedRoadmap - A function that generates a personalized roadmap.
 * - GeneratePersonalizedRoadmapInput - The input type for the generatePersonalizedRoadmap function.
 * - GeneratePersonalizedRoadmapOutput - The return type for the generatePersonalizedRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedRoadmapInputSchema = z.object({
  selectedSkills: z
    .array(z.string())
    .describe('An array of skills selected by the user.'),
  additionalSkills: z
    .array(z.string())
    .describe('An array of additional skills added by the user.'),
  fieldOfInterest: z.string().describe('The user\'s field of interest.'),
});
export type GeneratePersonalizedRoadmapInput = z.infer<typeof GeneratePersonalizedRoadmapInputSchema>;

const RoadmapSubTaskSchema = z.object({
  subTaskTitle: z.string().describe("The title of the sub-task."),
  description: z.string().describe("A detailed description of the sub-task."),
});

const RoadmapStepSchema = z.object({
  title: z.string().describe("The title of the roadmap step."),
  description: z.string().describe("A high-level description of what this step entails."),
  icon: z.string().describe("A relevant lucide-react icon name for this step (e.g., 'Code', 'BookOpen', 'Milestone')."),
  tasks: z.array(RoadmapSubTaskSchema).describe("A list of specific, actionable sub-tasks for this step."),
  resources: z.array(z.string()).describe("A list of recommended learning resources (e.g., 'Official documentation', 'A specific online course')."),
  project: z.string().describe("A small, relevant project idea to apply the skills learned in this step."),
});

const GeneratePersonalizedRoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapStepSchema).describe('A personalized roadmap with discrete, detailed steps.'),
  advice: z.string().describe('Personalized advice and recommendations for the user.'),
});
export type GeneratePersonalizedRoadmapOutput = z.infer<typeof GeneratePersonalizedRoadmapOutputSchema>;

export async function generatePersonalizedRoadmap(
  input: GeneratePersonalizedRoadmapInput
): Promise<GeneratePersonalizedRoadmapOutput> {
  return generatePersonalizedRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedRoadmapPrompt',
  input: {schema: GeneratePersonalizedRoadmapInputSchema},
  output: {schema: GeneratePersonalizedRoadmapOutputSchema},
  prompt: `You are a career advisor specializing in creating detailed, personalized roadmaps for internships.

You will generate a roadmap with distinct, comprehensive steps to learn the selected skills and prepare for internships in the specified field of interest.

For each step in the roadmap, you must provide:
1.  A clear 'title' and a high-level 'description'.
2.  A single, relevant icon name from the lucide-react library for the 'icon' field.
3.  A list of 'tasks', where each task has a 'subTaskTitle' and a 'description'. These should be specific, actionable items.
4.  A list of 'resources' as strings, suggesting where the user can learn (e.g., 'Official React Docs', 'freeCodeCamp YouTube channel').
5.  A single, relevant 'project' idea that allows the user to apply the skills from this step.

Finally, you will also provide overall personalized 'advice' and recommendations to the user based on their profile.

Selected Skills: {{selectedSkills}}
Additional Skills: {{additionalSkills}}
Field of Interest: {{fieldOfInterest}}`,
});

const generatePersonalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRoadmapFlow',
    inputSchema: GeneratePersonalizedRoadmapInputSchema,
    outputSchema: GeneratePersonalizedRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

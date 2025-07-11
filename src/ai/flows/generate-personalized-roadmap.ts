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

const GeneratePersonalizedRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('A personalized roadmap with steps and resources.'),
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
  prompt: `You are a career advisor specializing in creating personalized roadmaps for internships.

You will generate a roadmap with steps and resources to learn the selected skills and prepare for internships in the specified field of interest.

You will also provide personalized advice and recommendations to the user.

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

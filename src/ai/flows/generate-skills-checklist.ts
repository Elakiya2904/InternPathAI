
'use server';

/**
 * @fileOverview Generates a checklist of relevant skills based on the user's field of interest and known technologies.
 *
 * - generateSkillsChecklist - A function that generates the skills checklist.
 * - GenerateSkillsChecklistInput - The input type for the generateSkillsChecklist function.
 * - GenerateSkillsChecklistOutput - The return type for the generateSkillsChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSkillsChecklistInputSchema = z.object({
  fieldOfInterest: z
    .string()
    .describe("The user's field of interest for internships. Can be a general category like 'Technology' if not specified by the user yet."),
  technologiesKnown: z
    .string()
    .describe('A comma-separated string of technologies that the user already knows.'),
});
export type GenerateSkillsChecklistInput = z.infer<
  typeof GenerateSkillsChecklistInputSchema
>;

const GenerateSkillsChecklistOutputSchema = z.object({
  skillsChecklist: z
    .array(z.string())
    .describe('A checklist of skills relevant to the field of interest and technologies known. This should include both the technologies the user knows and other relevant skills they should learn.'),
});
export type GenerateSkillsChecklistOutput = z.infer<
  typeof GenerateSkillsChecklistOutputSchema
>;

export async function generateSkillsChecklist(
  input: GenerateSkillsChecklistInput
): Promise<GenerateSkillsChecklistOutput> {
  return generateSkillsChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSkillsChecklistPrompt',
  input: {schema: GenerateSkillsChecklistInputSchema},
  output: {schema: GenerateSkillsChecklistOutputSchema},
  prompt: `You are an AI career advisor. Based on a user's known technologies, generate a comprehensive checklist of skills they should learn to be prepared for internships in their field of interest.

The list should include the technologies they already know, as well as other foundational and advanced skills relevant to their field.

Return the skills checklist as a JSON array of strings.

Field of Interest: {{{fieldOfInterest}}}
Technologies Known: {{{technologiesKnown}}}`,
});

const generateSkillsChecklistFlow = ai.defineFlow(
  {
    name: 'generateSkillsChecklistFlow',
    inputSchema: GenerateSkillsChecklistInputSchema,
    outputSchema: GenerateSkillsChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

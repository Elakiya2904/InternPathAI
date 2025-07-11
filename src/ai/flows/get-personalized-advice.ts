// 'use server';

/**
 * @fileOverview Provides personalized career advice based on user inputs.
 *
 * - getPersonalizedAdvice - A function to generate personalized advice.
 * - PersonalizedAdviceInput - Input type for personalized advice.
 * - PersonalizedAdviceOutput - Output type for personalized advice.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAdviceInputSchema = z.object({
  selectedSkills: z
    .array(z.string())
    .describe('List of skills the user has selected.'),
  roadmap: z.string().describe('The generated roadmap for the user.'),
  internshipInterests: z
    .string()
    .describe('The user\'s stated internship interests.'),
});
export type PersonalizedAdviceInput = z.infer<typeof PersonalizedAdviceInputSchema>;

const PersonalizedAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized career advice and recommendations.'),
});
export type PersonalizedAdviceOutput = z.infer<typeof PersonalizedAdviceOutputSchema>;

export async function getPersonalizedAdvice(
  input: PersonalizedAdviceInput
): Promise<PersonalizedAdviceOutput> {
  return getPersonalizedAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedAdvicePrompt',
  input: {schema: PersonalizedAdviceInputSchema},
  output: {schema: PersonalizedAdviceOutputSchema},
  prompt: `You are a career advisor providing personalized advice based on the user's skills, roadmap, and internship interests.

Skills: {{{selectedSkills}}}
Roadmap: {{{roadmap}}}
Internship Interests: {{{internshipInterests}}}

Provide personalized advice and recommendations to help the user make informed decisions about their career path. Consider their skills, roadmap, and interests to give the best possible guidance.
`,
});

const getPersonalizedAdviceFlow = ai.defineFlow(
  {
    name: 'getPersonalizedAdviceFlow',
    inputSchema: PersonalizedAdviceInputSchema,
    outputSchema: PersonalizedAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

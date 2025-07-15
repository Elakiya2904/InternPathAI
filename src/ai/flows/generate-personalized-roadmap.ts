
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
  icon: z.string().describe("A relevant lucide-react icon name for this step (e.g., 'Code', 'BookOpen', 'Milestone', 'Database', 'Server')."),
  tasks: z.array(RoadmapSubTaskSchema).describe("A list of specific, actionable sub-tasks for this step."),
  resources: z.array(z.string()).describe("A list of recommended learning resources (e.g., 'Official documentation', 'A specific online course')."),
  project: z.string().describe("A small, relevant project idea to apply the skills learned in this step."),
});

const GeneratePersonalizedRoadmapOutputSchema = z.object({
  roadmap: z.array(RoadmapStepSchema).describe('A personalized roadmap with discrete, detailed steps.'),
  advice: z.string().describe('Personalized advice and recommendations for the user.'),
});
export type GeneratePersonalizedRoadmapOutput = z.infer<typeof GeneratePersonalizedRoadmapOutputSchema>;


const getMockRoadmap = async (input: GeneratePersonalizedRoadmapInput): Promise<GeneratePersonalizedRoadmapOutput> => {
    // Simulate a longer delay for the main generation
    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockRoadmap = input.selectedSkills.map(skill => ({
        title: skill,
        description: `This step focuses on learning ${skill}. It is a crucial skill for any ${input.fieldOfInterest}.`,
        icon: 'Code',
        tasks: [
            { subTaskTitle: `Learn the basics of ${skill}`, description: 'Understand the core concepts and syntax.' },
            { subTaskTitle: `Build a simple project with ${skill}`, description: 'Apply your knowledge to a practical example.' },
            { subTaskTitle: 'Explore advanced topics', description: `Dive deeper into ${skill} to become proficient.` },
        ],
        resources: [`Official ${skill} Documentation`, 'freeCodeCamp on YouTube', 'MDN Web Docs'],
        project: `Create a simple portfolio page using ${skill} and other technologies you've learned.`,
    }));

    return {
        roadmap: mockRoadmap,
        advice: `This is a mocked response. To get a real AI-generated roadmap, please add your Google AI API key to the .env file. \n\nBased on your interest in **${input.fieldOfInterest}**, focusing on these skills is a great start. Consistency is key. Try to code a little bit every day. Build projects, even small ones, to solidify your understanding. Network with other developers and don't be afraid to ask questions. Good luck on your journey!`,
    };
}

export async function generatePersonalizedRoadmap(
  input: GeneratePersonalizedRoadmapInput
): Promise<GeneratePersonalizedRoadmapOutput> {
    if (!process.env.GOOGLE_API_KEY) {
        console.log("No GOOGLE_API_KEY found, returning mock data for personalized roadmap.");
        return getMockRoadmap(input);
    }
    
    try {
        return await generatePersonalizedRoadmapFlow(input);
    } catch (error) {
        console.error("Error generating personalized roadmap, returning mock data as fallback.", error);
        return getMockRoadmap(input);
    }
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedRoadmapPrompt',
  input: {schema: GeneratePersonalizedRoadmapInputSchema},
  output: {schema: GeneratePersonalizedRoadmapOutputSchema},
  prompt: `You are a career advisor specializing in creating detailed, personalized learning roadmaps for internships, similar in style to roadmap.sh.

You will generate a roadmap with distinct, comprehensive steps to learn the selected skills and prepare for internships in the specified field of interest.

IMPORTANT: Break down broad skills (e.g., "Frontend Development") into fundamental, individual technologies or concepts (e.g., "HTML", "CSS", "JavaScript"). Each fundamental skill should be its own step in the roadmap. Do not group multiple skills like "HTML, CSS, and JS" into a single step.

For each step in the roadmap, you must provide:
1.  A clear 'title' for the individual skill (e.g., 'HTML', 'CSS', 'React').
2.  A high-level 'description' of what this step entails and why it's important.
3.  A single, relevant icon name from the lucide-react library for the 'icon' field. Choose an icon that best represents the skill (e.g., 'Code' for HTML/CSS/JS, 'Database' for SQL, 'Server' for backend technologies).
4.  A list of 'tasks', where each task has a 'subTaskTitle' and a 'description'. These should be specific, actionable items that guide the user through learning the skill. For example, for CSS, tasks could be "Learn about the box model" or "Practice with Flexbox and Grid".
5.  A comprehensive list of 'resources' as strings, suggesting where the user can learn (e.g., 'Official React Docs', 'freeCodeCamp YouTube channel', 'MDN Web Docs for JavaScript').
6.  A single, relevant 'project' idea that allows the user to apply the skills from this step. The project should be practical and build upon previous steps.

Finally, you will also provide overall personalized 'advice' and recommendations to the user based on their profile. This advice should be encouraging and provide strategic tips for their internship search.

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
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

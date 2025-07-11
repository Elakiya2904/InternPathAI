
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a mind map structure from a list of skills. This flow is currently not used but is kept for potential future use.
 *
 * - generateMindMap - A function that generates the mind map data.
 * - GenerateMindMapInput - The input type for the generateMindMap function.
 * - GenerateMindMapOutput - The return type for the generateMindMap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMindMapInputSchema = z.object({
  fieldOfInterest: z.string().describe("The user's primary field of interest."),
  skills: z.array(z.string()).describe('An array of skills to be organized into a mind map.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const MindMapNodeSchema = z.object({
    id: z.string().describe("A unique identifier for the node (e.g., 'frontend', 'html')."),
    label: z.string().describe("The display text for the node (e.g., 'Frontend Development', 'HTML')."),
});

const MindMapEdgeSchema = z.object({
    id: z.string().describe("A unique identifier for the edge (e.g., 'frontend-html')."),
    source: z.string().describe("The id of the source node."),
    target: z.string().describe("The id of the target node."),
});

const GenerateMindMapOutputSchema = z.object({
  nodes: z.array(MindMapNodeSchema).describe("A list of all nodes in the mind map."),
  edges: z.array(MindMapEdgeSchema).describe("A list of all edges connecting the nodes."),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;

export async function generateMindMap(
  input: GenerateMindMapInput
): Promise<GenerateMindMapOutput> {
  return generateMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapPrompt',
  input: { schema: GenerateMindMapInputSchema },
  output: { schema: GenerateMindMapOutputSchema },
  prompt: `You are an expert at organizing information into structured mind maps. Your task is to take a field of interest and a list of related skills and convert them into a hierarchical mind map structure.

The mind map should have a central root node representing the main field of interest. The skills should be organized logically as child nodes branching from the root or from other intermediate nodes if it makes sense (e.g., 'Frontend' -> 'HTML', 'Frontend' -> 'CSS').

Guidelines:
1.  **Root Node:** Create a single root node for the 'fieldOfInterest'. Its ID should be a simplified version of the label (e.g., 'frontend-development').
2.  **Skill Nodes:** For each skill in the 'skills' array, create a corresponding node.
3.  **Intermediate Nodes:** If a group of skills belong to a clear sub-category (like 'Frontend Basics', 'Styling', 'Core JavaScript'), create an intermediate node for that category.
4.  **Node IDs:** All node IDs must be unique and use kebab-case (e.g., 'html', 'css', 'react-hooks').
5.  **Edges:** Create edges to represent the hierarchy. The root node should be the source for top-level skills or categories.
6.  **Edge IDs:** Edge IDs must be unique and follow the format 'sourceId-targetId'.
7.  **Hierarchy:** Ensure every node except the root has exactly one incoming edge, forming a clear tree structure.

Example:
Input:
- fieldOfInterest: "Frontend Development"
- skills: ["HTML", "CSS", "JavaScript", "React"]

Output Structure:
- nodes: [
    { id: 'frontend-dev', label: 'Frontend Development' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'react', label: 'React' }
  ]
- edges: [
    { id: 'frontend-dev-html', source: 'frontend-dev', target: 'html' },
    { id: 'frontend-dev-css', source: 'frontend-dev', target: 'css' },
    { id: 'frontend-dev-javascript', source: 'frontend-dev', target: 'javascript' },
    { id: 'javascript-react', source: 'javascript', target: 'react' }
  ]

Now, generate the mind map for the following input:

Field of Interest: {{fieldOfInterest}}
Skills: {{#each skills}}'{{this}}' {{/each}}
`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);

    
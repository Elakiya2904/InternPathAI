
'use server';

/**
 * @fileOverview This file defines a Genkit flow for saving a user's generated roadmap to Firestore.
 *
 * - saveRoadmap - A function that saves the roadmap data.
 * - SaveRoadmapInput - The input type for the saveRoadmap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase-admin';

const db = getFirestore(app());

const RoadmapTaskSchema = z.object({
  subTaskTitle: z.string(),
  description: z.string(),
});

const RoadmapStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  tasks: z.array(RoadmapTaskSchema),
  resources: z.array(z.string()),
  project: z.string(),
});

const SaveRoadmapInputSchema = z.object({
  userId: z.string().describe("The user's unique ID."),
  fieldOfInterest: z.string().describe("The user's primary field of interest."),
  roadmap: z.array(RoadmapStepSchema).describe("The personalized roadmap array."),
  advice: z.string().describe("The personalized advice string."),
});
export type SaveRoadmapInput = z.infer<typeof SaveRoadmapInputSchema>;

export async function saveRoadmap(input: SaveRoadmapInput): Promise<{ success: boolean; docId: string }> {
  return saveRoadmapFlow(input);
}

const saveRoadmapFlow = ai.defineFlow(
  {
    name: 'saveRoadmapFlow',
    inputSchema: SaveRoadmapInputSchema,
    outputSchema: z.object({ success: z.boolean(), docId: z.string() }),
  },
  async (input) => {
    try {
      const userRoadmapsCollection = db.collection('users').doc(input.userId).collection('roadmaps');
      
      // Firestore Admin SDK adds a new document and returns a reference
      const newRoadmapRef = await userRoadmapsCollection.add({
        ...input,
        createdAt: new Date(), // Use a standard Date object for the timestamp
      });

      return { success: true, docId: newRoadmapRef.id };
    } catch (error) {
      console.error("Error saving roadmap to Firestore:", error);
      // We can't easily throw an HTTP error here, so we return a failure state.
      // The client-side will need to handle this.
      return { success: false, docId: '' };
    }
  }
);

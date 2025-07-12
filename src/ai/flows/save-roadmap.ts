
'use server';
/**
 * @fileOverview This file defines a Genkit flow for saving a user's roadmap to Firestore.
 * This flow does not interact with an AI model, but uses the flow structure to
 * interact with a server-side service (Firestore).
 *
 * - saveRoadmap - A function that saves roadmap data.
 * - SaveRoadmapInput - The input type for the saveRoadmap function.
 * - SaveRoadmapOutput - The return type for the saveRoadmap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import { app } from '@/lib/firebase'; // Ensure firebase is initialized

const db = getFirestore(app);

// Define schema for the user input part of the roadmap
const UserInputSchema = z.object({
  fieldOfInterest: z.string(),
  technologiesKnown: z.array(z.string()),
});

// Define schema for the generated roadmap data
const RoadmapDataSchema = z.object({
    roadmap: z.array(z.any()), // Keeping this flexible for now
    advice: z.string()
});


export const SaveRoadmapInputSchema = z.object({
  userId: z.string().describe("The user's unique ID from Firebase Auth."),
  userInput: UserInputSchema.describe("The original input from the user."),
  roadmapData: RoadmapDataSchema.describe("The generated roadmap and advice."),
});
export type SaveRoadmapInput = z.infer<typeof SaveRoadmapInputSchema>;

export const SaveRoadmapOutputSchema = z.object({
  success: z.boolean(),
  roadmapId: z.string().optional(),
  error: z.string().optional(),
});
export type SaveRoadmapOutput = z.infer<typeof SaveRoadmapOutputSchema>;

export async function saveRoadmap(
  input: SaveRoadmapInput
): Promise<SaveRoadmapOutput> {
  return saveRoadmapFlow(input);
}


const saveRoadmapFlow = ai.defineFlow(
  {
    name: 'saveRoadmapFlow',
    inputSchema: SaveRoadmapInputSchema,
    outputSchema: SaveRoadmapOutputSchema,
  },
  async (input) => {
    try {
      const { userId, userInput, roadmapData } = input;
      
      // Create a new document in the user's 'roadmaps' subcollection
      const roadmapRef = doc(collection(db, `users/${userId}/roadmaps`));
      
      await setDoc(roadmapRef, {
        userInput,
        roadmapData,
        createdAt: new Date().toISOString(), // Add a timestamp
      });

      return { success: true, roadmapId: roadmapRef.id };
    } catch (error: any) {
      console.error("Error in saveRoadmapFlow: ", error);
      return { success: false, error: error.message || 'An unknown error occurred' };
    }
  }
);

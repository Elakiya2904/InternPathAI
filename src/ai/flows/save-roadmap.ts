
'use server';

/**
 * @fileOverview This file defines a Genkit flow for saving a user's generated roadmap to Firestore.
 *
 * - saveRoadmap - A function that saves the roadmap data.
 * - SaveRoadmapInput - The input type for the saveRoadmap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

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
    let db: admin.firestore.Firestore;

    try {
      if (admin.apps.length === 0) {
          const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT;
          if (!serviceAccountValue) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not set.");
          }
          const serviceAccount = JSON.parse(serviceAccountValue);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          });
      }
      db = admin.firestore();
    } catch (error) {
       console.error("Error initializing Firebase Admin SDK:", error);
       throw new Error("Failed to initialize Firestore. Please check your Firebase service account credentials.");
    }

    try {
      const userRoadmapsCollection = db.collection('users').doc(input.userId).collection('roadmaps');
      
      const newRoadmapRef = await userRoadmapsCollection.add({
        ...input,
        createdAt: new Date(), 
      });

      return { success: true, docId: newRoadmapRef.id };
    } catch (error) {
      console.error("Error saving roadmap to Firestore:", error);
      return { success: false, docId: '' };
    }
  }
);

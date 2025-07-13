
'use server';

/**
 * @fileOverview A server action to save a user's generated roadmap to Firestore.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { type GeneratePersonalizedRoadmapOutput } from './generate-personalized-roadmap';

export interface SaveRoadmapInput {
    userId: string;
    fieldOfInterest: string;
    roadmap: GeneratePersonalizedRoadmapOutput['roadmap'];
    advice: string;
}

export async function saveRoadmap(input: SaveRoadmapInput): Promise<{ success: boolean; id?: string }> {
    if (!input.userId) {
        throw new Error("User is not authenticated.");
    }

    try {
        const userRoadmapsCollection = collection(db, 'users', input.userId, 'roadmaps');
        
        const docRef = await addDoc(userRoadmapsCollection, {
            fieldOfInterest: input.fieldOfInterest,
            roadmap: input.roadmap,
            advice: input.advice,
            createdAt: new Date(),
        });
        
        console.log("Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e: any) {
        console.error("Error adding document: ", e);
        // This error is more helpful for the user to understand the likely cause.
        throw new Error("Failed to save roadmap. This is likely due to Firestore security rules. Please ensure you have deployed the firestore.rules file to your Firebase project.");
    }
}

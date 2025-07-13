
'use server';

/**
 * @fileOverview A server action to save a user's generated roadmap to Firestore using the Firebase Admin SDK.
 */

import { getAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
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
        const adminApp = getAdminApp();
        const db = getFirestore(adminApp);
        
        const userRoadmapsCollection = db.collection('users').doc(input.userId).collection('roadmaps');
        
        const docRef = await userRoadmapsCollection.add({
            fieldOfInterest: input.fieldOfInterest,
            roadmap: input.roadmap,
            advice: input.advice,
            createdAt: new Date(),
        });
        
        console.log("Admin SDK: Document written with ID: ", docRef.id);
        return { success: true, id: docRef.id };
    } catch (e: any) {
        console.error("Error adding document with Admin SDK: ", e);
        // Log the detailed error message from Firebase
        const errorMessage = e.message || 'An unknown error occurred.';
        throw new Error(`Failed to save roadmap via Admin SDK. This might be a server configuration issue. Details: ${errorMessage}`);
    }
}

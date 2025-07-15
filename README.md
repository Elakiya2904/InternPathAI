# InternPathAI

InternPathAI is a web application designed to help students and aspiring professionals generate personalized learning roadmaps for their desired internships. By leveraging the power of generative AI, it creates a step-by-step plan complete with skills to learn, actionable tasks, recommended resources, and relevant project ideas.

![InternPathAI Screenshot](https://placehold.co/800x450)

## Features

- **AI-Powered Roadmap Generation**: Creates detailed, step-by-step learning paths tailored to your career goals.
- **Personalized Skills Checklist**: Analyzes your current knowledge to suggest relevant skills to learn.
- **Interactive Learning Path**: Each step includes specific tasks, project ideas, and curated learning resources.
- **Progress Tracking**: Mark steps as complete and upload certificates to track your journey.
- **User Authentication**: Securely sign up and log in to manage your roadmaps.
- **Dashboard**: View and manage all your generated roadmaps in one place.
- **Responsive Design**: Fully accessible on both desktop and mobile devices.

## Technology Stack

This project is built with a modern, type-safe, and scalable technology stack.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini Models
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Hosting**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or your favorite package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables (Optional):**

    This project can be run **without an API key**. If no key is provided, the application will use mocked AI responses, allowing you to work on the UI and other features without needing access to the Google AI service.

    To enable the full AI capabilities, you will need a Google AI API key.
    
    Create a file named `.env` in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, add your Google AI API key to the `.env` file.
    ```
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
    ```
    The Firebase client-side configuration is already included in `src/lib/firebase.ts`. Make sure your Firebase project has Authentication and Firestore enabled.

### Running the Development Server

The application uses two separate processes for the Next.js frontend and the Genkit AI flows.

1.  **Start the Next.js app:**
    ```bash
    npm run dev
    ```
    This will start the web server, typically on `http://localhost:9002`.

2.  **Start the Genkit development server (in a separate terminal):**
    Genkit runs its own server to expose the AI flows for local testing.
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit development UI, typically on `http://localhost:4000`.

## Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run genkit:dev`: Starts the Genkit development server and UI.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase for errors.
- `npm run typecheck`: Runs the TypeScript compiler to check for type errors.

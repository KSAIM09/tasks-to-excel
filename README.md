# Monthly Tasks Tracker

A simple web application to track daily tasks and export them to Excel. Built with React, Firebase, and Tailwind CSS.

## Features

- Add daily tasks with details like task name, hours spent, description, and status
- View tasks in a monthly calendar view
- Export tasks to Excel for reporting
- Responsive design that works on all devices
- Real-time data synchronization using Firebase

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account (for database)

## Setup Instructions

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd monthly-tasks
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up Firebase
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration object from Project Settings > General > Your Apps

4. Create a `.env` file in the root directory and add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the app for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Tech Stack

- React 18
- Vite
- Firebase (Firestore)
- Tailwind CSS
- React Toastify
- xlsx (for Excel export)

## License

MIT

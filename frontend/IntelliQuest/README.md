# IntelliQuest Frontend

AI-powered question generator application built with React, Vite, and Tailwind CSS.

## Features

- User authentication (Login/Register)
- File upload (PDF, DOCX, TXT)
- AI-powered question generation using Google Gemini
- Question display with answer toggle
- Export questions to text file
- Protected routes
- Modern UI with Tailwind CSS and DaisyUI

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   ├── common/      # Common components
│   ├── layout/      # Layout components
│   ├── sidebar/     # Sidebar components
│   ├── stepper/     # Stepper components
│   └── upload/      # Upload related components
├── context/         # React context providers
├── pages/           # Page components
├── services/        # API services
└── assets/          # Static assets
```

## Environment Variables

No environment variables needed for the frontend. Backend API runs on `http://localhost:5001` by default.

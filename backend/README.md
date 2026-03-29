# IntelliQuest Backend

AI-powered Question Generator API built with Node.js, Express, MongoDB, and Gemini.

## Features

- File upload support: PDF, DOCX, DOC, TXT
- Text extraction from uploaded documents
- OCR fallback for scanned PDFs (pdf2pic + tesseract.js)
- AI question generation with Gemini via LangChain
- Question types: multiple-choice, true-false, short-answer, essay
- Difficulty levels: easy, medium, hard
- Course Outcome mapping support
- User authentication with JWT
- Upload history, rename, and delete endpoints
- Upload progress tracking endpoint

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string
- Gemini API key
- Ghostscript (for OCR)
- GraphicsMagick (for OCR)

## Installation

1. Open backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Fill values in `.env`.

## Environment Variables

Example values:

```env
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRE=30d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=models/gemini-2.5-flash
ALLOW_MOCK_QUESTIONS=false
ENABLE_PDF_OCR=true
OCR_LANGUAGE=eng
OCR_PAGE_LIMIT=20
PDF_OCR_MIN_TEXT_CHARS=30
```

## Run

Development:

```bash
npm run dev
```

Start:

```bash
npm start
```

Default server URL: `http://localhost:5001`

## Main API Endpoints

- `GET /health`
- `POST /upload` (auth required)
- `GET /upload-progress/:uploadId`
- `GET /uploads/history` (auth required)
- `GET /uploads/:id` (auth required)
- `PATCH /uploads/:id/rename` (auth required)
- `DELETE /uploads/:id` (auth required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (auth required)
- `PUT /api/auth/profile` (auth required)
- `PUT /api/auth/change-password` (auth required)

## OCR Notes (Windows)

Install and add to PATH:

- Ghostscript: https://www.ghostscript.com/releases/gsdnld.html
- GraphicsMagick: http://www.graphicsmagick.org/download.html

## Troubleshooting

Port already in use on Windows:

```bash
netstat -ano | findstr :5001
```

If AI generation fails:

- Verify `GEMINI_API_KEY` in `.env`
- Check Gemini quota and billing
- Check backend logs for provider errors

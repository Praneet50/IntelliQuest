# IntelliQuest Backend

AI-powered Question Generator API built with Node.js and Express.

## 🚀 Features

- **File Upload Support**: Accepts PDF, DOCX, and TXT files
- **Text Extraction**: Automatically extracts text from uploaded documents
- **AI Question Generation**: Generate questions using LLM APIs (Gemini, OpenAI, GPT, etc.)
- **Multiple Question Types**:
  - Multiple Choice
  - True/False
  - Short Answer
  - Essay
- **Configurable Difficulty**: Easy, Medium, Hard
- **OCR Ready**: Prepared for OCR integration for scanned documents
- **CORS Enabled**: Ready for React frontend integration
- **Modular Architecture**: Clean, maintainable code structure

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API key for your chosen LLM provider (Gemini, OpenAI, etc.)

## 🛠️ Installation

1. **Clone the repository and navigate to backend:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   PORT=5000
   GEMINI_API_KEY=your_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Create uploads directory:**
   ```bash
   mkdir uploads
   ```

## 🚀 Running the Server

**Development mode (with auto-restart):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-03-12T10:30:00.000Z",
  "uptime": 123.456
}
```

### Upload File and Generate Questions

```http
POST /upload
Content-Type: multipart/form-data
```

**Request Body:**

- `file`: File to upload (PDF, DOCX, or TXT)
- `questionType`: (optional) "multiple-choice", "true-false", "short-answer", "essay"
- `difficulty`: (optional) "easy", "medium", "hard"
- `numQuestions`: (optional) Number of questions (1-50)

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/upload \
  -F "file=@document.pdf" \
  -F "questionType=multiple-choice" \
  -F "difficulty=medium" \
  -F "numQuestions=5"
```

**Example Response:**

```json
{
  "status": "success",
  "message": "Questions generated successfully",
  "data": {
    "filename": "document.pdf",
    "textLength": 2500,
    "questions": [
      {
        "id": 1,
        "question": "What is the main topic discussed?",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "correctAnswer": "A",
        "explanation": "Explanation here"
      }
    ],
    "metadata": {
      "questionType": "multiple-choice",
      "difficulty": "medium",
      "numQuestions": 5
    }
  }
}
```

### Get Upload History

```http
GET /uploads/history
```

### Delete Uploaded File

```http
DELETE /uploads/:filename
```

## 🏗️ Project Structure (MVC Pattern)

```
backend/
├── server.js                     # Main application entry point
├── routes/
│   └── uploadRoutes.js          # Route definitions
├── controllers/
│   └── uploadController.js      # Request handlers
├── services/
│   └── questionService.js       # AI question generation
├── utils/
│   └── fileParser.js            # File parsing utilities
├── config/
│   └── config.js                # Configuration management
├── uploads/                     # Uploaded files storage
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
└── .gitignore                   # Git ignore rules
```

## 🔧 Configuration

### Supported AI Providers

The backend is designed to work with multiple LLM providers:

1. **Google Gemini** (Recommended)
   - Get API key: https://makersuite.google.com/app/apikey
   - Set `AI_PROVIDER=gemini`

2. **OpenAI GPT**
   - Get API key: https://platform.openai.com/api-keys
   - Set `AI_PROVIDER=openai`

3. **Anthropic Claude**
   - Get API key: https://console.anthropic.com/
   - Set `AI_PROVIDER=anthropic`

### Implementing LLM Integration

The `services/questionService.js` file contains placeholder functions. To enable AI features:

1. **Install the required package:**

   ```bash
   # For Google Gemini
   npm install @google/generative-ai

   # For OpenAI
   npm install openai

   # For Anthropic
   npm install @anthropic-ai/sdk
   ```

2. **Uncomment and implement the API call functions** in `questionService.js`

3. **Add your API key** to the `.env` file

## 🔮 Future Enhancements

- [ ] Implement actual LLM API integration
- [ ] Add OCR support for scanned PDFs
- [ ] Database integration for storing questions
- [ ] User authentication and authorization
- [ ] Question history and favorites
- [ ] Export questions to various formats
- [ ] Batch processing for multiple files
- [ ] Real-time progress updates via WebSocket

## 🧪 Testing

Test the server with example files:

```bash
# Test with a text file
curl -X POST http://localhost:5000/upload \
  -F "file=@test.txt" \
  -F "numQuestions=3"

# Check server health
curl http://localhost:5000/health
```

## 🐛 Troubleshooting

**Port already in use:**

```bash
# Change PORT in .env file or kill the process
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000    # Windows
```

**File upload errors:**

- Check file size (max 10MB by default)
- Verify file type is PDF, DOCX, or TXT
- Ensure uploads/ directory exists and is writable

**AI generation not working:**

- Verify API key is correctly set in .env
- Check API quota/limits
- Review console logs for detailed error messages

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

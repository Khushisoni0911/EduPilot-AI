# EduPilot AI 🚀
### Your AI-Powered Learning Assistant for Smarter Studying

EduPilot AI is an AI-powered Chrome Extension designed to make online learning more interactive, personalized, and efficient. It helps students understand, organize, and revise information directly from webpages using generative AI.

Instead of switching between multiple tools, students can access AI-powered learning assistance while browsing educational resources, technical documentation, articles, and other learning materials.

---

## ✨ Features

### 1. Smart Summarization
- Generate concise summaries from webpage content.
- Organize information into readable sections.
- Render AI-generated Markdown content.

### 2. Smart Notes
- Convert webpage content into structured study notes.
- Generate organized learning material.
- Support saving notes locally.

### 3. AI Quiz Generator
- Generate quizzes from extracted webpage content.
- Help students test their understanding.

### 4. AI Explanation
- Get simplified explanations of complex concepts.
- Make difficult learning material easier to understand.

### 5. AI Flashcards
- Generate flashcards from learning content.
- Support quick revision and active recall.

### 6. Student Authentication
- Student registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected AI API endpoints.

### 7. Chrome Extension Integration
- Popup dashboard.
- Interactive sidebar.
- Webpage content extraction.
- Context-aware content detection.
- Page selection and messaging utilities.

---

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Chrome Extension | Manifest V3 |
| Build Tool | Vite |
| Backend | Node.js, Express.js |
| Backend Language | TypeScript |
| Database | MongoDB, Mongoose |
| AI Integration | Google Gemini API |
| Authentication | JWT, bcrypt |
| Development Tools | Git, GitHub, VS Code |

---

## 🏗️ System Architecture

EduPilot AI follows a client-server architecture.

1. **Chrome Extension:** Provides the popup, sidebar, and webpage interaction.
2. **Content Extraction Layer:** Extracts relevant webpage information.
3. **Backend API:** Processes authenticated requests and manages application logic.
4. **AI Integration:** Sends learning content to the Gemini API.
5. **Database:** Stores student account information using MongoDB.

---

## 📁 Project Structure

```text
EduPilot-AI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── server.ts
│   └── .env.example
│
├── extension/
│   ├── public/
│   │   └── icons/
│   ├── src/
│   │   ├── background/
│   │   ├── content/
│   │   ├── popup/
│   │   ├── shared/
│   │   └── sidebar/
│   ├── manifest.json
│   └── vite.config.ts
│
├── package.json
└── README.md
```

---

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- Google Gemini API key
- MongoDB Atlas account or MongoDB instance
- Google Chrome
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Khushisoni0911/EduPilot-AI.git
cd EduPilot-AI
```

### 2. Install dependencies

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install extension dependencies:

```bash
cd ../extension
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` directory using `.env.example` as a reference.

Configure the required variables:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=your_supported_gemini_model
GEMINI_NOTES_MODEL=your_supported_gemini_model
GEMINI_QUIZ_MODEL=your_supported_gemini_model
```

Never commit your actual `.env` file or API credentials.

### 4. Start the backend

```bash
cd backend
npm run dev
```

Backend health check:

```text
https://edupilot-ai-backend-zrka.onrender.com/health
```

### 5. Build the Chrome extension

Open another terminal:

```bash
cd extension
npm run build
```

### 6. Load the extension in Chrome

1. Open `chrome://extensions/`.
2. Enable Developer Mode.
3. Click **Load unpacked**.
4. Select the `extension/dist` directory.
5. Open EduPilot AI from the Chrome toolbar.

---

## 🔐 Authentication

EduPilot AI includes a student authentication system.

- Student registration and login.
- Secure password hashing.
- JWT-based authentication.
- Protected AI endpoints.
- Session management through Chrome extension storage.

---

## 🔌 Backend API

The backend exposes the following API routes:

| Endpoint | Purpose |
|---|---|
| `GET /health` | Backend health check |
| `POST /api/auth/register` | Student registration |
| `POST /api/auth/login` | Student login |
| `POST /api/ai/summarize` | Generate summaries |
| `POST /api/ai/notes` | Generate study notes |
| `POST /api/ai/quiz` | Generate quizzes |
| `POST /api/ai/explain` | Explain concepts |
| `POST /api/ai/flashcards` | Generate flashcards |

AI endpoints require authentication.

---

## 🚧 Future Enhancements

- Universal webpage compatibility improvements.
- Enhanced dynamic webpage content extraction.
- PDF text extraction.
- YouTube transcript integration.
- Personalized learning recommendations.
- Student learning progress dashboard.
- Cloud-based storage for notes and learning history.
- Advanced quiz analytics.
- Production deployment and Chrome Web Store release.

---

## 🎯 Project Vision

EduPilot AI aims to transform the way students interact with online learning resources by bringing intelligent, personalized learning assistance directly into their browser.

**Learn smarter. Revise faster. Study better.**

---

## 👩‍💻 Contributors

Developed as an AI-powered student learning assistant project.

GitHub: https://github.com/Khushisoni0911/EduPilot-AI

---


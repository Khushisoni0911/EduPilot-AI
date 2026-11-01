# EduPilot AI

### AI-Powered Student Assistant Browser Extension

> A modern AI-powered educational assistant that enhances online learning through intelligent summaries, contextual explanations, quizzes, and productivity tools.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)


---

##  Features

| Feature | Status |
|---------|--------|
| AI-powered page summarization | 🔄 In Development |
| Quiz generation from content | 🔄 In Development |
| Concept explanation | 🔄 In Development |
| Smart note-taking | 🔄 In Development |
| Flashcard generation | 🔄 In Development |
| Study session tracking | 🔄 In Development |

---

##  Architecture

```
ai-student-assistant/
├── extension/     # Chrome Extension (React + TypeScript + Vite)
├── backend/       # REST API (Node.js + Express + MongoDB)
├── shared/        # Shared TypeScript types
└── docs/          # Project documentation
```

---

##  Tech Stack

**Extension:** React 18, TypeScript, Tailwind CSS, Vite, Chrome MV3  
**Backend:** Node.js, Express.js, TypeScript  
**Database:** MongoDB Atlas  
**AI:** Google Gemini API  

---

##  Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Google Chrome browser
- MongoDB Atlas account (free tier)
- Gemini API key (free at aistudio.google.com)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/ai-student-assistant.git
cd ai-student-assistant

# Install all dependencies (monorepo)
npm install

# Setup backend environment
cd backend
cp .env.example .env
# Edit .env with your actual API keys

# Start backend development server
npm run dev

# In a new terminal, build and load extension
cd extension
npm run dev
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The AI Student Assistant icon appears in your toolbar

---

##  Module Progress

| Module | Status | Description |
|--------|--------|-------------|
| Module 1 | ✅ Complete | Foundation & Architecture |
| Module 2 | 🔄 Planned | UI Components & Design System |
| Module 3 | 🔄 Planned | Content Script & Page Extraction |
| Module 4 | 🔄 Planned | Authentication System |
| Module 5 | 🔄 Planned | AI Integration (Gemini) |
| Module 6 | 🔄 Planned | Notes System |
| Module 7 | 🔄 Planned | Quiz Engine |
| Module 8 | 🔄 Planned | Dashboard & Analytics |

---

##  Contributing

This project follows the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching strategy.

---

##  License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built as a Final Year Project | AI Engineering | 2024-25*

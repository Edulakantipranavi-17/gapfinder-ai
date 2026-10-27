# 🎯 GapFinder AI — Intelligent Syllabus & Weak-Area Diagnostic Engine

[![Live Demo](https://img.shields.io/badge/Live%20App-Online-brightgreen?style=for-the-badge&logo=google-cloud)](https://ais-pre-ox6aubduhczqhkgc2n7mwq-786869080579.asia-northeast1.run.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Express%20%7C%20Gemini-blue?style=for-the-badge)](https://github.com)

> **"Students often study everything equally and still miss what they don’t know. Traditional study tools wait for the student to ask questions, but a student cannot ask about a gap they don't know they have."**

**GapFinder AI** inverts the traditional study model: instead of waiting for questions, it analyzes a student's syllabus, textbook notes, and past papers, runs an interactive grounded diagnostic quiz, calculates exact topic-level mastery, and builds an adaptive, day-by-day revision plan.

---

## 🌐 Live Application
- **Live URL**: [https://ais-pre-ox6aubduhczqhkgc2n7mwq-786869080579.asia-northeast1.run.app](https://ais-pre-ox6aubduhczqhkgc2n7mwq-786869080579.asia-northeast1.run.app)
- **Demo Access**: Click **"Try Demo as Guest / Student"** on the login screen, or sign in with your email. Preloaded with full sample syllabus & study materials ready to test instantly!

---

## 🌟 Core Features

1. **📁 Multi-Modal Material Ingestion & File Upload**
   - Upload syllabus, lecture notes, textbook chapters, and past examination papers directly from your computer (PDF or plain text).
   - Ingests and structures course documents into an organized topic knowledge hierarchy.

2. **🗺️ Dynamic Topic Mapping & Syllabus Extraction**
   - Automatically breaks down complex curriculum into clear modules, sub-topics, estimated study weightage, and difficulty ratings.

3. **📝 Grounded Diagnostic Quizzing (RAG)**
   - Generates questions strictly sourced from the student's own uploaded materials.
   - Every question displays an exact **Source Citation** (Document name, section, and page reference) ensuring zero hallucinations.

4. **📊 Gap Report & Weak-Area Diagnosis**
   - Classifies every topic into **Weak (<60%)**, **Medium (60–80%)**, and **Strong (>80%)** mastery tiers.
   - Provides granular diagnostic reasoning explaining *why* a student struggled on specific conceptual sub-topics.

5. **📅 Adaptive Personalized Revision Plan**
   - Formulates a realistic, day-by-day study schedule based on the student's available daily hours and target exam date.
   - Automatically prioritizes high-weightage weak topics first.
   - Recalculates dynamically as quiz scores and topic mastery improve!

6. **💬 "Explain-This-Topic" RAG Assistant**
   - Interactive study assistant that explains difficult concepts strictly grounded in the uploaded materials, providing contextual quotes and verified citations.

7. **🎵 Ambient Lo-Fi Study Audio Player**
   - Built-in synthesizer and nature generator featuring Lo-Fi beats, Rain & Thunder, Deep Alpha Waves (432Hz), and Coffee Shop ambience to enhance focus.

8. **📈 Real-Time Progress Tracking & History**
   - Visualizes overall course readiness, quiz score trends, topic status distribution, and complete diagnostic history.

---

## 🏗️ Architecture & RAG Pipeline

```
[Student Materials (PDF / Notes / Papers)]
                   │
                   ▼
       [Text Extraction & Chunking]
                   │
                   ▼
     [Hierarchical Topic Knowledge Base]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
[Diagnostic Quiz Engine]   [RAG Explain Assistant]
  - Gemini Flash Grounding   - Source Citations
  - Strict Source Citations  - Grounded Context Only
         │
         ▼
[Student Evaluation & Gap Analytics]
  - Topic Mastery (Weak / Med / Strong)
  - Diagnostic Reasoning
         │
         ▼
[Adaptive Revision Schedule Generator]
```

### Why This Architecture Stands Out:
* **Grounded Question Generation**: Questions are formulated by referencing specific chunks of the syllabus, eliminating off-syllabus distractions.
* **Separation of Retrieval & Generation**: Content retrieval filters relevant context before generation, verifying all answers against cited passages.
* **Diagnostic Loop**: As students complete quizzes, topic scores update in real time, triggering automatic recalculation of the revision roadmap.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion Animations
- **Backend / Server**: Node.js & Express (`server.ts`), Vite Dev & Production Server
- **AI Engine**: Google Gemini API (`@google/genai` TypeScript SDK) with structured prompting & citation grounding
- **Audio Engine**: Web Audio API ambient audio synthesizer (zero external dependencies)
- **Deployment**: Google Cloud Run & Containerized Node.js Environment

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/gapfinder-ai.git
cd gapfinder-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 👥 Authors & Acknowledgments
Built with ❤️ for students and educators preparing for competitive, university, and board exams.

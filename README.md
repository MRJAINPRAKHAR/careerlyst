<div align="center">
  <img src="frontend/public/logo.png" alt="Careerlyst Logo" width="120" />
  <h1>Careerlyst</h1>
  <p>Your Intelligent Job Tracking & Career Management Platform</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![TiDB](https://img.shields.io/badge/Database-TiDB_Serverless-purple.svg)](https://tidb.com/)
</div>

<br />

**Careerlyst** is a comprehensive, AI-powered full-stack application designed to streamline the modern job search. It serves as a central hub for job seekers to monitor applications, automate tracking via email integrations, and leverage artificial intelligence for resume optimization.

---

## ✨ Key Features

### 📊 Visual Application Pipeline
Track all your job applications in a dynamic, easy-to-read Kanban-style dashboard. Move applications from *Applied* to *Interviewed*, *Offer*, or *Rejected* with a single glance.

### 🤖 AI Career Coach "Nova"
A context-aware AI assistant built directly into the platform. Nova knows your application history and can provide tailored advice on interviewing, resume building, and career strategy. 

### 📧 Automated Email Syncing
Never forget to log an application. Careerlyst securely connects to your Gmail (via Google OAuth) to automatically scan for job application receipts and interview invitations, seamlessly adding them to your pipeline without manual data entry.

### 💼 LinkedIn Chrome Extension
Found a job on LinkedIn? The companion Chrome Extension allows you to instantly extract job details and sync them directly to your Careerlyst dashboard with one click.

### 📄 Intelligent Resume Matcher
Upload your current resume (PDF) and paste a target job description. The AI engine will provide an ATS match score, identify missing keywords, and generate a customized action plan to improve your chances of getting an interview.

---

## 🚀 Technology Stack

### Frontend Architecture
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend Infrastructure
- **Runtime**: Node.js & Express
- **Database**: MySQL (optimized for TiDB Serverless / Aiven)
- **Authentication**: JWT, Google OAuth 2.0
- **File Storage**: Cloudinary (for persistent resume/avatar storage)
- **Email Service**: Nodemailer

### AI Integrations (Hybrid Model)
- **Groq Cloud**: Lightning-fast primary LLM (Llama 3 based).
- **Google Gemini**: Robust fallback model (`gemini-2.5-flash-lite`).
- **Ollama**: Local processing fallback for privacy-focused execution.

---

## 🛠️ Local Development Setup

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MySQL / TiDB instance
- Google Cloud Console Account (for Gmail OAuth credentials)
- Cloudinary Account (for file storage)

### 1. Clone the Repository
```bash
git clone https://github.com/MRJAINPRAKHAR/careerlyst.git
cd careerlyst
```

### 2. Backend Environment Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following credentials:
```env
PORT=5001
FRONTEND_URL=http://localhost:5173
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=careerlyst
JWT_SECRET=your_jwt_secret

# AI Keys
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Google OAuth (For Gmail Sync)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (For Resumes)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run `npm run dev` to start the backend server.

### 3. Frontend Environment Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5001
```
Run `npm run dev` to start the React application.

---

## 📦 Deployment Architecture
Careerlyst is currently configured for deployment on **Render.com**.
- **Web Service (Backend)**: Connects to a robust remote database. It includes a built-in `Keep-Alive` cron job to prevent free-tier databases (like Aiven or TiDB) from hibernating.
- **Static Site (Frontend)**: Deployed automatically alongside the backend.

---

## 👥 Meet the Team
This platform was built by a dedicated team of developers working to improve the job search experience:
- **Prakhar Jain**
- **Aniruddh Singh**
- **Karan Kothari**

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open a Pull Request or create an Issue to report bugs or suggest new features.

---
<div align="center">
  <i>Built with ❤️ for Job Seekers globally.</i>
</div>

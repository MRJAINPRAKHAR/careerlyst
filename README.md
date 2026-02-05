# Careerlyst - Job Tracker & AI Companion

**Careerlyst** is a full-stack job tracking application designed to help job seekers organize their search, automate application syncing from Gmail and LinkedIn, and leverage AI for resume analysis and career coaching.

## ✨ Features
- **Dashboard**: Track your applications in a visual pipeline.
- **AI Coach (Nova)**: Chat with an AI assistant that knows your job search history.
- **Gmail Automation**: Automatically sync job applications and interviews from your Gmail.
- **LinkedIn Extension**: Sync jobs directly from your LinkedIn "Applied Jobs" folder.
- **Resume Analysis**: Get match scores and action plans for specific job descriptions.
- **Admin Dashboard**: Manage users and feedback.

## 🚀 Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express, MySQL.
- **AI**: Groq (Llama), Google Gemini, Local Ollama.
- **Auth**: JWT, Google OAuth 2.0.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL
- Google Cloud Console Account (for OAuth/Gmail)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/job-tracker.git
   cd job-tracker
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided template
   npm start
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env file based on the provided template
   npm run dev
   ```

## 📄 License
This project is for educational/personal use.

---
*Built with ❤️ for Job Seekers.*

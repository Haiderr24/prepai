# PrepAI - AI-Powered Interview Preparation Tool

<div align="center">
  <h3>🚀 FREE AI-powered interview preparation and job application tracking</h3>
  <p>Built with Next.js 15, TypeScript, and OpenAI GPT-4</p>
  
  **[Live Demo](https://prepai-tool.vercel.app)** | **[Report Bug](https://github.com/Haiderr24/studyflow-saas/issues)**
</div>

---

## ✨ Features

### 🤖 **AI-Powered Interview Prep**
- **Smart Interview Questions**: Role-specific, company-targeted questions across 4 categories
- **Company Research**: Deep insights about culture, interview process, and recent news
- **Personalized Prep**: Custom "tell me about yourself", strengths, weaknesses responses
- **Technical Interview Focus**: Detailed preparation for technical roles

### 📊 **Job Application Management**
- **Professional Dashboard**: Clean table UI with sorting, filtering, and search
- **Advanced Job Management**: Add, edit, delete job applications with intuitive UX
- **Slide-out Side Panel**: Non-intrusive add/edit form that preserves dashboard visibility
- **Smart Tracking**: Track application status, notes, and interview progress

### 🔐 **Modern Authentication**
- **Multiple Sign-in Options**: Email/password and Google OAuth
- **Secure Sessions**: NextAuth.js with session management
- **User Accounts**: Persistent data across sessions

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 (dark premium theme)
- **Database**: PostgreSQL on Supabase with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: OpenAI GPT-4o-mini with smart prompts and caching
- **Deployment**: Vercel with automatic GitHub integration
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (we recommend Supabase)
- OpenAI API key
- Google OAuth credentials (optional)

### 1. Clone and Install
```bash
git clone https://github.com/Haiderr24/studyflow-saas.git
cd studyflow-saas
npm install
```

### 2. Environment Setup
Create `.env.local` in the root directory:
```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# OpenAI API
OPENAI_API_KEY="your_openai_api_key"
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
prepai/
├── src/
│   └── app/
│       ├── layout.tsx              # Root layout with SessionProvider
│       ├── page.tsx                # Landing page
│       ├── globals.css             # Tailwind styles (dark theme)
│       ├── api/
│       │   ├── auth/[...nextauth]/ # NextAuth configuration
│       │   ├── jobs/               # Complete CRUD + AI API
│       │   │   └── [jobId]/        # AI endpoints
│       │   │       ├── generate-questions/    # OpenAI questions
│       │   │       ├── company-research/      # OpenAI research  
│       │   │       └── personalized-prep/    # OpenAI prep
│       │   └── auth/register       # User registration
│       ├── dashboard/
│       │   └── page.tsx            # Main dashboard with table UI
│       ├── auth/
│       │   ├── signin/page.tsx     # Sign in page
│       │   ├── signup/page.tsx     # Sign up page
│       │   └── error/page.tsx      # Auth error handling
│       └── components/
│           ├── AddJobModal.tsx     # Slide-out add/edit form
│           └── JobDetailModal.tsx  # AI features modal
├── src/lib/
│   ├── openai.ts                   # OpenAI service with smart prompts
│   ├── auth.ts                     # NextAuth + Google OAuth config
│   └── prisma.ts                   # Database client
├── prisma/
│   └── schema.prisma               # Complete schema with AI fields
└── package.json                    # Dependencies and scripts
```

---

## 🔧 Configuration

### Database Schema
The application uses a PostgreSQL database with the following main models:

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  isPremium       Boolean   @default(false)
  jobApplications JobApplication[]
}

model JobApplication {
  id               String   @id @default(cuid())
  company          String
  position         String
  status           String   @default("Applied")
  // AI-generated content
  aiQuestions      Json?
  companyResearch  Json?
  personalizedPrep Json?
  // Relations
  userId           String
  user             User     @relation(fields: [userId], references: [id])
}
```

### OpenAI Integration
The AI features use GPT-4o-mini with optimized prompts for:
- **Interview Questions**: Behavioral, technical, role-specific, and company questions
- **Company Research**: Industry analysis, culture insights, interview process
- **Personalized Prep**: Tailored responses for common interview questions

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Import your GitHub repository to Vercel
   - Select the Next.js framework preset

2. **Environment Variables**:
   Set all environment variables in Vercel dashboard:
   ```
   DATABASE_URL
   NEXTAUTH_SECRET
   NEXTAUTH_URL (set to your production domain)
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   OPENAI_API_KEY
   ```

3. **Domain Configuration**:
   - Set up custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` to match your production domain
   - Update Google OAuth redirect URIs

---

## 🧪 Testing the Application

### Core Workflow
1. **Sign Up**: Create account at `/auth/signup` or sign in at `/auth/signin`
2. **Dashboard**: View professional table with all job applications
3. **Add Jobs**: Use "Add Job Application" button (slide-out side panel)
4. **AI Features**: Click Brain icon to access AI-powered interview prep
5. **Track Progress**: Update application status and add notes

### AI Features
- **Generate Questions**: AI creates behavioral, technical, role-specific, and company questions
- **Research Company**: Provides company insights, culture, and interview process details
- **Personalized Prep**: Generates tailored responses for common interview questions

---

## 🛡️ Security Features

- **Authentication**: Secure NextAuth.js implementation with session management
- **Environment Variables**: Sensitive data stored securely
- **API Protection**: All AI endpoints require authentication
- **Input Validation**: Comprehensive validation on all forms
- **HTTPS**: SSL/TLS encryption in production

---

## 🎯 Key Features

### 1. **Smart Dashboard**
- Professional table interface with sorting, filtering, and search
- Status-based filtering (Applied, Interview, Offer, Rejected, etc.)
- Quick actions for edit, AI prep, and delete operations

### 2. **AI-Powered Preparation**
- **Interview Questions**: Role and company-specific question generation
- **Company Intelligence**: Research company culture, values, recent news
- **Technical Prep**: Focused preparation with study recommendations
- **Personal Coaching**: Tailored advice for behavioral questions

### 3. **Application Management**
- Comprehensive job tracking with company, position, salary details
- Status tracking through the entire interview process  
- Notes system for company research and interview experiences
- Job posting links and application timeline

---

## 📈 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database viewer
npx prisma db push   # Update database schema
```

### Tech Stack Benefits
- **Next.js 15**: Latest features with App Router for optimal performance
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Rapid UI development with consistent design
- **Prisma**: Type-safe database operations with excellent tooling
- **OpenAI**: State-of-the-art AI for intelligent interview preparation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔗 Links

- **Live Application**: [https://prepai-tool.vercel.app](https://prepai-tool.vercel.app)
- **GitHub Repository**: [https://github.com/Haiderr24/studyflow-saas](https://github.com/Haiderr24/studyflow-saas)
- **Report Issues**: [GitHub Issues](https://github.com/Haiderr24/studyflow-saas/issues)

---

<div align="center">
  <p>Built with ❤️ using Next.js, TypeScript, and OpenAI</p>
  <p><strong>PrepAI - Your AI-Powered Interview Success Partner</strong></p>
</div>

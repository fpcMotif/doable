# Doable

A modern task management platform built with Next.js.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Better Auth](https://img.shields.io/badge/Better_Auth-Auth-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## Overview

Doable is a comprehensive task management solution designed for modern teams.

## Features

- **AI-Powered Assistant** - Intelligent chatbot for task management with natural language commands
- **Modern Interface** - Clean, intuitive design inspired by Swiss design principles
- **Team Collaboration** - Built-in team management with role-based permissions
- **Lightning Fast** - Built with Next.js 15 and optimized for performance
- **Secure & Reliable** - Enterprise-grade security with Better Auth and Google OAuth
- **Open Source** - Full source code available for customization
- **Modular Design** - Clean architecture with reusable components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom Swiss design system
- **Authentication**: Better Auth with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **AI/LLM**: Vercel AI SDK with Groq (llama-3.3-70b)
- **UI Components**: Custom components with Shadcn/ui base
- **Forms**: React Hook Form with Zod validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Cloud OAuth credentials
- Groq API key (for AI chatbot feature)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KartikLabhshetwar/doable.git
   cd doable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root
   
   Update `.env.local` with your configuration:
   ```env
   # Better Auth (Required)
   BETTER_AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
   BETTER_AUTH_URL=http://localhost:3000
   
   # Database (Required)
   DATABASE_URL="postgresql://username:password@localhost:5432/doable"
   
   # Google OAuth (Required)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Application URL (Required)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # AI Chatbot (Optional, but recommended)
   # Get your free API key from https://console.groq.com/
   GROQ_API_KEY="your-groq-api-key"
   
   # Email Service (Optional, for team invitations)
   RESEND_API_KEY="your-resend-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx @better-auth/cli generate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
doable/
├── app/                    # Next.js app directory
│   ├── (landing-page)/    # Landing page routes
│   ├── dashboard/         # Dashboard routes
│   ├── api/               # API routes
│   │   └── auth/         # Better Auth handlers
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── projects/         # Project-related components
│   └── shared/           # Shared components
├── lib/                  # Utility functions and types
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Key Components

### Landing Page
- Modern hero section with animated text
- Feature showcase with floating cards
- Pricing section with popular badges
- Responsive design for all devices

### Dashboard
- Clean sidebar navigation
- Issue and project management
- Advanced filtering and search
- Multiple view modes (list, board, table)
- **AI Chatbot** - Natural language task management assistant

### AI Chatbot
- Intelligent conversational assistant powered by Groq
- Create and manage issues through natural language
- Ask follow-up questions when details are missing
- Full access to team data (projects, members, labels, workflow states)
- Persistent conversation history
- Features:
  - Create issues with smart defaults
  - Update issue status and properties
  - Create and manage projects
  - Invite team members
  - Get team statistics and insights

### Authentication
- Google OAuth sign-in/sign-up
- Secure session management with Better Auth
- Team-based access control
- User management and permissions

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema changes
npm run db:seed      # Seed database with default data
```

### Database Management

```bash
# Update database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Configuration

### Better Auth Setup

#### 1. Generate Secret Key
```bash
openssl rand -base64 32
```

#### 2. Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

#### 3. Environment Variables
Add these to `.env.local`:
- `BETTER_AUTH_SECRET`: Your generated secret key
- `BETTER_AUTH_URL`: `http://localhost:3000`
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Make sure your database is running and accessible via the `DATABASE_URL` environment variable.

### AI Chatbot Configuration (Groq)

The AI chatbot uses Groq's free LLM API to provide intelligent task management assistance.

1. **Get a Groq API Key**
   - Sign up at [console.groq.com](https://console.groq.com/)
   - Create an API key in the dashboard
   - Free tier includes 30 requests/minute

2. **Bring your own Groq API key**
   - Click the gear icon in the dashboard header to open the management page
   - Click the "Manage API Key" button to open the API key dialog
   - Enter your Groq API key and click the "Save" button

3. **Using the Chatbot**
   - Click the sparkles brain icon in the dashboard header to open the AI assistant
   - Chatbot has full access to your team's data
   - Ask questions like:
     - "Create a new issue to implement user authentication"
     - "Show me all high priority issues"
     - "Move issue #42 to in progress"
     - "Invite john@example.com to the team"

### Deployment to Vercel

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import your project in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables in Vercel**
   Go to your project settings → Environment Variables and add:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   
   **Important**: Update Google OAuth redirect URI to your production domain:
   `https://your-domain.com/api/auth/callback/google`

4. **Deploy**
   Vercel will automatically deploy your application on push to main branch.

**Note**: The application will build successfully even without Better Auth keys for static pages, but authentication features require the keys to be set.

## Design System

Doable implements a custom design system based on Swiss design principles:

- **Typography**: Inter font family with proper hierarchy
- **Colors**: Notion-inspired dark theme with HSL color system
- **Spacing**: Consistent spacing scale (4px base unit)
- **Components**: Modular, reusable UI components
- **Animations**: Subtle, purposeful animations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/KartikLabhshetwar/doable/issues)

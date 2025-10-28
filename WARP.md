# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup

```bash
bun install
bunx prisma db push
bunx @better-auth/cli generate
bun run db:seed
```

### Daily Development

```bash
bun run dev              # Start development server (port 3000)
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint
```

### Database Operations

```bash
bunx prisma db push       # Push schema changes to database
bunx prisma generate      # Regenerate Prisma client
bunx prisma studio        # Open Prisma Studio GUI
bun run db:seed          # Seed database with default data
```

## Architecture Overview

### Core Technologies

- **Framework**: Next.js 15 (App Router) with React 19 and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with Google OAuth (session-based)
- **AI**: Vercel AI SDK with Groq (llama-3.3-70b) for chatbot
- **Styling**: Tailwind CSS with custom Swiss design system
- **Forms**: React Hook Form + Zod validation

### Project Structure

#### App Router (`/app`)

- `(landing-page)/` - Public marketing pages
- `dashboard/` - Protected routes requiring authentication
  - `[teamId]/` - Team-scoped routes (issues, projects, people, management)
- `api/` - API routes
  - `auth/[...all]/` - Better Auth handlers
  - `teams/[teamId]/` - Team-scoped REST APIs (issues, projects, chat, invitations, etc.)
- `sign-in/`, `sign-up/` - Authentication pages
- `invite/` - Team invitation acceptance flow

#### Core Libraries (`/lib`)

- `auth.ts`, `auth-server.ts` - Better Auth configuration and helpers
- `db.ts` - Prisma client singleton
- `api/` - Server-side business logic (chat, issues, labels, projects)
- `hooks/` - React hooks (keyboard shortcuts, toast notifications)
- `prompts/` - AI system prompts for chatbot
- `types/` - TypeScript type definitions

#### Components (`/components`)

- `ui/` - Base UI components (shadcn/ui)
- `ai/` - AI chatbot components
- `issues/` - Issue management components (board, table, forms)
- `projects/` - Project management components
- `filters/` - Data filtering components
- `shared/` - Shared components (sidebar, header, dialogs)
- `landing/` - Landing page components

#### Database (`/prisma`)

- `schema.prisma` - Database schema
- `seed.ts` - Database seeding script

### Authentication Flow

1. Better Auth uses session cookies (not JWT)
2. Middleware (`middleware.ts`) protects `/dashboard/*` routes
3. Session helpers in `lib/auth.ts`: `getAuthUser()`, `requireAuth()`, `currentUser()`
4. Google OAuth configured in `lib/auth.ts` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
5. Better Auth must be initialized with `bunx @better-auth/cli generate` after Prisma changes

### Team-Based Multi-Tenancy

- All data is scoped to a `Team` model
- Each team has a unique 3-letter key (e.g., "ENG", "DES")
- Users can belong to multiple teams via `TeamMember` model
- Team ID is part of the URL structure: `/dashboard/[teamId]/...`
- API routes validate team membership before returning data

### AI Chatbot Architecture

1. **BYOK (Bring Your Own Key)**: Teams can provide their own Groq API key
2. **System Prompt**: Generated dynamically from team context (projects, workflow states, labels, members)
3. **Tools**: AI can call server actions to create/update issues, projects, invite members, get stats
4. **Conversation History**: Stored in `ChatConversation` and `ChatMessage` tables
5. **Implementation**: Uses Vercel AI SDK with streaming responses
6. **Location**: Chat UI in dashboard header, API route at `/api/teams/[teamId]/chat`

### Data Models (Key Relationships)

```
Team
├── Projects (many)
├── Issues (many)
├── WorkflowStates (many) - Backlog, Unstarted, Started, Completed, Canceled
├── Labels (many)
├── TeamMembers (many) - Users with roles (admin, member, viewer)
├── Invitations (many)
└── ChatConversations (many)

Project
├── Team (one)
├── Issues (many)
└── Lead (one TeamMember)

Issue
├── Team (one)
├── Project (one)
├── WorkflowState (one)
├── Labels (many-to-many)
├── Assignee (one TeamMember)
└── Reporter (one TeamMember)
```

### Issue Management System

- Issues have a unique identifier: `{TEAM_KEY}-{NUMBER}` (e.g., "ENG-42")
- Workflow states are customizable per team with position ordering
- Multiple view modes: List, Board (Kanban), Table
- Advanced filtering by project, status, assignee, priority, labels
- Drag-and-drop support for board view using `@hello-pangea/dnd`

### Email Integration (Optional)

- Uses Resend API for team invitations
- Configured with `RESEND_API_KEY` environment variable
- Email templates in `lib/email.ts`

## Environment Variables

### Required

- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `BETTER_AUTH_URL` - Base URL (e.g., `http://localhost:3000`)
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_APP_URL` - Public-facing URL

### Optional

- `GROQ_API_KEY` - Groq API key (can also be set per-team via BYOK)
- `RESEND_API_KEY` - For sending invitation emails

## Key Design Patterns

### Path Aliases

- Use `@/*` to import from project root (e.g., `import { db } from '@/lib/db'`)

### Server vs Client Components

- Default to Server Components for data fetching
- Use `"use client"` directive only when needed (forms, interactivity, hooks)
- API routes return JSON responses with proper error handling

### Form Handling

- React Hook Form + Zod for validation
- Form components in `components/*/` directories
- Submit handlers call API routes via `fetch`

### Error Handling

- API routes return `{ error: string }` on failure
- Client components display errors via toast notifications (`use-toast` hook)
- Prisma errors are caught and transformed to user-friendly messages

### Styling Conventions

- Tailwind utility classes with Swiss design principles
- HSL color system defined in `tailwind.config.ts`
- Custom design tokens: Inter font, consistent spacing (4px base)
- Dark theme by default (Notion-inspired)

## Development Workflow

### Adding a New Feature

1. Update Prisma schema if database changes needed
2. Run `bunx prisma db push` and `bunx @better-auth/cli generate`
3. Create API route in `app/api/teams/[teamId]/`
4. Add business logic in `lib/api/`
5. Create UI components in `components/`
6. Update types in `lib/types/`
7. Test with `bun run dev`
8. Run `bun run lint` before committing

### Working with the AI Chatbot

- System prompt is in `lib/prompts/assistant-prompt.ts`
- Chat API route: `app/api/teams/[teamId]/chat/route.ts`
- Tools are defined inline in the chat route using Vercel AI SDK
- To modify chatbot behavior, update system prompt or add new tools

### Database Migrations

- Development: Use `bunx prisma db push` for rapid iteration
- Production: Use `bunx prisma migrate dev` for proper migrations
- Always regenerate Prisma client after schema changes
- Seed script creates default workflow states and admin user

## Testing

- No formal test framework configured yet
- Manual testing via Prisma Studio and browser DevTools
- API routes can be tested with tools like Postman or curl

## Deployment

- Optimized for Vercel deployment
- Set all required environment variables in Vercel dashboard
- Update Google OAuth redirect URI to production domain
- Database should be hosted PostgreSQL instance (e.g., Vercel Postgres, Supabase)

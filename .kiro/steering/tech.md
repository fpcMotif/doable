# Technical Architecture: Doable

## Tech Stack Overview

### Frontend
- **Framework**: Next.js 16 with App Router
- **React**: 19.2.0 with React Compiler enabled
- **TypeScript**: 5.x with strict mode
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: Radix UI primitives + custom components
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Tabler Icons, Lucide React, Radix Icons

### Backend
- **Database**: Convex (real-time, serverless)
- **Authentication**: Better Auth with Google OAuth
- **AI/LLM**: Vercel AI SDK + Groq (llama-3.3-70b)
- **Email**: Resend (for team invitations)

### Build & Dev Tools
- **Bundler**: Turbopack (5-10x faster than Webpack)
- **Linter**: Oxlint (100x faster than ESLint)
- **Formatter**: Biome/Ultracite
- **Package Manager**: npm/bun

## Architecture Patterns

### Data Flow
```
User Action → React Component → Convex Mutation/Query → Database
                                      ↓
                              Real-time Updates
                                      ↓
                              All Connected Clients
```

### Authentication Flow
```
User → Google OAuth → Better Auth → Session Token → Protected Routes
```

### AI Chatbot Flow
```
User Message → Convex Action → Groq API → Tool Calls → Database Updates → Response
```

## Key Technical Decisions

### Why Convex?
- Real-time updates out of the box
- Serverless, no infrastructure management
- Type-safe queries and mutations
- Built-in caching and optimization
- Excellent developer experience

### Why Better Auth?
- Modern, type-safe authentication
- Built-in OAuth providers
- Session management
- Team/organization support
- Easy to extend

### Why Groq?
- Fastest LLM inference (300+ tokens/sec)
- Free tier with generous limits
- Compatible with OpenAI API
- Excellent for real-time chat experiences
- BYOK support for users

### Why Next.js 16?
- React Compiler for automatic optimization
- Turbopack for faster builds
- Server Components for better performance
- Built-in API routes
- Excellent TypeScript support

## Database Schema

### Core Tables
- **teams**: Team workspace with optional Groq API key
- **projects**: Project organization with keys and colors
- **issues**: Core task/issue tracking
- **workflowStates**: Customizable workflow stages
- **labels**: Flexible tagging system
- **comments**: Issue discussions
- **teamMembers**: Team membership and roles
- **invitations**: Email-based team invites
- **chatConversations**: AI chat sessions
- **chatMessages**: Chat history with tool calls

### Relationships
- Team → Projects (1:many)
- Team → Issues (1:many)
- Team → WorkflowStates (1:many)
- Team → Labels (1:many)
- Team → TeamMembers (1:many)
- Project → Issues (1:many)
- Issue → Comments (1:many)
- Issue → Labels (many:many via issueLabels)

### Indexes
All foreign keys are indexed for query performance:
- `by_teamId` on most tables
- `by_projectId`, `by_workflowStateId` on issues
- `by_issueId` on comments and issueLabels
- Composite indexes for common queries

## API Design

### Convex Functions

#### Queries (Read Operations)
- `getTeam`: Fetch team details
- `getProjects`: List projects for team
- `getIssues`: List issues with filters
- `getIssue`: Get single issue with relations
- `getWorkflowStates`: List workflow states
- `getLabels`: List labels
- `getChatConversations`: List user's chat history

#### Mutations (Write Operations)
- `createTeam`: Initialize new team
- `createProject`: Add project to team
- `createIssue`: Create new issue
- `updateIssue`: Modify issue properties
- `deleteIssue`: Remove issue
- `createComment`: Add comment to issue
- `inviteTeamMember`: Send invitation
- `updateTeamMember`: Change member role

#### Actions (External API Calls)
- `sendChatMessage`: Process AI chat with Groq
- `sendInvitationEmail`: Send email via Resend

### REST API Routes
- `/api/auth/*`: Better Auth handlers
- `/api/og`: Open Graph image generation

## Performance Optimizations

### Frontend
- React Compiler auto-memoization
- Server Components for static content
- Streaming for dynamic content
- Image optimization with Next.js Image
- Code splitting by route
- Lazy loading for heavy components

### Backend
- Convex automatic query caching
- Indexed database queries
- Batch operations where possible
- Optimistic updates for UI responsiveness

### Build
- Turbopack for 5-10x faster builds
- Oxlint for 100x faster linting
- Parallel processing where possible

## Security Considerations

### Authentication
- OAuth 2.0 with Google
- Secure session tokens
- CSRF protection via Better Auth
- HTTP-only cookies

### Authorization
- Role-based access control (admin, developer, viewer)
- Team-scoped data access
- Server-side permission checks
- No client-side auth logic

### Data Protection
- Environment variables for secrets
- No hardcoded API keys
- BYOK for user-provided keys
- Input validation with Zod
- SQL injection prevention (Convex handles this)

### API Security
- Rate limiting on Convex functions
- Input sanitization
- Error message sanitization
- CORS configuration

## Development Workflow

### Local Development
```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex backend
```

### Database Changes
```bash
# Update schema in convex/schema.ts
# Convex automatically migrates on save
```

### Code Quality
```bash
npm run lint         # Oxlint check
npm run format       # Biome format
npm run check        # Full check
```

### Deployment
- Push to GitHub
- Vercel auto-deploys
- Convex auto-deploys
- Environment variables in Vercel dashboard

## Testing Strategy

### Current State
- Manual testing in development
- Type safety via TypeScript
- Zod validation for runtime checks

### Future Considerations
- Unit tests for utility functions
- Integration tests for Convex functions
- E2E tests for critical user flows
- Visual regression tests

## Monitoring & Observability

### Current
- Convex dashboard for function logs
- Vercel analytics for frontend
- Browser console for client errors

### Future
- Error tracking (Sentry)
- Performance monitoring (Vercel Speed Insights)
- User analytics (PostHog)
- Uptime monitoring

## Scalability Considerations

### Current Limits
- Convex free tier: 1GB storage, 1M function calls/month
- Groq free tier: 30 requests/minute
- Resend free tier: 100 emails/day

### Scaling Strategy
- Convex scales automatically with paid plans
- BYOK allows users to bring unlimited Groq capacity
- Horizontal scaling via Vercel edge network
- Database indexes for query performance

## Dependencies Management

### Critical Dependencies
- `next`: Framework core
- `react`, `react-dom`: UI library
- `convex`: Backend platform
- `better-auth`: Authentication
- `ai`, `groq-sdk`: AI features
- `@radix-ui/*`: UI primitives

### Update Strategy
- Monthly dependency audits
- Security patches immediately
- Major version updates with testing
- Lock file committed to repo

## Environment Variables

### Required
- `BETTER_AUTH_SECRET`: Auth encryption key
- `BETTER_AUTH_URL`: App URL
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth secret
- `NEXT_PUBLIC_APP_URL`: Public app URL
- `CONVEX_DEPLOYMENT`: Convex deployment URL

### Optional
- `GROQ_API_KEY`: Default Groq key (users can BYOK)
- `RESEND_API_KEY`: Email service key

## Code Organization

### Directory Structure
```
app/                    # Next.js routes
  (landing-page)/      # Public pages
  dashboard/           # Protected app
  api/                 # API routes
components/            # React components
  ui/                  # Base components
  projects/            # Feature components
  shared/              # Shared utilities
convex/                # Backend functions
  schema.ts            # Database schema
  *.ts                 # Function files
lib/                   # Utilities
  types/               # TypeScript types
  hooks/               # React hooks
  api/                 # API clients
```

### Naming Conventions
- Components: PascalCase (e.g., `IssueCard.tsx`)
- Functions: camelCase (e.g., `createIssue`)
- Files: kebab-case (e.g., `issue-card.tsx`)
- Types: PascalCase (e.g., `IssueType`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_TITLE_LENGTH`)

## AI Integration Details

### Groq Configuration
- Model: `llama-3.3-70b-versatile`
- Max tokens: 8192
- Temperature: 0.7
- Streaming: enabled

### Tool Calling
AI can call these tools:
- `createIssue`: Create new issue
- `updateIssue`: Modify issue
- `getIssues`: Query issues
- `createProject`: Add project
- `inviteTeamMember`: Send invite
- `getTeamStats`: Fetch analytics

### Context Management
- Full team data loaded per request
- Conversation history maintained
- Tool call results fed back to model
- Error handling with user-friendly messages

## Internationalization (i18n)

### Current State
- Single language (English)
- next-intl installed but not configured

### Future Implementation
- Message files in `messages/` directory
- Language switcher in settings
- Locale-based routing
- Date/time formatting per locale

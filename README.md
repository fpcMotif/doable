# Doable

## 🚀 Quick Start

### 1. Enable Team Creation in Stack Auth

The error you're seeing is because client-side team creation is disabled in your Stack Auth project. To fix this:

1. **Go to your Stack Auth Dashboard**
2. **Navigate to Project Settings**
3. **Go to Team Settings**
4. **Enable "Client team creation"**
5. **Save the changes**

### 2. Alternative: Create Teams Manually

If you prefer to manage teams manually:

1. **Go to your Stack Auth Dashboard**
2. **Navigate to Teams**
3. **Create a team manually**
4. **Add users to the team**
5. **Users can then select from existing teams**

### 3. Database Setup

Make sure you have your database configured:

```bash
# Install dependencies
npm install

# Set up your database URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/doable"

# Run database migrations
npx prisma db push

# Seed the database with default workflow states and labels
npm run db:seed
```

### 4. Start the Development Server

```bash
npm run dev
```

## 🎯 Features

- ✅ **Issue Management**: Create, edit, delete, and track issues
- ✅ **Project Organization**: Organize issues into projects
- ✅ **Workflow States**: Customizable status workflows
- ✅ **Labels & Priorities**: Categorize and prioritize issues
- ✅ **Multiple Views**: List, Board (Kanban), and Table views
- ✅ **Advanced Filtering**: Filter by status, assignee, project, labels
- ✅ **Search**: Real-time search across all content
- ✅ **Command Palette**: Keyboard shortcuts (⌘K)
- ✅ **User Management**: Integrated with Stack Auth
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Comprehensive error boundaries and notifications

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Stack Auth
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
app/
├── api/teams/[teamId]/
│   ├── issues/          # Issue CRUD operations
│   ├── projects/        # Project CRUD operations
│   ├── labels/          # Label management
│   └── workflow-states/ # Workflow state management
├── dashboard/[teamId]/
│   ├── issues/          # Issues list and detail pages
│   └── projects/        # Projects list and detail pages
components/
├── issues/              # Issue-related components
├── projects/            # Project-related components
├── shared/              # Reusable UI components
└── filters/             # Filtering components
lib/
├── api/                 # API helper functions
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## 🎨 UI Components

- **IssueCard**: Display issue in list/board views
- **IssueDialog**: Create/edit issue modal
- **ProjectCard**: Display project information
- **ProjectDialog**: Create/edit project modal
- **StatusBadge**: Visual status indicator
- **PriorityIcon**: Priority level display
- **LabelBadge**: Colored label chips
- **UserAvatar**: User profile picture with fallback
- **ViewSwitcher**: Toggle between list/board/table views
- **FilterBar**: Filter issues by various criteria
- **CommandPalette**: Keyboard shortcut interface (⌘K)

## ⌨️ Keyboard Shortcuts

- `⌘K` - Open command palette
- `⌘C` - Create new issue
- `↑↓` - Navigate commands
- `↵` - Execute command
- `⎋` - Close palette

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/doable"
STACK_PROJECT_ID="your-stack-project-id"
STACK_PUBLISHABLE_CLIENT_KEY="your-stack-publishable-key"
```

### Stack Auth Configuration

Make sure your Stack Auth project has:
- Client team creation enabled (for automatic team creation)
- Or manually create teams and add users

## 🚨 Troubleshooting

### Team Creation Error

If you see "Client team creation is disabled for this project":

1. **Enable team creation** in Stack Auth dashboard
2. **Or create teams manually** and add users
3. **Refresh the page** after making changes

### Database Connection Issues

1. **Check your DATABASE_URL** in `.env`
2. **Ensure PostgreSQL is running**
3. **Run `npx prisma db push`** to sync schema
4. **Run `npm run db:seed`** to add default data

### Build Issues

1. **Clear Next.js cache**: `rm -rf .next`
2. **Reinstall dependencies**: `rm -rf node_modules && npm install`
3. **Check TypeScript errors**: `npm run lint`

## 📝 Development

### Adding New Features

1. **Create API routes** in `app/api/teams/[teamId]/`
2. **Add database models** in `prisma/schema.prisma`
3. **Create UI components** in `components/`
4. **Add TypeScript types** in `lib/types/`
5. **Update hooks** in `lib/hooks/`

### Database Changes

1. **Update schema** in `prisma/schema.prisma`
2. **Run migration**: `npx prisma db push`
3. **Update types**: `npx prisma generate`

## 🎉 Success!

Once everything is set up, you'll have a fully functional Linear-inspired task management system with:

- Professional UI/UX
- Comprehensive error handling
- Loading states and notifications
- Keyboard shortcuts and command palette
- Multi-tenant architecture
- Responsive design

Happy coding! 🚀
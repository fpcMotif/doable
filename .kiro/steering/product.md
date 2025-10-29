# Product Context: Doable

## Product Vision
Doable is a modern task management platform designed for teams who value simplicity, speed, and intelligent automation. Built with Swiss design principles, it combines clean aesthetics with powerful AI-driven features.

## Core Value Propositions
1. **AI-First Task Management** - Natural language interface for creating and managing work
2. **Team-Centric Design** - Built for collaboration with role-based permissions
3. **Lightning Fast** - Optimized performance with Next.js 16 and Convex backend
4. **Flexible Workflow** - Customizable states, labels, and project structures
5. **Bring Your Own Key** - Users can use their own Groq API keys for AI features

## Target Users
- **Primary**: Small to medium development teams (5-50 people)
- **Secondary**: Product managers, designers, and cross-functional teams
- **Use Cases**: Sprint planning, bug tracking, feature development, project coordination

## Key Features

### Issue Management
- Create, update, and track issues with rich metadata
- Priority levels: none, low, medium, high, urgent
- Story point estimation
- Custom labels and workflow states
- Comments and activity tracking
- Sequential numbering per team (e.g., ENG-123)

### Project Organization
- Multiple projects per team
- 3-letter project keys (e.g., WEB, API, DES)
- Project leads and status tracking
- Color-coded visual organization
- Custom icons/emojis

### AI Chatbot Assistant
- Powered by Groq (llama-3.3-70b model)
- Natural language task creation and updates
- Context-aware conversations with follow-up questions
- Full access to team data (projects, members, labels, states)
- Persistent conversation history
- BYOK (Bring Your Own Key) support for Groq API

### Team Collaboration
- Role-based access control (admin, developer, viewer)
- Team invitations via email
- Member management
- Shared team workspace

### Workflow Customization
- Custom workflow states (backlog, unstarted, started, completed, canceled)
- Drag-and-drop state management
- Color-coded states
- Position-based ordering

## User Flows

### Creating an Issue (Traditional)
1. Click "New Issue" button
2. Fill in title, description, priority
3. Assign to project and team member
4. Add labels and estimate
5. Set workflow state
6. Save

### Creating an Issue (AI-Powered)
1. Open AI chatbot
2. Say: "Create a bug for login page not loading"
3. AI asks follow-up questions if needed
4. AI creates issue with smart defaults
5. User confirms or adjusts

### Managing Projects
1. Navigate to Projects view
2. Create new project with key and color
3. Assign project lead
4. Add issues to project
5. Track project progress

## Design Principles

### Swiss Design Influence
- **Clarity**: Clean, uncluttered interfaces
- **Hierarchy**: Clear visual hierarchy with typography
- **Grid System**: Consistent spacing (4px base unit)
- **Typography**: Inter font family throughout
- **Color**: Notion-inspired dark theme with HSL system

### Interaction Patterns
- Subtle, purposeful animations
- Keyboard shortcuts for power users
- Drag-and-drop for reordering
- Inline editing where possible
- Toast notifications for feedback

## Competitive Positioning

### vs Linear
- **Advantage**: Open source, self-hostable, BYOK AI
- **Trade-off**: Fewer integrations, smaller ecosystem

### vs Jira
- **Advantage**: Simpler, faster, modern UI, AI-first
- **Trade-off**: Less enterprise features, fewer customization options

### vs Asana
- **Advantage**: Developer-focused, better for technical teams
- **Trade-off**: Less suited for non-technical project management

## Success Metrics
- Time to create first issue < 30 seconds
- AI chatbot usage rate > 40% of issue creation
- Team invitation acceptance rate > 80%
- Average issue resolution time
- User retention after 30 days

## Future Roadmap Considerations
- GitHub/GitLab integration
- Time tracking
- Sprint planning tools
- Advanced reporting and analytics
- Mobile apps
- Slack/Discord notifications
- Custom fields
- Automation rules
- API webhooks

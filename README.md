# Doable

A modern task management platform built with Next.js.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Stack Auth](https://img.shields.io/badge/Stack_Auth-2.7-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## Overview

Doable is a comprehensive task management solution designed for modern teams.

## Features

- **Modern Interface** - Clean, intuitive design inspired by Swiss design principles
- **Team Collaboration** - Built-in team management with role-based permissions
- **Lightning Fast** - Built with Next.js 14 and optimized for performance
- **Secure & Reliable** - Enterprise-grade security with Stack Auth
- **Open Source** - Full source code available for customization
- **Modular Design** - Clean architecture with reusable components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom Swiss design system
- **Authentication**: Stack Auth
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Custom components with Shadcn/ui base
- **Forms**: React Hook Form with Zod validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stack Auth account

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
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/doable"
   STACK_PROJECT_ID="your-stack-project-id"
   STACK_PUBLISHABLE_CLIENT_KEY="your-stack-publishable-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
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
│   └── handler/           # Stack Auth handler
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

### Authentication
- Seamless Stack Auth integration
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

### Stack Auth Setup

1. Create a new project in [Stack Auth Dashboard](https://stack-auth.com)
2. Configure OAuth providers (optional)
3. Set up team management settings
4. Copy your project credentials to `.env`

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Make sure your database is running and accessible via the `DATABASE_URL` environment variable.

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

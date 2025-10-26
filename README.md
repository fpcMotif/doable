# Doable

A modern task management platform built with Next.js.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Clerk](https://img.shields.io/badge/Clerk-Auth-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

## Overview

Doable is a comprehensive task management solution designed for modern teams.

## Features

- **Modern Interface** - Clean, intuitive design inspired by Swiss design principles
- **Team Collaboration** - Built-in team management with role-based permissions
- **Lightning Fast** - Built with Next.js 14 and optimized for performance
- **Secure & Reliable** - Enterprise-grade security with Clerk
- **Open Source** - Full source code available for customization
- **Modular Design** - Clean architecture with reusable components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom Swiss design system
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Custom components with Shadcn/ui base
- **Forms**: React Hook Form with Zod validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account

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
   # Clerk Authentication (Required)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   
   # Database (Required)
   DATABASE_URL="postgresql://username:password@localhost:5432/doable"
   
   # Application URL (Optional)
   NEXT_PUBLIC_URL=http://localhost:3000
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
- Seamless Clerk integration
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

### Clerk Setup

1. Create a new project in [Clerk Dashboard](https://dashboard.clerk.com)
2. Configure OAuth providers (optional)
3. Set up team management settings
4. Copy your publishable key and secret key to `.env`
5. Set the environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (starts with `pk_test_` or `pk_live_`)
   - `CLERK_SECRET_KEY`: Your Clerk secret key (starts with `sk_test_` or `sk_live_`)

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Make sure your database is running and accessible via the `DATABASE_URL` environment variable.

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
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `NEXT_PUBLIC_URL` (optional, Vercel sets this automatically)

4. **Deploy**
   Vercel will automatically deploy your application on push to main branch.

**Note**: The application will build successfully even without Clerk keys for static pages, but authentication features require the keys to be set.

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

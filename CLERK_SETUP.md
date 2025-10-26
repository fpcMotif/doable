# Clerk Setup Instructions

## Quick Start

1. **Create a Clerk Account**
   - Go to https://clerk.com and sign up
   - Create a new application
   - Choose "Next.js" as your framework

2. **Get Your API Keys**
   - In the Clerk dashboard, go to "API Keys"
   - Copy your publishable key and secret key

3. **Add Environment Variables**
   Create or update your `.env.local` file:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Authentication Flow

### Sign-In/Sign-Up Pages

By default, Clerk provides hosted authentication pages. You can access them at:
- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`

To add custom pages, create:
- `app/sign-in/[[...sign-in]]/page.tsx`
- `app/sign-up/[[...sign-up]]/page.tsx`

### Protected Routes

The middleware automatically protects:
- All `/api/*` routes (except public ones)
- All `/dashboard/*` routes

Public routes (no authentication required):
- `/`
- `/sign-in/*`
- `/sign-up/*`
- `/api/public/*`

## Key Differences from Stackframe

1. **User Authentication**
   - Uses Clerk's `useUser()` hook instead of Stackframe's
   - User data structure is different (check Clerk docs for available fields)

2. **Team Management**
   - Teams are stored in your local Prisma database
   - Currently teams are created via the API, not through Clerk Organizations
   - See `MIGRATION_GUIDE.md` for integration options

3. **API Routes**
   - All routes now use `auth()` and `currentUser()` from `@clerk/nextjs/server`
   - Example: `const { userId } = await auth()`

## Next Steps

### 1. Test Authentication
Run the app and try:
- Sign up for a new account
- Sign in
- Create a team
- Access the dashboard

### 2. Configure Clerk Providers
In Clerk dashboard, enable authentication providers you want:
- Email/password (default)
- OAuth providers (Google, GitHub, etc.)

### 3. Team/Organization Setup (Optional)
For production, consider integrating Clerk Organizations:
- Better team management
- Role-based access control
- Invitation system

See: https://clerk.com/docs/organizations/overview

## Documentation

- [Clerk Next.js Guide](https://clerk.com/docs/nextjs/getting-started)
- [App Router](https://clerk.com/docs/nextjs/app-router)
- [Organizations](https://clerk.com/docs/organizations/overview)
- [Middleware](https://clerk.com/docs/nextjs/middleware)

## Troubleshooting

**Issue**: "Clerk: Missing publishableKey error"
- **Solution**: Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`

**Issue**: API routes return 401 Unauthorized
- **Solution**: Check that `CLERK_SECRET_KEY` is set correctly
- Make sure middleware is running (check `middleware.ts`)

**Issue**: Cannot sign in
- **Solution**: Check Clerk dashboard for errors
- Verify API keys are correct
- Check browser console for errors


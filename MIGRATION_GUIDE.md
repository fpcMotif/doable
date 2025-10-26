# Migration from Stackframe to Clerk

This document outlines the changes made to migrate from Stackframe (@stackframe/stack) to Clerk (@clerk/nextjs) authentication.

## Summary

The project has been migrated from Stackframe to Clerk for authentication. Stackframe has been completely removed and replaced with Clerk's authentication solution.

## Changes Made

### 1. Package Changes

- **Removed**: `@stackframe/stack` package
- **Added**: `@clerk/nextjs` package

### 2. Core Files Modified

#### `middleware.ts`
- Replaced custom middleware with Clerk's `clerkMiddleware`
- Added public routes configuration
- Protected all non-public routes automatically

#### `app/layout.tsx`
- Replaced `StackProvider` and `StackTheme` with `ClerkProvider`
- Removed `stackServerApp` import

#### `lib/auth.ts` (NEW)
- Created new auth helper functions for Clerk:
  - `getAuthUser()` - Get current user ID
  - `requireAuth()` - Require authentication or throw error
  - `getAuthHeaders()` - Get auth headers for API calls

### 3. API Routes Updated

All API routes have been updated to use Clerk authentication:

- `app/api/teams/create/route.ts` - Team creation now uses Clerk auth
- `app/api/teams/[teamId]/projects/route.ts` - Project routes use Clerk
- `app/api/teams/[teamId]/issues/route.ts` - Issue routes use Clerk
- `app/api/teams/[teamId]/members/route.ts` - Member routes use Clerk
- `app/api/teams/[teamId]/sync/route.ts` - Sync route uses Clerk

### 4. Components Updated

#### Client Components
- `components/handler-header.tsx` - Updated to use Clerk's `UserButton` and `useUser`
- `components/shared/team-selector.tsx` - Updated to use Clerk's `useUser`
- `components/shared/user-selector.tsx` - Updated to use Clerk's `useUser`
- `app/dashboard/page-client.tsx` - Updated to use Clerk's `useUser`
- `app/dashboard/[teamId]/layout.tsx` - Updated to use Clerk's `useUser`

### 5. Files Removed

- `stack.tsx` - Deleted (no longer needed)
- `app/handler/[...stack]/` directory - Deleted (no longer needed)

## Environment Variables Required

Add the following to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get these from: https://dashboard.clerk.com

## Next Steps

1. **Set up Clerk Account**: 
   - Sign up at https://clerk.com
   - Create an application
   - Get your API keys

2. **Update Environment Variables**:
   - Add Clerk API keys to `.env.local`

3. **Configure Sign-in/Sign-up pages**:
   - Clerk provides hosted pages by default
   - Or create custom pages at `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`

4. **Team/Organization Management**:
   - Currently teams are stored in your local Prisma database
   - For production, consider integrating Clerk Organizations API
   - See: https://clerk.com/docs/organizations/overview

5. **Test the Application**:
   - Run `npm run dev`
   - Test authentication flow
   - Verify team creation and management

## Migration Notes

### User IDs
- Stackframe user IDs vs Clerk user IDs
- Ensure your database schema is compatible
- Consider a migration script if you have existing users

### Team Management
- The current implementation creates teams in the local database
- For full team/organization features, integrate Clerk Organizations
- See: https://clerk.com/docs/organizations/overview

### Breaking Changes
- All `stackServerApp` API calls have been replaced with Clerk equivalents
- `useUser()` from `@stackframe/stack` replaced with `useUser()` from `@clerk/nextjs`
- Team objects structure changed (from Stackframe's format to local DB format)

## Clerk Documentation

- Next.js Guide: https://clerk.com/docs/nextjs/getting-started
- App Router: https://clerk.com/docs/nextjs/app-router
- Organizations: https://clerk.com/docs/organizations/overview

## Support

If you encounter issues:
1. Check the Clerk dashboard for errors
2. Review the Clerk docs for your use case
3. Ensure environment variables are set correctly


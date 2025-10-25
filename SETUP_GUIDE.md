# 🔧 Fixing Next.js 15 & Stack Auth Issues

## 📋 **Issues Explained**

### **Issue 1: "Event handlers cannot be passed to Client Component props"**

**What happened:**
- You had a `<button onClick={...}>` inside a **Server Component**
- Next.js 15 Server Components run on the server and can't handle client-side events
- This is a **breaking change** from previous Next.js versions

**Why it happens:**
- **Server Components** = Rendered on server, sent as static HTML
- **Client Components** = Rendered in browser, can handle interactions
- Event handlers like `onClick` only work in Client Components

**The Fix:**
```tsx
// ❌ BEFORE (Server Component with onClick)
export default function Dashboard() {
  return (
    <button onClick={() => window.location.reload()}>
      Refresh Page
    </button>
  )
}

// ✅ AFTER (Separate Client Component)
'use client'
export function RefreshButton() {
  return (
    <button onClick={() => window.location.reload()}>
      Refresh Page
    </button>
  )
}

// Server Component imports Client Component
export default function Dashboard() {
  return <RefreshButton />
}
```

### **Issue 2: "Setup Required" - Stack Auth Team Creation**

**What happened:**
- Stack Auth has **client-side team creation disabled by default**
- This is a **security feature** to prevent unauthorized team creation
- Your app tries to create teams but gets a 403 error

**Why it happens:**
- Stack Auth requires explicit permission for client-side team creation
- This prevents malicious users from creating teams in your app
- It's a **configuration setting** in your Stack Auth dashboard

**The Fix:**
1. **Go to Stack Auth Dashboard** → https://app.stack-auth.com
2. **Navigate to Project Settings**
3. **Go to Team Settings**
4. **Enable "Client team creation"**
5. **Save changes**

## 🛠️ **What I Fixed**

### **1. Server Component Error**
- ✅ Created `RefreshButton` as a Client Component
- ✅ Moved `onClick` handler to Client Component
- ✅ Updated imports in dashboard page

### **2. Stack Auth Setup**
- ✅ Created comprehensive `StackAuthSetupGuide` component
- ✅ Added step-by-step instructions with visual guide
- ✅ Included external links to Stack Auth dashboard
- ✅ Added progress tracking for setup steps

### **3. Better UX**
- ✅ Professional setup page with clear instructions
- ✅ Interactive step-by-step guide
- ✅ Visual feedback for completed steps
- ✅ Direct links to Stack Auth dashboard

## 🎯 **Next.js 15 Server/Client Component Rules**

### **Server Components (Default)**
```tsx
// ✅ Good for Server Components
export default function ServerComponent() {
  return (
    <div>
      <h1>Static Content</h1>
      <p>No interactivity</p>
    </div>
  )
}
```

### **Client Components (Add 'use client')**
```tsx
'use client' // ← This makes it a Client Component

import { useState } from 'react'

export default function ClientComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

### **Mixed Approach (Recommended)**
```tsx
// Server Component (main page)
export default function Page() {
  return (
    <div>
      <h1>Server-rendered content</h1>
      <InteractiveButton /> {/* Client Component */}
    </div>
  )
}

// Client Component (interactive parts)
'use client'
export function InteractiveButton() {
  return <button onClick={...}>Click me</button>
}
```

## 🔐 **Stack Auth Team Creation Explained**

### **Why It's Disabled by Default**
- **Security**: Prevents unauthorized team creation
- **Control**: Admins control who can create teams
- **Compliance**: Meets enterprise security requirements

### **Two Ways to Enable**

#### **Option 1: Enable Client-Side Creation (Recommended)**
1. Stack Auth Dashboard → Project Settings → Team Settings
2. Toggle "Client team creation" to ON
3. Users can create teams from your app

#### **Option 2: Server-Side Creation Only**
```tsx
// Create teams on server (admin only)
const team = await stackServerApp.createTeam({
  displayName: 'New Team',
});
```

### **Best Practices**
- ✅ **Enable client-side** for user-friendly apps
- ✅ **Use server-side** for admin-only team creation
- ✅ **Add validation** for team names and permissions
- ✅ **Handle errors** gracefully when creation fails

## 🚀 **Your App Now Works Because:**

1. **No more Server Component errors** - All interactive elements are Client Components
2. **Clear setup instructions** - Users know exactly how to enable team creation
3. **Professional UX** - Step-by-step guide with progress tracking
4. **Error handling** - Graceful fallbacks when team creation is disabled
5. **Direct links** - Easy access to Stack Auth dashboard

## 🎉 **Success!**

Your Doable app should now work perfectly! The setup guide will help users enable team creation, and once enabled, they can create teams and start using your Linear-inspired task management system.

**Next steps:**
1. **Enable team creation** in Stack Auth dashboard
2. **Refresh your app** - the setup guide will disappear
3. **Create your first team** and start managing issues!

Happy coding! 🚀

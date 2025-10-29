# Remaining Error Fixes Summary

## Completed ✅
1. Fixed syntax error in `components/ai/ai-chatbot.tsx` 
2. Merged duplicate imports in multiple route files
3. Removed unused router variables in sign-in/sign-up
4. Fixed unused catch parameters
5. Removed unused imports (Label, Calendar, MapPin, Workflow, etc.)

## Still Need Fixing (96 total)

### High Priority - Type Safety
- app/dashboard/[teamId]/issues/page.tsx: Type cache properly
- components/issues/issue-table.tsx: Fix `getProjectInfo` parameter type
- app/dashboard/[teamId]/layout.tsx: Type team state properly
- components/shared/workspace-selector.tsx: Type teams array
- lib/types/chat.ts: Type toolCalls properly

### Medium Priority - Unused Variables (40+)
- Remove unused error variables with underscore prefix
- Remove unused function parameters

### Low Priority - Console Statements (50+)
These are intentional for logging/debugging - mark them with eslint-disable comments

### React Hooks Issues
- Fix dependency arrays in useEffect hooks
- Add missing dependencies or use useEffectEvent properly

## Strategy
1. Run lint with `--fix` flag (already done - fixed 2 files)
2. Manually fix critical type errors (in progress)
3. Add eslint-disable for intentional console statements
4. Fix React Hook dependencies last


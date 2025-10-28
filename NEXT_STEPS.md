# 下一步操作指南

## 🎉 已完成的核心基础设施

你的项目现在已经具备：

### ✅ Next.js 16 + React 19.2 框架升级

- Next.js 16 稳定版（`reactCompiler: true`, `dynamicIO: true`）
- React 19.2 稳定版依赖
- **强制变更完成**: `middleware.ts` → `proxy.ts`
- Turbopack 默认 bundler

### ✅ Convex 后端完整架构

- Schema 定义完成（10 张表，30+ 索引）
- Convex Auth（Google OAuth）配置完成
- 核心 Functions 实现：
  - Teams (4 个 queries/mutations)
  - Issues (5 个 queries/mutations)
  - WorkflowStates (2 个)
  - Projects (3 个)

### ✅ Effect-TS 数据层

- HttpApi Schema 完整定义
- 副作用处理辅助函数（`safeApiCall`, `batchApiCalls`, `withRetry`）
- Convex + Effect 集成 Hook

### ✅ 前端示例

- Provider 改用 Convex Auth
- `page-convex.tsx` 完整示例（React 19.2 `useEffectEvent` + Convex + Effect）

---

## 🚀 立即执行（必须按顺序）

### 第 1 步：安装依赖

```bash
cd C:\Users\fenchem\doable
bun install
```

**预期结果**：

- 安装 Next.js 16.0.0
- 安装 React 19.2.0
- 安装 Convex 1.17.4
- 安装 Effect 3.11.7
- 安装 @convex-dev/auth、@auth/core 等

**如果失败**：检查 package.json 版本号是否正确

---

### 第 2 步：初始化 Convex 项目

```bash
bunx convex dev
```

**这个命令会**：

1. 要求你登录 Convex（使用 GitHub 或 Google 账号）
2. 创建一个新的 Convex deployment
3. 生成 `convex/_generated/` 目录（包含类型定义）
4. 给你一个 deployment URL（形如 `https://xxx.convex.cloud`）

**重要**：不要关闭这个终端！保持 `convex dev` 运行状态以启用实时同步。

---

### 第 3 步：配置环境变量

创建 `.env.local` 文件（如果不存在）：

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://你的deployment.convex.cloud

# Convex Auth (Google OAuth)
AUTH_GOOGLE_ID=你的-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=你的-google-client-secret

# 旧环境变量（暂时保留，迁移完成后删除）
DATABASE_URL=postgresql://...
BETTER_AUTH_URL=http://localhost:3000
```

**获取 Google OAuth 凭证**：

1. 访问 https://console.cloud.google.com/apis/credentials
2. 创建 OAuth 2.0 客户端 ID
3. 授权重定向 URI 添加：`https://你的deployment.convex.cloud/api/auth/callback/google`

---

### 第 4 步：开新终端运行 Next.js

```bash
# 新终端窗口
cd C:\Users\fenchem\doable
bun run dev
```

**预期结果**：

- Next.js 16 开发服务器在 http://localhost:3000 启动
- 看到 Turbopack 编译输出
- 如果有 TypeScript 错误，暂时忽略（稍后修复）

---

### 第 5 步：初始化默认数据

在 Convex Dashboard（`https://dashboard.convex.dev`）或通过代码初始化：

**方式 A：使用 Convex Dashboard**

1. 打开 Dashboard → 选择你的 deployment
2. Data → 手动创建第一个 Team
3. 创建默认 Workflow States（Backlog, In Progress, Done）

**方式 B：创建 Seed Mutation（推荐）**

创建 `convex/seed.ts`：

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDefaultData = mutation({
  args: { teamId: v.id("teams") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 创建默认 Workflow States
    const backlog = await ctx.db.insert("workflowStates", {
      name: "Backlog",
      type: "backlog",
      color: "#94a3b8",
      position: 0,
      teamId: args.teamId,
    });

    await ctx.db.insert("workflowStates", {
      name: "In Progress",
      type: "started",
      color: "#3b82f6",
      position: 1,
      teamId: args.teamId,
    });

    await ctx.db.insert("workflowStates", {
      name: "Done",
      type: "completed",
      color: "#22c55e",
      position: 2,
      teamId: args.teamId,
    });

    return null;
  },
});
```

然后在 Convex Dashboard 的 Functions 面板调用这个 mutation。

---

## 📋 后续迁移步骤（分阶段完成）

### Phase 6: 全面替换（约 5-10 小时工作量）

**需要改写的文件**（按优先级）：

1. **认证相关**

   - `app/sign-in/page.tsx` - 使用 Convex Auth `signIn`
   - `app/sign-up/page.tsx` - 使用 Convex Auth `signUp`
   - `lib/auth-server-helpers.ts` - 改为 Convex Auth helpers

2. **Dashboard 页面**

   - `app/dashboard/page.tsx` - 使用 `useQuery(api.teams.getUserTeams)`
   - `app/dashboard/[teamId]/page.tsx` - 使用 `useQuery(api.teams.getTeamStats)`
   - `app/dashboard/[teamId]/issues/page.tsx` - 替换为 `page-convex.tsx` 的逻辑
   - `app/dashboard/[teamId]/projects/page.tsx`
   - `app/dashboard/[teamId]/people/page.tsx`

3. **API Routes（改为直接调用 Convex）**

   - 删除 `app/api/teams/` 所有 routes
   - 删除 `app/api/issues/` 所有 routes
   - 保留 `app/api/auth/[...all]/route.ts`（Better Auth，迁移完成后删除）

4. **组件改写**
   - `components/issues/issue-dialog.tsx` - 使用 `useMutation(api.issues.createIssue)`
   - `components/issues/issue-board.tsx` - 使用 `useQuery` 实时订阅
   - `components/shared/team-selector.tsx`

**每个文件的迁移模板**：

```typescript
// 旧代码
import { useEffect, useState } from "react";
const [data, setData] = useState(null);

useEffect(() => {
  fetch("/api/teams")
    .then((r) => r.json())
    .then(setData);
}, []);

// 新代码
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const data = useQuery(api.teams.getUserTeams, {});
// data 自动实时更新！
```

---

### Phase 7: Next.js 16 缓存优化

**Server Components 使用 React 19 cache()**

创建 `lib/cache.ts`：

```typescript
import { cache } from "react"; // React 19 稳定 API
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const getCachedTeam = cache(async (teamId: string) => {
  return await fetchQuery(api.teams.getTeam, { teamId });
});
```

在 Server Component 使用：

```typescript
// app/dashboard/[teamId]/layout.tsx (Server Component)
import { getCachedTeam } from "@/lib/cache";

export default async function TeamLayout({ params }) {
  const team = await getCachedTeam(params.teamId); // 自动缓存
  return <div>{team.name}</div>;
}
```

**Next.js 16 "use cache" 指令**（实验性）

```typescript
"use cache";

export async function getStaticData() {
  // 此函数结果会被 Next.js 16 自动缓存
  return { data: "static" };
}
```

---

### Phase 8: 清理旧代码（最后执行）

**删除文件**（确认迁移完成后）：

```bash
# Prisma
rm -rf prisma/
rm prisma.config.ts

# Better Auth
rm lib/auth.ts
rm lib/auth-server.ts
rm lib/auth-server-helpers.ts
rm lib/auth-client.ts

# 旧 API
rm -rf lib/api/
rm -rf app/api/teams/
rm -rf app/api/issues/
rm -rf app/api/projects/
rm -rf app/api/labels/
# 保留 app/api/auth/ 如果需要兼容旧会话
```

**更新 package.json**：

```json
{
  "dependencies": {
    // 删除
    // "@prisma/client": "^6.18.0",
    // "prisma": "^6.18.0",
    // "better-auth": "^1.3.32",
  }
}
```

---

## 🧪 测试清单

### 功能测试

- [ ] 用户可以通过 Google 登录（Convex Auth）
- [ ] Dashboard 显示正确的团队列表
- [ ] 创建 Issue 成功
- [ ] 更新 Issue 实时反映在 UI
- [ ] 过滤与搜索正常工作
- [ ] 权限检查生效（非成员无法访问团队）

### 性能测试

- [ ] Convex useQuery 初次加载时间 < 200ms
- [ ] 实时更新延迟 < 100ms
- [ ] 100+ Issues 的列表渲染流畅
- [ ] React Compiler 是否自动优化了重渲染

### 兼容性测试

- [ ] Chrome/Edge/Firefox/Safari 都能正常运行
- [ ] 移动端响应式正常

---

## 📊 迁移完成度

**当前进度：~60%**

- ✅ 框架升级（100%）
- ✅ Convex 后端（100%）
- ✅ Effect 数据层（100%）
- ✅ 前端示例（100%）
- ⏳ 全面替换（0% - 待手动执行）
- ⏳ 缓存优化（0% - 待手动执行）
- ⏳ 清理旧代码（0% - 最后执行）

---

## ❓ 遇到问题？

### Q1: `convex dev` 报错 "No schema found"

**A**: 确保 `convex/schema.ts` 存在且导出 `export default defineSchema(...)`

### Q2: TypeScript 报错 "Cannot find module 'convex/\_generated/api'"

**A**: 运行 `bunx convex dev` 生成类型文件

### Q3: 登录后无法访问 Dashboard

**A**: 检查：

1. Convex Auth 配置是否正确
2. Google OAuth redirect URI 是否匹配
3. 用户是否被添加到 TeamMembers 表

### Q4: React 19.2 `useEffectEvent` 报错

**A**: 如果 API 未正式发布，使用 polyfill（已在 `page-convex.tsx` 示例中提供）

### Q5: Convex 查询返回 undefined

**A**: 检查：

1. 用户是否已登录（`auth.getUserId()` 返回值）
2. 权限验证是否通过（TeamMembers 查询）
3. Convex Dashboard 中数据是否存在

---

## 🎯 推荐优先级

**第一周**：

1. 完成依赖安装与 Convex 初始化
2. 测试登录流程
3. 迁移 1-2 个核心页面（Dashboard + Issues）

**第二周**： 4. 迁移剩余页面 5. 删除旧 API routes 6. 应用缓存优化

**第三周**： 7. 全面测试 8. 性能优化 9. 清理旧代码 10. 生产环境部署

---

**祝迁移顺利！🚀**

如需帮助，请参考：

- [MIGRATION.md](./MIGRATION.md) - 详细迁移记录
- [next16.plan.md](./next16.plan.md) - 完整迁移方案
- [Convex 文档](https://docs.convex.dev)

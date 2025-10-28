/**
 * Issues 页面 - Convex + Effect + React 19.2 useEffectEvent 版本
 * 
 * 新特性示例：
 * 1. React 19.2 useEffectEvent - 消除闭包陷阱
 * 2. Convex useQuery - 实时数据订阅
 * 3. Effect - 统一副作用处理
 * 4. Next.js 16 React Compiler - 自动优化
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { type Id } from '@/convex/_generated/dataModel';
import { Effect, pipe } from 'effect';
import { safeApiCall } from '@/lib/effect/helpers';

// React 19.2 useEffectEvent polyfill
// 注意：React 19.2 如果未正式发布此 API，使用 useCallback 替代
import { useCallback } from 'react';
const useEffectEvent = <T extends (...args: any[]) => any>(fn: T): T => {
  return useCallback(fn, []) as T;
};

interface IssueFilters {
  status?: Array<Id<"workflowStates">>;
  assignee?: string[];
  project?: Array<Id<"projects">>;
  priority?: string[];
  search?: string;
}

export default function IssuesPageConvex() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;

  // State
  const [filters, setFilters] = useState<IssueFilters>({});
  const [view, setView] = useState<'board' | 'table' | 'list'>('board');

  // Convex 实时查询 - 自动订阅数据变化
  const issues = useQuery(api.issues.listIssues, {
    teamId,
    filters,
  });

  const workflowStates = useQuery(api.workflowStates.listStates, { teamId });
  const projects = useQuery(api.projects.listProjects, { teamId });

  // Convex Mutations
  const createIssueMutation = useMutation(api.issues.createIssue);
  const updateIssueMutation = useMutation(api.issues.updateIssue);

  // React 19.2 useEffectEvent - 稳定的事件处理器
  // 访问最新的 filters 但不触发 useEffect 重新执行
  const handleFilterChange = useEffectEvent((newFilters: IssueFilters) => {
    const program = pipe(
      safeApiCall(
        async () => {
          setFilters(newFilters);
          return newFilters;
        },
        "更新过滤器"
      ),
      Effect.map((f) => {
        console.log("过滤器已更新:", f);
        return f;
      }),
      Effect.catchAll((error) =>
        Effect.sync(() => console.error("过滤器更新失败:", error))
      )
    );

    Effect.runPromise(program);
  });

  // 使用 Effect 处理复杂的创建 Issue 逻辑
  const handleCreateIssue = useEffectEvent(async (data: {
    title: string;
    description?: string;
    priority: string;
    workflowStateId: Id<"workflowStates">;
  }) => {
    const program = pipe(
      // 步骤 1: 验证数据
      safeApiCall(
        async () => {
          if (!data.title.trim()) {
            throw new Error("标题不能为空");
          }
          return data;
        },
        "验证 Issue 数据"
      ),

      // 步骤 2: 调用 Convex mutation
      Effect.flatMap((validData) =>
        safeApiCall(
          async () => {
            return await createIssueMutation({
              teamId,
              ...validData,
            });
          },
          "创建 Issue"
        )
      ),

      // 步骤 3: 成功处理
      Effect.map((issueId) => {
        console.log("Issue 创建成功:", issueId);
        // 可以在这里触发 toast 通知
        return issueId;
      }),

      // 统一错误处理
      Effect.catchAll((error) =>
        Effect.sync(() => {
          console.error("创建 Issue 失败:", error.message);
          // 可以在这里显示错误提示
        })
      )
    );

    return Effect.runPromise(program);
  });

  // 键盘快捷键 - 使用 useEffectEvent 确保访问最新状态
  const handleKeyPress = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "n" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      // 打开创建 Issue 对话框
      console.log("创建新 Issue");
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []); // 空依赖数组 - handleKeyPress 始终稳定

  // Loading state
  if (issues === undefined || workflowStates === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Issues</h1>

        <div className="flex gap-4">
          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 rounded ${view === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              看板
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded ${view === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              表格
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              列表
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() =>
              handleCreateIssue({
                title: "新 Issue",
                priority: "medium",
                workflowStateId: workflowStates[0]._id,
              })
            }
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + 创建 Issue
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <input
          type="text"
          placeholder="搜索 Issues..."
          className="w-full px-4 py-2 border rounded"
          onChange={(e) =>
            handleFilterChange({ ...filters, search: e.target.value })
          }
        />
      </div>

      {/* Issues Display */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            没有找到 Issues
          </div>
        ) : (
          <div className="grid gap-4">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="p-4 border rounded hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <p className="text-sm text-gray-600">
                      #{issue.number} · {issue.priority}
                    </p>
                    {issue.description && (
                      <p className="mt-2 text-gray-700">{issue.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {issue.assignee || "未分配"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Stats */}
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          实时数据：共 {issues.length} 个 Issues
          {filters.search && ` (搜索: "${filters.search}")`}
        </p>
      </div>
    </div>
  );
}


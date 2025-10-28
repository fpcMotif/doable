/**
 * Prisma → Convex 数据迁移脚本
 * 
 * 使用方法：
 * 1. 确保 Convex dev 环境已启动
 * 2. 运行: bunx tsx scripts/migrate-to-convex.ts
 */

import { PrismaClient } from "@prisma/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const prisma = new PrismaClient();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function migrateTeams() {
  console.log("迁移 Teams...");
  const teams = await prisma.team.findMany();

  for (const team of teams) {
    try {
      await convex.mutation(api.teams.createTeam, {
        name: team.name,
        key: team.key,
      });
      console.log(`✓ Team: ${team.name}`);
    } catch (error) {
      console.error(`✗ Team ${team.name}:`, error);
    }
  }
}

async function migrateUsers() {
  console.log("\n迁移 Users...");
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Convex Auth 会自动创建用户，此处仅记录
    console.log(`User: ${user.name} (${user.email})`);
  }
}

async function migrateWorkflowStates() {
  console.log("\n迁移 Workflow States...");
  const states = await prisma.workflowState.findMany();

  // 注意：需要先创建对应的 mutation
  console.log(`Found ${states.length} workflow states (需手动导入)`);
}

async function migrateProjects() {
  console.log("\n迁移 Projects...");
  const projects = await prisma.project.findMany();

  console.log(`Found ${projects.length} projects (需手动导入)`);
}

async function migrateIssues() {
  console.log("\n迁移 Issues...");
  const issues = await prisma.issue.findMany();

  console.log(`Found ${issues.length} issues (需手动导入)`);
}

async function main() {
  console.log("开始 Prisma → Convex 数据迁移\n");
  console.log("====================================\n");

  try {
    await migrateTeams();
    await migrateUsers();
    await migrateWorkflowStates();
    await migrateProjects();
    await migrateIssues();

    console.log("\n====================================");
    console.log("迁移完成！");
    console.log("\n注意：部分数据需要手动创建对应的 mutations 才能导入");
  } catch (error) {
    console.error("迁移失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


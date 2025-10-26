import { db } from '@/lib/db'
import { CreateIssueData, UpdateIssueData, IssueFilters, IssueSort } from '@/lib/types'

export async function getIssues(
  teamId: string,
  filters: IssueFilters = {},
  sort: IssueSort = { field: 'createdAt', direction: 'desc' }
) {
  const where: any = {
    teamId,
  }

  // Apply filters
  if (filters.status?.length) {
    where.workflowStateId = {
      in: filters.status,
    }
  }

  if (filters.assignee?.length) {
    where.assigneeId = {
      in: filters.assignee,
    }
  }

  if (filters.project?.length) {
    where.projectId = {
      in: filters.project,
    }
  }

  if (filters.priority?.length) {
    where.priority = {
      in: filters.priority,
    }
  }

  if (filters.label?.length) {
    where.labels = {
      some: {
        labelId: {
          in: filters.label,
        },
      },
    }
  }

  if (filters.search) {
    where.OR = [
      {
        title: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      },
    ]
  }

  const orderBy: any = {}
  orderBy[sort.field] = sort.direction

  return await db.issue.findMany({
    where,
    orderBy,
    select: {
      id: true,
      title: true,
      description: true,
      number: true,
      priority: true,
      estimate: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      teamId: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          color: true,
        },
      },
      workflowStateId: true,
      workflowState: true,
      assigneeId: true,
      assignee: true,
      creatorId: true,
      creator: true,
      team: true,
      labels: {
        include: {
          label: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function getIssueById(teamId: string, issueId: string) {
  return await db.issue.findFirst({
    where: {
      id: issueId,
      teamId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      number: true,
      priority: true,
      estimate: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      teamId: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          color: true,
        },
      },
      workflowStateId: true,
      workflowState: true,
      assigneeId: true,
      assignee: true,
      creatorId: true,
      creator: true,
      team: true,
      labels: {
        include: {
          label: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export async function createIssue(teamId: string, data: CreateIssueData, creatorId: string, creatorName: string) {
  // Extract labelIds and exclude from main data
  const { labelIds, projectId, ...issueData } = data

  // Parallel operations: Get next issue number and verify project if needed
  const [lastIssue, project] = await Promise.all([
    db.issue.findFirst({
      where: { teamId },
      orderBy: { number: 'desc' },
      select: { number: true },
    }),
    projectId ? db.project.findFirst({ where: { id: projectId, teamId } }) : Promise.resolve(null)
  ])

  const nextNumber = (lastIssue?.number || 0) + 1

  // Prepare issue data
  const issueDataToCreate: any = {
    title: issueData.title,
    description: issueData.description,
    workflowStateId: issueData.workflowStateId,
    assigneeId: issueData.assigneeId,
    assignee: issueData.assignee,
    priority: issueData.priority || 'none',
    estimate: issueData.estimate,
    teamId,
    creatorId,
    creator: creatorName,
    number: nextNumber,
  }

  // Only set projectId if it exists and belongs to this team (verified by query)
  if (project) {
    issueDataToCreate.projectId = projectId
  }

  // Create the issue with a select that includes all necessary relations
  const selectConfig = {
    id: true,
    title: true,
    description: true,
    number: true,
    priority: true,
    estimate: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true,
    teamId: true,
    projectId: true,
    project: {
      select: {
        id: true,
        name: true,
        key: true,
        color: true,
      },
    },
    workflowStateId: true,
    workflowState: true,
    assigneeId: true,
    assignee: true,
    creatorId: true,
    creator: true,
    team: true,
    labels: {
      include: {
        label: true,
      },
    },
    comments: true,
  }

  // If labels are provided, create them in the same transaction or directly after
  if (labelIds?.length) {
    // Create issue first
    const issue = await db.issue.create({
      data: issueDataToCreate,
      select: selectConfig,
    })

    // Then create labels in parallel
    await db.issueLabel.createMany({
      data: labelIds.map((labelId) => ({
        issueId: issue.id,
        labelId,
      })),
    })

    // Refetch with labels
    return await db.issue.findUnique({
      where: { id: issue.id },
      select: selectConfig,
    })
  }

  // Create issue without labels
  return await db.issue.create({
    data: issueDataToCreate,
    select: selectConfig,
  })
}

export async function updateIssue(teamId: string, issueId: string, data: UpdateIssueData) {
  // Handle labels separately
  if (data.labelIds !== undefined) {
    // Remove existing labels
    await db.issueLabel.deleteMany({
      where: { issueId },
    })

    // Add new labels
    if (data.labelIds.length > 0) {
      await db.issueLabel.createMany({
        data: data.labelIds.map((labelId) => ({
          issueId,
          labelId,
        })),
      })
    }
  }

  // Update the issue (excluding labelIds)
  const { labelIds, ...updateData } = data

  const updatedIssue = await db.issue.update({
    where: {
      id: issueId,
      teamId,
    },
    data: updateData,
    select: {
      id: true,
      title: true,
      description: true,
      number: true,
      priority: true,
      estimate: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      teamId: true,
      projectId: true,
      project: {
        select: {
          id: true,
          name: true,
          key: true,
          color: true,
        },
      },
      workflowStateId: true,
      workflowState: true,
      assigneeId: true,
      assignee: true,
      creatorId: true,
      creator: true,
      team: true,
      labels: {
        include: {
          label: true,
        },
      },
      comments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  return updatedIssue
}

export async function deleteIssue(teamId: string, issueId: string) {
  return await db.issue.delete({
    where: {
      id: issueId,
      teamId,
    },
  })
}

export async function getIssueStats(teamId: string) {
  const [total, byStatus, byPriority, byAssignee] = await Promise.all([
    db.issue.count({
      where: { teamId },
    }),
    db.issue.groupBy({
      by: ['workflowStateId'],
      where: { teamId },
      _count: true,
    }),
    db.issue.groupBy({
      by: ['priority'],
      where: { teamId },
      _count: true,
    }),
    db.issue.groupBy({
      by: ['assigneeId'],
      where: { 
        teamId,
        assigneeId: { not: null },
      },
      _count: true,
    }),
  ])

  return {
    total,
    byStatus,
    byPriority,
    byAssignee,
  }
}

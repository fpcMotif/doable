'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreateIssueData, UpdateIssueData, PriorityLevel } from '@/lib/types'
import { Project, WorkflowState, Label as LabelType } from '@prisma/client'
import { UserSelector } from '@/components/shared/user-selector'

const issueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  workflowStateId: z.string().min(1, 'Status is required'),
  assigneeId: z.string().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  estimate: z.number().min(0).optional(),
  labelIds: z.array(z.string()).optional(),
})

type IssueFormData = z.infer<typeof issueSchema>

interface IssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateIssueData | UpdateIssueData) => Promise<void>
  projects: Project[]
  workflowStates: WorkflowState[]
  labels: LabelType[]
  initialData?: Partial<IssueFormData>
  title?: string
  description?: string
}

export function IssueDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
  workflowStates,
  labels,
  initialData,
  title = 'Create Issue',
  description = 'Create a new issue for your team.',
}: IssueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    initialData?.labelIds || []
  )

  const form = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      projectId: initialData?.projectId || 'none',
      workflowStateId: initialData?.workflowStateId || (workflowStates.length > 0 ? workflowStates[0].id : ''),
      assigneeId: initialData?.assigneeId || '',
      priority: initialData?.priority || 'none',
      estimate: initialData?.estimate,
      labelIds: initialData?.labelIds || [],
    },
  })

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData)
      setSelectedLabels(initialData.labelIds || [])
    }
  }, [open, initialData, form])

  // Update form when workflow states are loaded
  useEffect(() => {
    if (workflowStates.length > 0 && !form.getValues('workflowStateId')) {
      form.setValue('workflowStateId', workflowStates[0].id)
    }
  }, [workflowStates, form])

  const handleSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        projectId: data.projectId === 'none' ? undefined : data.projectId,
        priority: data.priority || 'none',
        labelIds: selectedLabels,
        estimate: data.estimate,
      })
      form.reset()
      setSelectedLabels([])
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting issue:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Issue title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workflowStateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workflowStates.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <UserSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select assignee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries({
                          none: 'None',
                          low: 'Low',
                          medium: 'Medium',
                          high: 'High',
                          urgent: 'Urgent',
                        }).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimate (Story Points)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g., 5"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-sm font-medium">Labels</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedLabels.includes(label.id)
                        ? 'opacity-100'
                        : 'opacity-50 hover:opacity-75'
                    }`}
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      borderColor: `${label.color}40`,
                    }}
                    onClick={() => toggleLabel(label.id)}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Issue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Label as LabelType,
  Project,
  WorkflowState,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserSelector } from "@/components/shared/user-selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateIssueData, UpdateIssueData } from "@/lib/types";
import { PriorityLevel } from "@/lib/types";

const issueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
  projectId: z.string().optional(),
  workflowStateId: z.string().min(1, "Status is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  estimate: z.number().min(0).optional(),
  labelIds: z.array(z.string()).optional(),
});

type IssueFormData = z.infer<typeof issueSchema>;

type IssueDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateIssueData | UpdateIssueData) => Promise<void>;
  projects: Project[];
  workflowStates: WorkflowState[];
  labels: LabelType[];
  initialData?: Partial<IssueFormData>;
  title?: string;
  description?: string;
  teamId?: string;
};

export function IssueDialog({
  open,
  onOpenChange,
  onSubmit,
  projects,
  workflowStates,
  labels,
  initialData,
  title = "Create Issue",
  description = "Create a new issue for your team.",
  teamId,
}: IssueDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    initialData?.labelIds || []
  );

  const form = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      projectId: initialData?.projectId || "",
      workflowStateId:
        initialData?.workflowStateId ||
        (workflowStates.length > 0 ? workflowStates[0].id : ""),
      assigneeId: initialData?.assigneeId || "",
      priority: initialData?.priority || "none",
      estimate: initialData?.estimate,
      labelIds: initialData?.labelIds || [],
    },
  });

  useEffect(() => {
    if (open && initialData) {
      const resetData = {
        ...initialData,
        projectId: initialData.projectId || "", // Empty string means no project
        labelIds: initialData.labelIds || [],
      };
      form.reset(resetData);
      setSelectedLabels(initialData.labelIds || []);
    } else if (open) {
      // Reset to defaults when opening fresh dialog
      form.reset({
        title: "",
        description: "",
        projectId: "", // Empty string means no project selected
        workflowStateId: workflowStates.length > 0 ? workflowStates[0].id : "",
        assigneeId: "",
        priority: "none",
        estimate: undefined,
        labelIds: [],
      });
      setSelectedLabels([]);
    }
  }, [open, initialData, form, workflowStates]);

  // Update form when workflow states are loaded
  useEffect(() => {
    if (workflowStates.length > 0 && !form.getValues("workflowStateId")) {
      form.setValue("workflowStateId", workflowStates[0].id);
    }
  }, [workflowStates, form]);

  const handleSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        projectId:
          data.projectId && data.projectId.trim() !== ""
            ? data.projectId
            : undefined,
        priority: data.priority || "none",
        labelIds: selectedLabels,
        estimate: data.estimate,
      });
      form.reset();
      setSelectedLabels([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
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
                      className="min-h-[100px]"
                      placeholder="Describe the issue..."
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
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? "" : value)
                      }
                      value={field.value || "none"}
                    >
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
                        onValueChange={field.onChange}
                        placeholder="Select assignee"
                        teamId={teamId}
                        value={field.value}
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
                          none: "None",
                          low: "Low",
                          medium: "Medium",
                          high: "High",
                          urgent: "Urgent",
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
                      min="0"
                      placeholder="e.g., 5"
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
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
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedLabels.includes(label.id)
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-75"
                    }`}
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      borderColor: `${label.color}40`,
                    }}
                    type="button"
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating..." : "Create Issue"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

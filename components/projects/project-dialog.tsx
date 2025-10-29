"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateProjectData, UpdateProjectData } from "@/lib/types";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
  key: z
    .string()
    .min(1, "Key is required")
    .max(10, "Key is too long")
    .regex(/^[A-Z0-9]+$/, "Key must be uppercase letters and numbers only"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
  icon: z.string().optional(),
  leadId: z.string().optional(),
  status: z.enum(["active", "completed", "canceled"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => Promise<void>;
  initialData?: Partial<ProjectFormData>;
  title?: string;
  description?: string;
  teamId?: string;
};

const defaultColors = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#84cc16",
];

const defaultIcons = [
  "🌐",
  "📱",
  "💻",
  "🔧",
  "🎨",
  "📊",
  "🚀",
  "💡",
  "🔒",
  "📈",
];

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title = "Create Project",
  description = "Create a new project for your team.",
  teamId,
}: ProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      key: initialData?.key || "",
      color: initialData?.color || "#6366f1",
      icon: initialData?.icon || "",
      leadId: initialData?.leadId || "",
      status: initialData?.status || "active",
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        leadId: data.leadId || undefined,
        icon: data.icon || undefined,
      });
      form.reset();
      onOpenChange(false);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="PROJ"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="Describe the project..."
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
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="color"
                          {...field}
                          className="h-10 w-full"
                        />
                        <div className="flex flex-wrap gap-2">
                          {defaultColors.map((color) => (
                            <button
                              className={`w-6 h-6 rounded border-2 ${
                                field.value === color
                                  ? "border-gray-900 dark:border-gray-100"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              key={color}
                              onClick={() => field.onChange(color)}
                              style={{ backgroundColor: color }}
                              type="button"
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          placeholder="🌐"
                          {...field}
                          className="text-center"
                        />
                        <div className="flex flex-wrap gap-1">
                          {defaultIcons.map((icon) => (
                            <button
                              className={`w-8 h-8 rounded border text-lg ${
                                field.value === icon
                                  ? "border-gray-900 dark:border-gray-100"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              key={icon}
                              onClick={() => field.onChange(icon)}
                              type="button"
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Lead</FormLabel>
                    <FormControl>
                      <UserSelector
                        onValueChange={field.onChange}
                        placeholder="Select project lead"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

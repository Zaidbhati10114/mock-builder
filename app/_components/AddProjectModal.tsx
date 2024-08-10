"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function AddProject() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { MAX_PROJECTS } = useIsSubscribed();
  const user = useUser();
  const user_info = useQuery(api?.users.getUserById, {
    clerkId: user?.user?.id!,
  });
  const createProject = useMutation(api.projects.createProject);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setIsLoading(true);
      const projectId = await createProject({ projectName: data.name });
      if (projectId) {
        form.reset();
        setIsLoading(false);
        setIsOpen(false);
        toast("Project has been created.");
      } else {
        setIsLoading(false);
        form.reset();
      }
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? (error.data as string) : "";
      toast.error(errorMessage);
      setIsLoading(false);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        {!user_info?.isPro && user_info?.projectCount! >= MAX_PROJECTS ? (
          <div>
            <p className="mb-4">
              Free tier only allows 2 projects. Upgrade to create more!
            </p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="px-2 py-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your project display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} className="ml-2 mt-1" type="submit">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

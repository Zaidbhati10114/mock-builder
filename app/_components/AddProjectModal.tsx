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
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
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

  // react-hook-form
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  // local state for debounced name
  const [debouncedName, setDebouncedName] = useState("");
  const typingTimeout = useRef<number | null>(null);
  //const shouldCheck = debouncedName && debouncedName.length >= 2;

  // call checkNameAvailability query with debouncedName
  const checkResult = useQuery(
    // Use debouncedName in args only when it exists; when empty the query will return quickly
    api.projects.checkNameAvailability,
    { projectName: debouncedName }
  );

  // Watch the form name field to debounce
  const nameValue = form.watch("name");

  useEffect(() => {
    if (typingTimeout.current) {
      window.clearTimeout(typingTimeout.current);
    }

    // reset debounced value if name is empty
    if (!nameValue || !nameValue.trim()) {
      setDebouncedName("");
      // clear manual errors if any
      form.clearErrors("name");
      return;
    }

    // debounce 400ms
    typingTimeout.current = window.setTimeout(() => {
      setDebouncedName(nameValue.trim());
    }, 400);

    return () => {
      if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    };
  }, [nameValue, form]);

  // When checkResult updates, show/hide validation error
  useEffect(() => {
    if (!debouncedName) return;

    if (!checkResult) return;

    // checkResult can be undefined while loading; handle that
    // if query returns an object: { available, reason, suggestion }
    if (checkResult.available === false) {
      // set validation error on the name field
      form.setError("name", {
        type: "manual",
        message:
          checkResult?.reason === "not_authenticated"
            ? "Sign in to check name"
            : checkResult?.reason === "user_not_found"
              ? "User not found"
              : "Project name already exists",
      });
    } else if (checkResult.available === true) {
      // clear any manual errors
      form.clearErrors("name");
    }
  }, [checkResult, debouncedName, form]);

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
      // If server says "Project name already exists", map to form error
      if (errorMessage === "Project name already exists") {
        form.setError("name", { type: "server", message: errorMessage });
      } else {
        toast.error(errorMessage || "Unable to create project");
      }
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all duration-200">
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
                      <Input
                        placeholder="Project Name"
                        {...field}
                        aria-invalid={!!form.formState.errors.name}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your project display name.
                    </FormDescription>
                    <FormMessage />
                    {/* Optional inline hint from checkResult suggestion */}
                    {debouncedName &&
                    checkResult &&
                    checkResult.available &&
                    checkResult.suggestion ? (
                      <div className="text-sm text-green-600 mt-1">
                        Available — suggestion:{" "}
                        <code>{checkResult.suggestion}</code>
                      </div>
                    ) : null}
                    {debouncedName &&
                    checkResult &&
                    checkResult.available === false &&
                    checkResult.suggestion ? (
                      <div className="text-sm text-yellow-700 mt-1">
                        Name taken. Try{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => {
                            // set suggested name into the form
                            form.setValue(
                              "name",
                              checkResult.suggestion || field.value
                            );
                          }}
                        >
                          {checkResult.suggestion}
                        </button>
                      </div>
                    ) : null}
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

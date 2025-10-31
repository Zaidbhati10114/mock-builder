"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw } from "lucide-react";
import { Loader } from "./Loader";
import { toast as sonnerToast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import Headsup from "./Headups";
import { Id } from "@/convex/_generated/dataModel";

interface FormProps {
  id: string;
}

const schema = z.object({
  prompt: z.string().nonempty({ message: "Input Data is required" }),
  resourceName: z.string().optional(),
  objectsCount: z
    .number()
    .min(1, { message: "Objects count must be at least 1" })
    .default(5),
});

type FormData = z.infer<typeof schema>;

const EASY_SELECTIONS = [
  { websiteTitle: "List top 10 European countries" },
  { websiteTitle: "Top 5 programming languages in 2024" },
  { websiteTitle: "List 8 popular smartphone brands" },
  { websiteTitle: "Top 7 streaming platforms" },
  { websiteTitle: "5 most popular social media networks" },
] as const;

const LOADING_MESSAGES = [
  { time: 0, message: "Queuing your request..." },
  { time: 2000, message: "AI is processing..." },
  { time: 5000, message: "Generating data..." },
  { time: 10000, message: "Almost there..." },
  { time: 15000, message: "Finalizing results..." },
];

export default function JsonGeneratorForm({ id }: FormProps) {
  const user = useUser();
  const { MAX_RESOURCES, user: userDetails } = useIsSubscribed();
  const router = useRouter();
  const { toast } = useToast();

  const [jsonData, setJsonData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating...");
  const [currentJobId, setCurrentJobId] = useState<Id<"jsonJobs"> | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);

  // Convex hooks
  const createResource = useMutation(api.resources.createResource);
  const createJob = useMutation(api.jsonJobs.createJob);
  const generateJsonAction = useAction(api.jsonActions.generateJsonData);

  // Subscribe to job updates (real-time!)
  const job = useQuery(
    api.jsonJobs.getJob,
    currentJobId ? { jobId: currentJobId } : "skip"
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prompt: "",
      resourceName: "",
      objectsCount: 10,
    },
  });

  const resourceName = watch("resourceName");

  // Handle job status changes (real-time updates!)
  useEffect(() => {
    if (!job) return;

    switch (job.status) {
      case "queued":
        setLoadingMessage("Request queued, starting soon...");
        break;
      case "processing":
        setLoadingMessage("AI is generating your data...");
        break;
      case "completed":
        if (job.result) {
          setJsonData(job.result);
          setIsEditable(true);
          setIsGenerating(false);
          stopProgressiveLoading();
          sonnerToast.success(
            `Generated ${job.result.length} items successfully!`
          );
        }
        break;
      case "failed":
        setIsGenerating(false);
        stopProgressiveLoading();
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: job.error || "An error occurred",
        });
        // Offer to use fallback
        setUseFallback(true);
        break;
    }
  }, [job]);

  const startProgressiveLoading = useCallback(() => {
    messageIndexRef.current = 0;
    setLoadingMessage(LOADING_MESSAGES[0].message);

    const updateMessage = () => {
      messageIndexRef.current += 1;
      if (messageIndexRef.current < LOADING_MESSAGES.length) {
        const nextMessage = LOADING_MESSAGES[messageIndexRef.current];
        setLoadingMessage(nextMessage.message);

        const currentTime =
          LOADING_MESSAGES[messageIndexRef.current - 1]?.time || 0;
        const nextTime = nextMessage.time;
        const delay = nextTime - currentTime;

        loadingTimerRef.current = setTimeout(updateMessage, delay);
      }
    };

    loadingTimerRef.current = setTimeout(
      updateMessage,
      LOADING_MESSAGES[1].time
    );
  }, []);

  const stopProgressiveLoading = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    messageIndexRef.current = 0;
  }, []);

  const validateJsonStructure = (data: any) => {
    if (!Array.isArray(data)) {
      return false;
    }
    return data.every((item: any) => item.id && item.title && item.description);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value);
      if (validateJsonStructure(parsed)) {
        setJsonData(parsed);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid structure",
          description: "Each item must have id, title, and description",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
      });
    }
  };

  const validateAndSaveData = async () => {
    const name = resourceName?.trim();

    if (!name) {
      toast({
        variant: "destructive",
        title: "Resource Name Required",
        description: "Please enter a resource name to save",
      });
      return;
    }

    if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Generate data first before saving",
      });
      return;
    }

    if (userDetails?.resourceCount! >= MAX_RESOURCES) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: `You've reached the maximum of ${MAX_RESOURCES} resources`,
      });
      return;
    }

    setIsSaving(true);
    try {
      await createResource({
        projectId: id,
        resourceName: resourceName,
        data: jsonData,
      });
      router.push(`/dashboard/projects/${id}/resources`);
      sonnerToast.success("Data saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to save data";
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Main generation function using Convex Actions
  const generateWithConvex = async (data: FormData) => {
    try {
      // Create job
      const jobId = await createJob({
        projectId: id,
        prompt: data.prompt,
        objectsCount: data.objectsCount,
      });

      setCurrentJobId(jobId);

      // Trigger background action
      generateJsonAction({
        jobId,
        prompt: data.prompt,
        objectsCount: data.objectsCount,
        userId: userDetails!._id,
      }).catch((error) => {
        console.error("Action error:", error);
      });
    } catch (error: any) {
      throw error;
    }
  };

  // Fallback to API route
  const generateWithFallback = async (data: FormData) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: data.prompt,
          objectsCount: data.objectsCount,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.error || "Server error");
      }

      if (result.status === "success" && result.data) {
        setJsonData(result.data);
        setIsEditable(true);
        sonnerToast.success("JSON generated successfully (fallback mode)");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error: any) {
      throw error;
    }
  };

  const onSubmit: SubmitHandler<FormData> = useCallback(
    async (data) => {
      setJsonData(null);
      setIsGenerating(true);
      setIsEditable(false);
      setUseFallback(false);
      startProgressiveLoading();

      try {
        if (useFallback) {
          await generateWithFallback(data);
        } else {
          await generateWithConvex(data);
        }
      } catch (error: any) {
        console.error("Generation error:", error);
        setIsGenerating(false);
        stopProgressiveLoading();

        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: error.message || "Failed to generate JSON",
        });
      }
    },
    [useFallback, startProgressiveLoading, stopProgressiveLoading]
  );

  const handleClick = (title: string) => {
    setValue("prompt", title);
  };

  const resetForm = () => {
    stopProgressiveLoading();
    reset();
    setJsonData(null);
    setIsEditable(false);
    setCurrentJobId(null);
    setUseFallback(false);
  };

  const copyToClipboard = () => {
    if (jsonData) {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      sonnerToast.success("JSON copied to clipboard");
    }
  };

  useEffect(() => {
    return () => {
      stopProgressiveLoading();
    };
  }, [stopProgressiveLoading]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Input Data
              </Label>
              <Input
                id="prompt"
                {...register("prompt")}
                placeholder="Enter what kind of JSON data you need"
                disabled={isGenerating || isSaving}
              />
              {errors.prompt && (
                <p className="text-red-600 text-xs">{errors.prompt?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceName" className="text-sm font-medium">
                Resource Name
              </Label>
              <Input
                id="resourceName"
                {...register("resourceName")}
                placeholder="Enter resource name"
                disabled={isGenerating || isSaving}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {EASY_SELECTIONS.map((item) => (
                <Button
                  key={item.websiteTitle}
                  className="text-xs"
                  size="sm"
                  onClick={() => handleClick(item.websiteTitle)}
                  variant="outline"
                  disabled={isGenerating || isSaving}
                  type="button"
                >
                  {item.websiteTitle}
                </Button>
              ))}
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isGenerating || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating && (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isGenerating ? "Generating..." : "Generate"}
            </Button>

            <Button
              onClick={validateAndSaveData}
              disabled={
                isGenerating ||
                isSaving ||
                !jsonData ||
                !validateJsonStructure(jsonData)
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>

            <Button
              variant="outline"
              onClick={resetForm}
              type="button"
              disabled={isGenerating || isSaving}
            >
              Reset
            </Button>
          </div>

          <Headsup />

          {/* Job Status Indicator */}
          {job && (
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
              <p className="font-medium">Status: {job.status}</p>
              {job.processingTime && (
                <p className="text-xs mt-1">
                  Processed in {(job.processingTime / 1000).toFixed(2)}s
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - JSON Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="jsonOutput" className="text-sm font-medium">
              Generated JSON
            </Label>
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                {Array.isArray(jsonData) ? jsonData.length : 0} items
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="h-7"
                title="Copy JSON"
                disabled={!jsonData || isGenerating || isSaving}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              ref={textareaRef}
              className="font-mono h-[500px] resize-none overflow-y-auto"
              id="jsonOutput"
              value={jsonData ? JSON.stringify(jsonData, null, 2) : ""}
              onChange={handleJsonChange}
              readOnly={!isEditable}
              placeholder={
                isGenerating
                  ? loadingMessage
                  : "Generated JSON will appear here..."
              }
            />
            {(isGenerating || isSaving) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                <div className="flex flex-col items-center space-y-3">
                  <Loader />
                  {isGenerating && (
                    <p className="text-sm text-gray-600 text-center px-4 animate-pulse">
                      {loadingMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

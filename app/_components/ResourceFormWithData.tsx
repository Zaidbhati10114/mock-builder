"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Bird, Copy, Loader2, Rabbit, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { optionsData } from "@/utils/optionsData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { ConvexError } from "convex/values";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { useIsSubscribed } from "@/lib/useUserLimitstore";

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  resources: z.string().min(1, "Resources is required"),
  resourceName: z.string().min(1, "Resource name is required"),
  objectsCount: z
    .number()
    .min(1, { message: "Objects count must be at least 1" })
    .default(5),
});

interface FormProps {
  id: string;
}

type GeneratedData = Record<string, any>;

interface FormValues {
  model: string;
  resources: string;
  resourceName: string;
  objectsCount: number;
}

const LOADING_MESSAGES = [
  { time: 0, message: "Queuing your request..." },
  { time: 2000, message: "AI is processing..." },
  { time: 5000, message: "Generating structured data..." },
  { time: 10000, message: "Almost there..." },
  { time: 15000, message: "Finalizing results..." },
];

export default function JSONGenerator({ id }: FormProps) {
  const user = useUser();
  const router = useRouter();
  const { user: userDetails } = useIsSubscribed();

  // Convex hooks
  const createResource = useMutation(api.resources.createResource);
  const createAdvancedJob = useMutation(api.advancedJsonJobs.createAdvancedJob);
  const generateAdvancedAction = useAction(
    api.multiModelActions.generateAdvancedJsonWithFallback
  );

  // State management
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Generating...");
  const [currentJobId, setCurrentJobId] = useState<Id<"jsonJobs"> | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Progressive loading refs
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);

  // Subscribe to job updates (real-time!)
  const job = useQuery(
    api.advancedJsonJobs.getAdvancedJob,
    currentJobId ? { jobId: currentJobId } : "skip"
  );

  const {
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      resources: "",
      resourceName: "",
      objectsCount: 0,
    },
  });

  // Handle job status changes (real-time updates!)
  useEffect(() => {
    if (!job) return;

    switch (job.status) {
      case "queued":
        setLoadingMessage("Request queued, starting soon...");
        break;
      case "processing":
        setLoadingMessage(
          `AI (${job.model || "Gemini"}) is generating your data...`
        );
        break;
      case "completed":
        if (job.result) {
          setGeneratedData(job.result);
          setIsLoading(false);
          stopProgressiveLoading();
          toast.success(
            `Generated ${job.result.length} ${job.resources || "items"} successfully!`
          );
        }
        break;
      case "failed":
        setIsLoading(false);
        stopProgressiveLoading();
        setError(job.error || "An error occurred");
        toast.error(job.error || "Generation failed");
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

  const handleSave = async () => {
    if (!generatedData.length) {
      toast.error("No data to save. Please generate data first");
      return;
    }

    setIsSaving(true);
    try {
      const resourceName = getValues("resourceName");
      await createResource({
        projectId: id,
        resourceName,
        data: generatedData,
      });

      router.push(`/dashboard/projects/${id}/resources`);
      toast.success("Resource saved successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to save resource";
      toast.error(errorMessage);
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedData.length) {
      toast.error("No data to copy");
      return;
    }

    setIsCopying(true);
    try {
      const textToCopy = JSON.stringify(generatedData, null, 2);
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Data copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy data. Please try again.");
    } finally {
      setIsCopying(false);
    }
  };

  // Generate with Convex Actions
  const generateWithConvex = async (data: FormValues) => {
    try {
      const selectedFields = optionsData[data.resources].fields;
      const fieldsList = selectedFields
        .map((field) => `${field.label}: ${field.type}`)
        .join(", ");

      const prompt = `Generate ${data.objectsCount} JSON Objects fake data for these ${fieldsList}. Return only JSON objects in a list where every object must contain an id number`;

      // Create job
      const jobId = await createAdvancedJob({
        projectId: id,
        model: data.model,
        resources: data.resources,
        resourceName: data.resourceName,
        objectsCount: data.objectsCount,
        prompt: prompt,
        fields: selectedFields,
      });

      setCurrentJobId(jobId);

      // Trigger background action
      generateAdvancedAction({
        jobId,
        prompt,
        objectsCount: data.objectsCount,
        model: data.model,
        userId: userDetails!._id,
      }).catch((error) => {
        console.error("Action error:", error);
      });
    } catch (error: any) {
      throw error;
    }
  };

  // Fallback to API route
  const generateWithFallback = async (data: FormValues) => {
    try {
      const selectedFields = optionsData[data.resources].fields;
      const fieldsList = selectedFields
        .map((field) => `${field.label}: ${field.type}`)
        .join(", ");

      const prompt = `Generate ${data.objectsCount} JSON Objects fake data for these ${fieldsList}. Return only JSON objects in a list where every object must contain an id number`;

      const response = await fetch("/api/generatewithdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputValue: prompt,
          model: data.model,
          resources: data.resources,
          objectsCount: data.objectsCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate data");
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setGeneratedData(result.message);
      toast.success("JSON data generated successfully (fallback mode)");
    } catch (error: any) {
      throw error;
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setGeneratedData([]);
    setUseFallback(false);
    startProgressiveLoading();

    try {
      if (useFallback) {
        await generateWithFallback(data);
        setIsLoading(false);
        stopProgressiveLoading();
      } else {
        await generateWithConvex(data);
        // Don't set isLoading false here - wait for job completion
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate data";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      stopProgressiveLoading();
    }
  };

  const handleReset = () => {
    stopProgressiveLoading();
    reset({
      model: "",
      resources: "",
      resourceName: "",
      objectsCount: 0,
    });
    setGeneratedData([]);
    setSelectedOption(null);
    setError(null);
    setCurrentJobId(null);
    setUseFallback(false);
  };

  const handleRetry = () => {
    setError(null);
    setUseFallback(true); // Use fallback on retry
    onSubmit(getValues());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressiveLoading();
    };
  }, [stopProgressiveLoading]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Section */}
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>JSON Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading || isSaving}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genesis">
                            <div className="flex items-center gap-2">
                              <Rabbit className="h-4 w-4" />
                              <span>GPT-4</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="explorer">
                            <div className="flex items-center gap-2">
                              <Bird className="h-4 w-4" />
                              <span>Gemini AI</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.model && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.model.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="resources">Resource Type</Label>
                  <Controller
                    name="resources"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedOption(value);
                        }}
                        value={field.value}
                        disabled={isLoading || isSaving}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(optionsData).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.resources && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.resources.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="resourceName">Resource Name</Label>
                  <Controller
                    name="resourceName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter resource name"
                        className="w-full"
                        disabled={isLoading || isSaving}
                      />
                    )}
                  />
                  {errors.resourceName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.resourceName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="objectsCount">Number of Objects</Label>
                  <Controller
                    name="objectsCount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        placeholder="Enter number of objects"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                        className="w-full"
                        disabled={isLoading || isSaving}
                      />
                    )}
                  />
                  {errors.objectsCount && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.objectsCount.message}
                    </p>
                  )}
                </div>
              </div>

              {selectedOption && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Selected Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-4 space-y-1">
                      {optionsData[selectedOption].fields.map(
                        (field, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {field.label}: {field.type}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || isSaving}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading || isSaving}
                >
                  Reset
                </Button>
                {generatedData.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSave}
                    disabled={isLoading || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Job Status Indicator */}
            {job && (
              <div className="mt-4 text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                <p className="font-medium">
                  Status: <span className="capitalize">{job.status}</span>
                </p>
                {job.model && (
                  <p className="text-xs mt-1">Model: {job.model}</p>
                )}
                {job.processingTime && (
                  <p className="text-xs mt-1">
                    Processed in {(job.processingTime / 1000).toFixed(2)}s
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Generated JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[500px] max-h-[calc(100vh-300px)] overflow-auto rounded-md bg-muted/50 p-4">
              {isLoading ? (
                <div className="flex h-full items-center justify-center flex-col space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-gray-600 text-center animate-pulse">
                    {loadingMessage}
                  </p>
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <Button onClick={handleRetry} variant="outline">
                    Retry with Fallback API
                  </Button>
                </div>
              ) : (
                <>
                  {generatedData.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-4 top-4"
                      onClick={handleCopy}
                      disabled={isCopying}
                    >
                      {isCopying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                  <div className="space-y-4">
                    {generatedData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <p>Generated JSON data will appear here...</p>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words text-sm">
                        {JSON.stringify(generatedData, null, 2)}
                      </pre>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

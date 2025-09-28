"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Row } from "@/components/ui/row";
import { Copy, RefreshCw, Terminal } from "lucide-react";
import { Loader } from "./Loader";
import { toast as sonnerToast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Headsup from "./Headups";
import { generateStructuredData } from "../actions/gemini";

interface FormProps {
  id: string;
}

const schema = z.object({
  prompt: z.string().nonempty({ message: "Input Data is required" }),
  resourceName: z.string().optional(), // keep optional
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

// Progressive loading messages
const LOADING_MESSAGES = [
  { time: 0, message: "Generating..." },
  { time: 4000, message: "Please wait, it's loading..." },
  { time: 8000, message: "AI model is busy, processing your request..." },
  { time: 12000, message: "Complex request detected, still working..." },
  { time: 16000, message: "Almost there, finalizing the data..." },
  { time: 20000, message: "Thank you for your patience, processing..." },
  { time: 25000, message: "High server load detected, please wait..." },
  { time: 30000, message: "Request is taking longer than expected..." },
];

export default function JsonGeneratorForm({ id }: FormProps) {
  const user = useUser();
  const { MAX_RESOURCES, user: userDetails } = useIsSubscribed();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);

  const createResource = useMutation(api.resources.createResource);
  const reduceJsonCount = useMutation(api.resources.reduceJsonGenerationCount);

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

  // Function to start progressive loading messages
  const startProgressiveLoading = useCallback(() => {
    messageIndexRef.current = 0;
    setLoadingMessage(LOADING_MESSAGES[0].message);

    const updateMessage = () => {
      messageIndexRef.current += 1;
      if (messageIndexRef.current < LOADING_MESSAGES.length) {
        const nextMessage = LOADING_MESSAGES[messageIndexRef.current];
        setLoadingMessage(nextMessage.message);

        // Calculate time until next message
        const currentTime =
          LOADING_MESSAGES[messageIndexRef.current - 1]?.time || 0;
        const nextTime = nextMessage.time;
        const delay = nextTime - currentTime;

        loadingTimerRef.current = setTimeout(updateMessage, delay);
      }
    };

    // Start the first timer (4 seconds for the second message)
    loadingTimerRef.current = setTimeout(
      updateMessage,
      LOADING_MESSAGES[1].time
    );
  }, []);

  // Function to stop progressive loading messages
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
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Invalid JSON format.",
      });
    }
  };

  const validateAndSaveData = async () => {
    const name = resourceName?.trim();

    if (!name) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Resource Name is required to save the data",
      });
      return;
    }

    if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "No Data to save",
      });
      return;
    }

    if (userDetails?.resourceCount! >= MAX_RESOURCES) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "You have reached the maximum number of resources",
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
      sonnerToast.success("Data saved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to save data";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Updated onSubmit function with better error handling
  const onSubmit: SubmitHandler<FormData> = useCallback(
    async (data) => {
      if (data.objectsCount > 1) {
        setJsonData(null);
      }
      setIsGenerating(true);
      setIsEditable(false);
      startProgressiveLoading();

      try {
        console.log("Submitting form with data:", data);

        // Call the server action
        const result = await generateStructuredData({
          prompt: data.prompt,
          objectsCount: data.objectsCount,
        });

        console.log("Server action result:", result);

        // Check if result exists and has the expected structure
        if (!result) {
          throw new Error("No response received from server");
        }

        if (result.status === "error") {
          throw new Error(result.error || "Server returned an error");
        }

        if (result.status === "success" && result.data) {
          setJsonData(result.data);
          setIsEditable(true);
          sonnerToast.success(
            result.error || "JSON data generated successfully"
          );

          // Reduce the user's JSON count
          if (user?.user?.id) {
            try {
              await reduceJsonCount({ clerkId: user.user.id });
            } catch (countError) {
              console.warn("Failed to reduce JSON count:", countError);
              // Don't fail the entire operation for this
            }
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (error: any) {
        console.error("Form submission error:", error);

        let errorMessage = "Failed to generate JSON";

        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: errorMessage,
        });

        setJsonData(null);
      } finally {
        setIsGenerating(false);
        stopProgressiveLoading();
      }
    },
    [
      reduceJsonCount,
      toast,
      user?.user?.id,
      startProgressiveLoading,
      stopProgressiveLoading,
    ]
  );

  const handleClick = (title: string) => {
    setValue("prompt", title);
  };

  const resetForm = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopProgressiveLoading();
    reset();
    setJsonData(null);
    setIsEditable(false);
  };

  const copyToClipboard = () => {
    if (jsonData) {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      sonnerToast.success("JSON copied to clipboard");
    }
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopProgressiveLoading();
    };
  }, [stopProgressiveLoading]);

  return (
    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-6">
      <div className="w-full md:w-1/2 p-3 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="prompt">Input Data</Label>
            <Input
              id="prompt"
              {...register("prompt")}
              placeholder="Enter what kind of JSON data you need"
              className="mt-1 block w-full"
              disabled={isGenerating || isSaving}
            />
            {errors.prompt && (
              <p className="text-red-600 text-sm">{errors.prompt?.message}</p>
            )}

            <Label htmlFor="resourceName">Resource Name</Label>
            <Input
              id="resourceName"
              {...register("resourceName")}
              placeholder="Enter resource name"
              className="mt-1 block w-full"
              disabled={isGenerating || isSaving}
            />
            {/* {errors.resourceName && (
              <p className="text-red-600 text-sm">
                {errors.resourceName.message}
              </p>
            )} */}

            <Row className="flex-wrap gap-2 justify-start items-center my-2 w-full">
              {EASY_SELECTIONS.map((item) => (
                <Button
                  key={item.websiteTitle}
                  className="whitespace-nowrap"
                  size="sm"
                  onClick={() => handleClick(item.websiteTitle)}
                  variant="outline"
                  disabled={isGenerating || isSaving}
                >
                  {item.websiteTitle}
                </Button>
              ))}
            </Row>
          </div>
        </form>

        {/* Save button moved outside the form */}
        <div className="flex space-x-2 mt-6">
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="secondary"
            disabled={isGenerating || isSaving}
          >
            {isGenerating && (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isGenerating ? "Generating..." : "Generate"}
          </Button>

          <Button
            variant="secondary"
            onClick={validateAndSaveData}
            disabled={
              isGenerating ||
              isSaving ||
              !jsonData ||
              !validateJsonStructure(jsonData)
            }
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button
            variant="secondary"
            onClick={resetForm}
            type="button"
            disabled={isGenerating || isSaving}
          >
            Reset
          </Button>
        </div>
        <div className="space-y-2 mt-4">
          <Headsup />
        </div>
      </div>

      <div className="w-full md:w-1/2 relative">
        <Label htmlFor="jsonOutput">Generated JSON</Label>
        <div className="relative mt-2">
          <Textarea
            ref={textareaRef}
            className="font-mono h-[70vh] resize-none overflow-y-auto scrollbar-hide"
            id="jsonOutput"
            value={jsonData ? JSON.stringify(jsonData, null, 2) : ""}
            onChange={handleJsonChange}
            readOnly={!isEditable}
            placeholder={
              isGenerating
                ? loadingMessage
                : jsonData
                  ? "Generated JSON will appear here"
                  : "No data generated yet"
            }
          />
          {(isGenerating || isSaving) && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-75">
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

        <div className="absolute top-0 right-0 flex items-center space-x-2 mb-2 mr-1">
          <div className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded">
            {Array.isArray(jsonData) ? jsonData.length : 0} items
          </div>
          <Button
            onClick={copyToClipboard}
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            title="Copy JSON"
            disabled={!jsonData || isGenerating || isSaving}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

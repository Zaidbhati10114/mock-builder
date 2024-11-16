"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Row } from "@/components/ui/row";
import { Copy, RefreshCw } from "lucide-react";
import { Loader } from "./Loader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface FormProps {
  id: string;
}

const schema = z.object({
  inputData: z.string().nonempty({ message: "Input Data is required" }),
  resourceName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EASY_SELECTIONS = [
  { websiteTitle: "List top 10 European countries" },
  { websiteTitle: "Top 5 programming languages in 2024" },
  { websiteTitle: "List 8 popular smartphone brands" },
  { websiteTitle: "Top 7 streaming platforms" },
  { websiteTitle: "5 most popular social media networks" },
] as const;

export default function JsonGeneratorForm({ id }: FormProps) {
  const user = useUser();
  const { MAX_RESOURCES, user: userDetails } = useIsSubscribed();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      inputData: "",
      resourceName: "",
    },
  });

  const resourceName = watch("resourceName");

  const generateJson = async (prompt: string): Promise<any> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/testopen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      // Validate that we received an array
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected an array");
      }

      // Validate that each item has an id
      if (data.some((item) => !item.id)) {
        throw new Error("Invalid data structure: missing id in some items");
      }

      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request cancelled");
      }
      throw error;
    }
  };

  const validateJsonStructure = (data: any) => {
    if (!Array.isArray(data) || data.length !== 10) {
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
        toast.error("Invalid JSON structure");
      }
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const validateAndSaveData = async () => {
    if (!resourceName) {
      toast.error("Resource Name is required to save the data");
      return;
    }

    if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
      toast.error("No data to save");
      return;
    }

    if (userDetails?.resourceCount! >= MAX_RESOURCES) {
      toast.error("You have reached the maximum number of resources");
      return;
    }

    setLoading(true);
    try {
      await createResource({
        projectId: id,
        resourceName: resourceName,
        data: jsonData,
      });
      router.push(`/dashboard/projects/${id}/resources`);
      toast.success("Data saved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? (error.data as string)
          : "Failed to save data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setIsEditable(false);

    try {
      const result = await generateJson(data.inputData);
      setJsonData(result);
      setIsEditable(true);
      toast.success("JSON data generated successfully");
      await reduceJsonCount({ clerkId: user?.user?.id! });
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate JSON");
      setJsonData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (title: string) => {
    setValue("inputData", title);
  };

  const resetForm = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    reset();
    setJsonData(null);
    setIsEditable(false);
  };

  const copyToClipboard = () => {
    if (jsonData) {
      navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      toast.success("JSON copied to clipboard");
    }
  };

  // useEffect(() => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "auto";
  //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  //   }
  // }, [jsonData]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-6">
      <div className="w-full md:w-1/2 p-3 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="inputData">Input Data</Label>
            <Input
              id="inputData"
              {...register("inputData")}
              placeholder="Enter what kind of JSON data you need"
              className="mt-1 block w-full"
              disabled={loading}
            />
            {errors.inputData && (
              <p className="text-red-600 text-sm">
                {errors.inputData?.message}
              </p>
            )}

            <Label htmlFor="resourceName">Resource Name</Label>
            <Input
              id="resourceName"
              {...register("resourceName")}
              placeholder="Enter resource name"
              className="mt-1 block w-full"
              disabled={loading}
            />

            <Row className="flex-wrap gap-2 justify-start items-center my-2 w-full">
              {EASY_SELECTIONS.map((item) => (
                <Button
                  key={item.websiteTitle}
                  className="whitespace-nowrap"
                  size="sm"
                  onClick={() => handleClick(item.websiteTitle)}
                  variant="outline"
                  disabled={loading}
                >
                  {item.websiteTitle}
                </Button>
              ))}
            </Row>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Generating..." : "Generate"}
            </Button>
            <Button
              variant="secondary"
              onClick={validateAndSaveData}
              disabled={
                loading || !jsonData || !validateJsonStructure(jsonData)
              }
            >
              Save
            </Button>

            <Button variant="secondary" onClick={resetForm} disabled={loading}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="w-full md:w-1/2 relative">
        <Label htmlFor="jsonOutput">Generated JSON</Label>
        <div className="relative mt-2">
          <Textarea
            ref={textareaRef}
            className="font-mono h-[70vh] resize-none overflow-y-auto"
            id="jsonOutput"
            value={jsonData ? JSON.stringify(jsonData, null, 2) : ""}
            onChange={handleJsonChange}
            readOnly={!isEditable}
            placeholder={
              loading
                ? "Generating..."
                : jsonData
                  ? "Generated JSON will appear here"
                  : "No data generated yet"
            }
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-75">
              <Loader />
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
            disabled={!jsonData}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

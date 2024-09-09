// components/JsonGeneratorForm.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Copy } from "lucide-react";
import { Loader } from "./Loader";
import { Row } from "@/components/ui/row";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useIsSubscribed } from "@/lib/useUserLimitstore";
import { ConvexError } from "convex/values";

interface FormProps {
  id: string;
}

const schema = z.object({
  inputData: z.string().nonempty({ message: "Input Data is required" }),
  resourceName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function JsonGeneratorForm({ id }: FormProps) {
  const user = useUser();
  const { MAX_RESOURCES, user: userDetails } = useIsSubscribed();
  const router = useRouter();
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

  const easySelections = [
    {
      websiteTitle: "10 Object-oriented programming languages",
    },
    {
      websiteTitle: "Top 5 science fiction books read in 2020",
    },
    {
      websiteTitle: "Get the top 10 countries in Europe",
    },
    {
      websiteTitle:
        "5 Musical genres that are popular in the US with their corresponding artists",
    },
    {
      websiteTitle: "List of Rick and Morty characters",
    },
  ];

  const [jsonData, setJsonData] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const [isEditable, setIsEditable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createResource = useMutation(api.resources.createResource);
  const reduceJsonCount = useMutation(api.resources.reduceJsonGenerationCount);

  //const inputData = watch("inputData");
  const resourceName = watch("resourceName");

  const validateAndSaveData = async () => {
    if (!resourceName) {
      toast.error("Resource Name is required to save the data");
      return;
    }

    if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
      toast.error("No data to save");
      return;
    }

    setLoading(true);
    try {
      if (userDetails?.resourceCount! >= MAX_RESOURCES) {
        toast.error("You have reached the maximum number of resources");
        return;
      }
      await createResource({
        projectId: id,
        resourceName: resourceName,
        data: jsonData,
      });
      router.push(`/dashboard/projects/${id}/resources`);
      toast.success("Data saved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? (error.data as string) : "";
      toast.error(errorMessage);
      console.error("Failed to save data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const prompt = `Can you please generate JSON data for the following prompt: ${data.inputData} 
    every object must contain an id number, strictly return only the JSON objects in a list nothing else should be returned`;
    setLoading(true);
    setIsEditable(false);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputValue: prompt }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.message || typeof result.message !== "object") {
        throw new Error("Unexpected response format");
      }

      setJsonData(result.message);
      setIsEditable(true);
      toast.success("JSON data generated successfully");
    } catch (error: any) {
      console.error("Error in onSubmit:", error);
      toast.error(`Failed to generate JSON data: ${error.message}`);
      setJsonData(null);
    } finally {
      setLoading(false);
      await reduceJsonCount({ clerkId: user?.user?.id! });
    }
  };
  const handleClick = (title: string) => {
    setValue("inputData", title);
  };

  const resetForm = () => {
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [jsonData]);

  return (
    <>
      <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-6">
        <div className="w-full md:w-1/2 p-3 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Label
                htmlFor="inputData"
                className="block text-sm font-medium text-gray-700"
              >
                Input Data
              </Label>
              <Input
                id="inputData"
                {...register("inputData")}
                placeholder="Enter data to generate JSON"
                className="mt-1 block w-full"
              />
              {errors.inputData && (
                <p className="text-red-600">{errors.inputData?.message}</p>
              )}
              <Label
                htmlFor="resourceName"
                className="block text-sm font-medium text-gray-700"
              >
                Resource Name
              </Label>
              <Input
                id="resourceName"
                {...register("resourceName")}
                placeholder="Enter resource Name"
                className="mt-1 block w-full"
              />
              {errors.resourceName && (
                <p className="text-red-600">{errors.resourceName?.message}</p>
              )}
              <Row className="flex-wrap gap-2 justify-start items-center my-2 w-full">
                {easySelections.map((item) => (
                  <Button
                    key={item.websiteTitle}
                    className="whitespace-nowrap"
                    size={"sm"}
                    onClick={() => handleClick(item.websiteTitle)}
                    variant={"outline"}
                  >
                    {item.websiteTitle}
                  </Button>
                ))}
              </Row>
            </div>
            <Button type="submit" variant={"secondary"} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              onClick={validateAndSaveData}
              className="ml-2"
              disabled={loading}
            >
              Save
            </Button>
            <Button
              variant={"secondary"}
              type="button"
              onClick={resetForm}
              className="ml-2"
              disabled={loading}
            >
              Reset
            </Button>
          </form>
        </div>
        <div className="w-full md:w-1/2 relative">
          <Label
            htmlFor="jsonOutput"
            className="block text-sm font-medium text-gray-700"
          >
            Generated JSON
          </Label>
          <div className="relative">
            <Textarea
              id="jsonOutput"
              value={JSON.stringify(jsonData, null, 2)}
              onChange={(e: any) => setJsonData(JSON.parse(e.target.value))}
              className="mt-5 block w-full font-mono h-[calc(100vh-300px)] resize-none overflow-y-auto"
              readOnly={!isEditable}
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
    </>
  );
}

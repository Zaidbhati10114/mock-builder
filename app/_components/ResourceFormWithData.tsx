"use client";
import React, { useState } from "react";
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
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { optionsData } from "@/utils/optionsData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { ConvexError } from "convex/values";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  resources: z.string().min(1, "Resources is required"),
  resourceName: z.string().min(1, "Resource name is required"),
  objectsCount: z.number().min(1, "Objects count must be at least 1"),
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

export default function JSONGenerator({ id }: FormProps) {
  const user = useUser();
  const router = useRouter();
  const createResource = useMutation(api.resources.createResource);
  const reduceJsonCount = useMutation(api.resources.reduceJsonGenerationCount);

  // State management
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      toast.success(
        "Resource saved successfully. Please wait for the data to be indexed"
      );
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
      const textToCopy = generatedData
        .map((data) => JSON.stringify(data, null, 2))
        .join("\n\n");

      await navigator.clipboard.writeText(textToCopy);
      toast.success("Data copied to clipboard!");
    } catch (err) {
      fallbackCopyTextToClipboard(textToCopy);
    } finally {
      setIsCopying(false);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    Object.assign(textArea.style, {
      position: "fixed",
      top: "0",
      left: "0",
      opacity: "0",
    });

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy")
        ? toast.success("Data copied to clipboard!")
        : toast.error("Failed to copy data. Please try again.");
    } catch (err) {
      console.error("Fallback copy failed:", err);
      toast.error("Failed to copy data. Please try again.");
    }

    document.body.removeChild(textArea);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedFields = optionsData[data.resources].fields;
      const fieldsList = selectedFields
        .map((field) => `${field.label}: ${field.type}`)
        .join(", ");

      const prompt = `Generate ${data.objectsCount} JSON Objects fake data for these ${fieldsList}. Return only JSON objects in a list where every object must contain an id number`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputValue: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate data");
      }

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setGeneratedData(result.message);
      await reduceJsonCount({ clerkId: user?.user?.id! });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset({
      model: "",
      resources: "",
      resourceName: "",
      objectsCount: 0,
    });
    setGeneratedData([]);
    setSelectedOption(null);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    onSubmit(getValues());
  };

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
                <Button type="submit" disabled={isLoading}>
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
                  disabled={isLoading}
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
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <Button onClick={handleRetry} variant="outline">
                    Retry Generation
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
                    {generatedData.map((data, index) => (
                      <pre
                        key={index}
                        className="whitespace-pre-wrap break-words text-sm"
                      >
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    ))}
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

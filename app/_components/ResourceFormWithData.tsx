"use client";
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
import { useRef, useState } from "react";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { optionsData } from "@/utils/optionsData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/clerk-react";
import { ConvexError } from "convex/values";

const formSchema = z.object({
  model: z.string().min(1, "Model is required"),
  resources: z.string().min(1, "Resources is required"),
  resourceName: z.string().min(1, "Resource name is required"),
  objectsCount: z.number().min(1, "Objects count must be at least 1"),
});

interface FormProps {
  id: string;
}

export default function Component({ id }: FormProps) {
  const user = useUser();
  const router = useRouter();
  const createResource = useMutation(api.resources.createResource);
  const reduceJsonCount = useMutation(api.resources.reduceJsonGenerationCount);
  const [generatedData, setGeneratedData] = useState<GeneratedData[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {
    control,
    reset,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "",
      resources: "",
      resourceName: "",
      objectsCount: 0,
    },
  });

  const handleSave = async () => {
    if (generatedData.length === 0) {
      toast.error("No data to save please generate data first");
      return;
    }
    setIsSaving(true);
    try {
      const resourceName = getValues("resourceName");
      const projectId = id;
      const data = generatedData;

      await createResource({
        projectId,
        resourceName,
        data,
      });
      router.push(`/dashboard/projects/${id}/resources`);
      toast.success(
        "Resource saved successfully please wait for the data to be indexed"
      );
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? (error.data as string) : "";
      toast.error(errorMessage);
      console.error("Failed to save resource:", error);
    } finally {
      setIsSaving(false);
    }
  };

  type GeneratedData = Record<string, any>;
  const generatedDataRef = useRef<HTMLDivElement>(null);

  interface FormValues {
    model: string;
    resources: string;
    resourceName: string;
    objectsCount: number;
  }

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleCopy = () => {
    if (generatedData.length === 0) {
      toast.error("No data to copy");
      return;
    }

    setIsCopying(true);
    try {
      const textToCopy = generatedData
        .map((data) => JSON.stringify(data, null, 2))
        .join("\n\n");

      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(textToCopy);
      } else {
        navigator.clipboard.writeText(textToCopy).then(
          function () {
            toast.success("Data copied to clipboard!");
          },
          function (err) {
            console.error("Could not copy text: ", err);
            toast.error("Could not copy text: ", err);
          }
        );
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy text: ");
    } finally {
      setIsCopying(false);
    }
  };

  function fallbackCopyTextToClipboard(text: string) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      if (successful) {
        toast.success("Data copied to clipboard!");
      } else {
        toast.error("Failed to copy data. Please try again.");
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
      toast.error("Failed to copy data. Please try again.");
    }

    document.body.removeChild(textArea);
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const { resources, objectsCount } = data;
    const selectedFields = optionsData[resources].fields;
    const fieldsList = selectedFields
      .map((field) => `${field.label}: ${field.type}`)
      .join(", ");
    const prompt = `Can you please generate ${objectsCount} JSON Objects fake data for these ${fieldsList}  please return the JSON objects in a list every object must contain a id number`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputValue: prompt }),
      });

      const result = await response.json();
      const generatedJsonString = result.message
        .replace(/```json\n|```/g, "")
        .trim();

      const jsonObjects: GeneratedData[] = generatedJsonString
        .split("\n\n")
        .map((json: string) => JSON.parse(json));

      const sortedData = jsonObjects.sort((a, b) => a.id - b.id);
      setGeneratedData(sortedData);
    } catch (error) {
      console.error("Failed to parse JSON or API call failed:", error);
    } finally {
      setIsLoading(false);
      await reduceJsonCount({ clerkId: user?.user?.id! });
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
  };

  return (
    <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-6">
      <div className="w-full md:w-1/2 p-3 py-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full items-start gap-6"
        >
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              JSON Generator
            </legend>
            <div className="grid gap-3">
              <Label htmlFor="model">Model</Label>
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id="model"
                      className="items-start [&_[data-description]]:hidden"
                    >
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="genesis">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Rabbit className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Chat{" "}
                              <span className="font-medium text-foreground">
                                GPT-4
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Our fastest model for general use cases.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="explorer">
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <Bird className="size-5" />
                          <div className="grid gap-0.5">
                            <p>
                              Gemini{" "}
                              <span className="font-medium text-foreground">
                                AI
                              </span>
                            </p>
                            <p className="text-xs" data-description>
                              Performance and speed for efficiency.
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.model && (
                <p className="text-red-500">{errors.model.message}</p>
              )}
              <div className="grid gap-3">
                <Label htmlFor="resources">Resources</Label>
                <Controller
                  name="resources"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleOptionSelect(value);
                      }}
                    >
                      <SelectTrigger
                        id="resources"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select resources" />
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
                  <p className="text-red-500">{errors.resources.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="resource-name">Resource Name</Label>
              <Controller
                name="resourceName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="resource-name"
                    placeholder="Resource Name"
                    {...field}
                  />
                )}
              />
              {errors.resourceName && (
                <p className="text-red-500">{errors.resourceName.message}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="objects-count">Objects Count</Label>
              <Controller
                name="objectsCount"
                control={control}
                render={({ field }) => (
                  <Input
                    id="objects-count"
                    placeholder="Objects Count"
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10))
                    }
                  />
                )}
              />
              {errors.objectsCount && (
                <p className="text-red-500">{errors.objectsCount.message}</p>
              )}
            </div>
          </fieldset>
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">
              Resources Available
            </legend>
            <div className="grid gap-3">
              {!selectedOption && (
                <div className="flex items-center justify-center space-y-1">
                  <h1 className="p-5">
                    Select a resource to see available fields
                  </h1>
                </div>
              )}
              {selectedOption && (
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Selected Fields
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {optionsData[selectedOption].fields.map((field, index) => (
                      <li
                        key={index}
                        className="mt-1 text-sm leading-6 text-gray-600"
                      >
                        {field.label}: {field.type}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <Button disabled={isLoading} type="submit">
              Submit
            </Button>
            <Button
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>
            {generatedData.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isLoading || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="w-full md:w-1/2 relative">
        <Label
          htmlFor="jsonOutput"
          className="block text-sm mb-1 font-medium text-gray-700"
        >
          Generated JSON
        </Label>
        <div className="relative bg-muted/50 rounded-xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-[calc(100vh-300px)]">
              <Loader2 className="h-9 w-9 animate-spin" />
            </div>
          ) : (
            <div className="h-[calc(100vh-300px)] bg-muted/50 rounded-xl overflow-y-auto">
              <Button
                variant="outline"
                className="absolute top-0 right-0 mr-2 mb-2 mt-2"
                onClick={handleCopy}
                disabled={isLoading || isCopying || generatedData.length === 0}
              >
                <Copy className="h-4 w-4" />
                {isCopying ? "Copying..." : null}
              </Button>
              <ul className="list-disc ml-5 mt-2">
                {generatedData.map((data, index) => (
                  <li key={index} className="mt-1 text-sm leading-6">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

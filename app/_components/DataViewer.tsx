import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Database, ScanEye, Share } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/themes/monikai.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Id } from "@/convex/_generated/dataModel";
import { Hint } from "./Hint";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface DataViewProps {
  data: any;
  name: string;
  live?: boolean;
  id: Id<"resources">;
}

export function DataViewer({ data, name, live, id }: DataViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("typescript");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("JSON copied to clipboard");
  };

  const fetchCodeSnippet = `
// ${language === "typescript" ? "TypeScript" : "JavaScript"}
// Make your api live from resources card then you can fetch the data
${language === "typescript" ? "async function fetchData(): Promise<any> {" : "async function fetchData() {"}
  const response = await fetch('YOUR_API_URL');
  ${language === "typescript" ? "const data: any = await response.json();" : "const data = await response.json();"}
  return data;
}

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
`;

  const itemCount = Array.isArray(data) ? data.length : 0;

  const copyCodeSnippet = () => {
    navigator.clipboard.writeText(fetchCodeSnippet);
    toast.success("Code snippet copied to clipboard");
  };

  const handleCopyLink = () => {
    // Replace this with the actual link generation logic
    const link = `https://proficient-opossum-116.convex.site/get-resource?resourceID=${id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="xs" variant="secondary">
          <ScanEye className="w-4 h-4 mr-1" />
          View data
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl w-full h-[80vh] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <Badge
          variant="outline"
          className="absolute top-4 right-10 py-1 bg-green-500"
        >
          {live ? "Live" : "Not live"}
        </Badge>
        <Tabs
          defaultValue="data"
          className="flex-grow flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <TabsList className="h-9">
              <TabsTrigger value="data" className="px-3 py-1">
                <Database className="h-4 w-5 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="share" className="px-3 py-1">
                <Share className="h-4 w-5 mr-1" />
                Share
              </TabsTrigger>
              <Hint
                label={live ? "Live" : "Not live"}
                side="top"
                align="center"
              >
                <TabsTrigger
                  disabled={!live}
                  value="Live"
                  className="px-3 py-1"
                >
                  Live
                </TabsTrigger>
              </Hint>
            </TabsList>
            {/* <div className="flex items-center space-x-2">
              
              <button>Test</button>
            </div> */}
          </div>
          <TabsContent value="data" className="mt-4 flex-grow overflow-y-auto">
            <div className="h-full rounded-md bg-black p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-end space-x-2 mb-2">
                <div className="bg-gray-700 text-gray-200 text-xs font-medium px-2 py-1 rounded">
                  {itemCount} items
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 bg-gray-700 hover:bg-gray-600"
                  title="Copy JSON"
                >
                  <Copy className="h-4 w-4 text-gray-200" />
                </Button>
              </div>
              <div className="flex-grow overflow-auto">
                <code>
                  <JSONPretty
                    id="json-pretty"
                    data={data}
                    theme={{
                      main: "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                      error:
                        "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                      key: "color:#f92672;",
                      string: "color:#fd971f;",
                      value: "color:#a6e22e;",
                      boolean: "color:#ac81fe;",
                    }}
                  />
                </code>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="share" className="mt-4 flex-grow overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <Select onValueChange={setLanguage} defaultValue={language}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={copyCodeSnippet}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="Copy Code Snippet"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-grow rounded-md bg-black p-4 overflow-hidden">
                {/* <pre className="h-full text-sm text-muted-foreground overflow-auto">
                  <code className="whitespace-pre text-md">
                    <JSONPretty
                      id="json-pretty"
                      data={fetchCodeSnippet}
                      theme={{
                        main: "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                        error:
                          "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                        key: "color:#f92672;",
                        string: "color:#fd971f;",
                        value: "color:#a6e22e;",
                        boolean: "color:#ac81fe;",
                      }}
                    />
                  </code>
                </pre> */}
                <SyntaxHighlighter
                  language="javascript"
                  style={atomDark}
                  customStyle={{
                    borderRadius: "0px",
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                  }}
                >
                  {fetchCodeSnippet}
                </SyntaxHighlighter>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="Live" className="mt-4 flex-grow overflow-y-auto">
            {live && (
              <Card className="">
                <CardHeader>
                  <CardTitle>Fetch this document</CardTitle>
                  <CardDescription>
                    Anyone with the fetch or make a get request till its status
                    is live can have access this document.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Input
                      defaultValue={`https://proficient-opossum-116.convex.site/get-resource?resourceID=${id}`}
                      readOnly
                    />
                    <Button
                      variant="secondary"
                      onClick={handleCopyLink}
                      className="shrink-0"
                    >
                      Copy Link
                    </Button>
                  </div>
                  <Separator className="my-4" />
                </CardContent>
              </Card>
            )}
            {!live && (
              <Card>
                <CardTitle className="text-sm text-muted-foreground">
                  Live
                </CardTitle>
                <CardDescription>
                  <div className="space-y-4">
                    <p>This resource is not live yet</p>
                  </div>
                </CardDescription>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

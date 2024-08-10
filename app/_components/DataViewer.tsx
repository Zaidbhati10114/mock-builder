import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Database, Share } from "lucide-react";
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

interface DataViewProps {
  data: any;
  name: string;
  live?: boolean;
}

export function DataViewer({ data, name, live }: DataViewProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="xs" variant="secondary">
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
                <pre className="h-full text-sm text-muted-foreground overflow-auto">
                  <code className="whitespace-pre">{fetchCodeSnippet}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function renderJSON(obj: any, level = 0) {
  const indent = "  ".repeat(level);

  if (Array.isArray(obj)) {
    return (
      <>
        {"[\n"}
        {obj.map((item, index) => (
          <React.Fragment key={index}>
            {indent} {renderJSON(item, level + 1)}
            {index < obj.length - 1 ? "," : ""}
            {"\n"}
          </React.Fragment>
        ))}
        {indent}
        {"]"}
      </>
    );
  } else if (typeof obj === "object" && obj !== null) {
    return (
      <>
        {"{\n"}
        {Object.entries(obj).map(([key, value], index, array) => (
          <React.Fragment key={key}>
            {indent} <span className="text-black">{JSON.stringify(key)}</span>:{" "}
            <span className="text-green-500">
              {renderJSON(value, level + 1)}
            </span>
            {index < array.length - 1 ? "," : ""}
            {"\n"}
          </React.Fragment>
        ))}
        {indent}
        {"}"}
      </>
    );
  } else {
    return <span className="text-green-500">{JSON.stringify(obj)}</span>;
  }
}

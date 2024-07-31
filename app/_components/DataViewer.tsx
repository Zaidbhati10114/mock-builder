import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataViewProps {
  data: any;
  name: string;
}

export function DataViewer({ data, name }: DataViewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("typescript");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success("JSON copied to clipboard");
  };

  const itemCount = Array.isArray(data) ? data.length : 0;

  const fetchCodeSnippet = `
// ${language === "typescript" ? "TypeScript" : "JavaScript"}
${language === "typescript" ? "async function fetchData(): Promise<any> {" : "async function fetchData() {"}
  const response = await fetch('${window.location.href}');
  ${language === "typescript" ? "const data: any = await response.json();" : "const data = await response.json();"}
  return data;
}

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
`;

  const copyCodeSnippet = () => {
    navigator.clipboard.writeText(fetchCodeSnippet);
    toast.success("Code snippet copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          View data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[80vh] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <Tabs
          defaultValue="data"
          className="flex-grow flex flex-col overflow-y-auto"
        >
          <div className="flex items-center justify-between">
            <TabsList className="h-9">
              <TabsTrigger value="data" className="px-3 py-1">
                Data
              </TabsTrigger>
              <TabsTrigger value="share" className="px-3 py-1">
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
                <pre className="text-sm text-muted-foreground">
                  <code className="whitespace-pre">
                    {JSON.stringify(data, null, 2)}
                  </code>
                </pre>
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

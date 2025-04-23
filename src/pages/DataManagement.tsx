
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ApiKeySettings } from "@/components/ApiKeySettings";
import { uploadDocumentToPinecone } from "@/services/pinecone";
import { toast } from "sonner";

const DataManagement = () => {
  const [vectorPercentage, setVectorPercentage] = useState(75);
  const [webPercentage, setWebPercentage] = useState(25);
  const [resultLength, setResultLength] = useState(200);
  const [summarizeThreshold, setSummarizeThreshold] = useState(500);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [knowledgeSources, setKnowledgeSources] = useState<string[]>([]);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedVectorPercentage = localStorage.getItem("vectorPercentage");
    const storedResultLength = localStorage.getItem("resultLength");
    const storedSummarizeThreshold = localStorage.getItem("summarizeThreshold");
    const storedKnowledgeSources = localStorage.getItem("knowledgeSources");
    
    if (storedVectorPercentage) {
      const percentage = parseInt(storedVectorPercentage);
      setVectorPercentage(percentage);
      setWebPercentage(100 - percentage);
    }
    
    if (storedResultLength) {
      setResultLength(parseInt(storedResultLength));
    }
    
    if (storedSummarizeThreshold) {
      setSummarizeThreshold(parseInt(storedSummarizeThreshold));
    }
    
    if (storedKnowledgeSources) {
      try {
        setKnowledgeSources(JSON.parse(storedKnowledgeSources));
      } catch (e) {
        console.error("Error parsing knowledge sources:", e);
      }
    }
  }, []);

  const handleVectorPercentageChange = (value: number[]) => {
    const newValue = value[0];
    setVectorPercentage(newValue);
    setWebPercentage(100 - newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      await uploadDocumentToPinecone(selectedFile);
      
      // Add to knowledge sources
      const newSources = [...knowledgeSources, selectedFile.name];
      setKnowledgeSources(newSources);
      
      // Save to localStorage
      localStorage.setItem("knowledgeSources", JSON.stringify(newSources));
      
      toast.success(`Successfully uploaded ${selectedFile.name} to Pinecone vector database`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please check your API keys and try again.");
    } finally {
      setUploading(false);
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    }
  };
  
  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("vectorPercentage", vectorPercentage.toString());
    localStorage.setItem("resultLength", resultLength.toString());
    localStorage.setItem("summarizeThreshold", summarizeThreshold.toString());
    
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Knowledge Management</h1>
          <Link to="/">
            <Button className="flex items-center gap-2">
              <span>Go to Chat</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="settings">Search Settings</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload to Vector Database</CardTitle>
                <CardDescription>
                  Upload files to your Pinecone vector database to enhance your knowledge clone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-primary/70 transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer block text-gray-600"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-gray-700">Click to upload or drag and drop</span>
                      <span className="text-sm text-gray-500">PDF, DOC, DOCX, TXT (Max 10MB)</span>
                    </div>
                  </label>
                  {selectedFile && (
                    <div className="mt-4 text-sm text-gray-700">
                      Selected file: <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>Upload to Vector Database</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Knowledge Sources</CardTitle>
                <CardDescription>
                  Manage your existing knowledge sources in the vector database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {knowledgeSources.length > 0 ? (
                  <div className="space-y-3">
                    {knowledgeSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span>{source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-lg border-gray-200">
                    <p className="text-gray-500">You don't have any knowledge sources yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Upload files to see them here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Configuration</CardTitle>
                <CardDescription>
                  Configure how your knowledge clone searches for information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Vector Database: {vectorPercentage}%</Label>
                    <Label>Web Search: {webPercentage}%</Label>
                  </div>
                  <Slider
                    value={[vectorPercentage]}
                    onValueChange={handleVectorPercentageChange}
                    max={100}
                    step={5}
                  />
                  <div className="text-xs text-gray-500">
                    Adjust the percentage of results from your vector database versus web search.
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Default Result Length</Label>
                  <ToggleGroup type="single" value={resultLength.toString()} onValueChange={(value) => setResultLength(Number(value))}>
                    <ToggleGroupItem value="100">100 words</ToggleGroupItem>
                    <ToggleGroupItem value="200">200 words</ToggleGroupItem>
                    <ToggleGroupItem value="300">300 words</ToggleGroupItem>
                    <ToggleGroupItem value="500">500 words</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-3">
                  <Label>Summarization Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={summarizeThreshold}
                      onChange={(e) => setSummarizeThreshold(Number(e.target.value))}
                      min={100}
                      className="w-24"
                    />
                    <span className="text-gray-600">words</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Responses longer than this will be summarized with a "Show more details" option.
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleSaveSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>
                  Configure your API keys for Pinecone and OpenAI integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeySettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataManagement;


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_KEYS } from "@/services/api";

interface ApiKeys {
  pinecone: string;
  openai: string;
}

export function ApiKeySettings() {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    pinecone: localStorage.getItem("pineconeApiKey") || API_KEYS.pinecone,
    openai: localStorage.getItem("openaiApiKey") || API_KEYS.openai,
  });

  const handleSaveKeys = () => {
    localStorage.setItem("pineconeApiKey", apiKeys.pinecone);
    localStorage.setItem("openaiApiKey", apiKeys.openai);
    toast.success("API keys saved successfully");
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border">
      <div className="space-y-2">
        <Label htmlFor="pinecone">Pinecone API Key</Label>
        <Input
          id="pinecone"
          type="password"
          value={apiKeys.pinecone}
          onChange={(e) => setApiKeys({ ...apiKeys, pinecone: e.target.value })}
          placeholder="Enter your Pinecone API key"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="openai">OpenAI API Key</Label>
        <Input
          id="openai"
          type="password"
          value={apiKeys.openai}
          onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
          placeholder="Enter your OpenAI API key"
        />
      </div>

      <Button onClick={handleSaveKeys} className="w-full">
        Save API Keys
      </Button>

      <p className="text-sm text-gray-500 mt-4">
        Note: API keys are hardcoded for your convenience, but you can override them here.
      </p>
    </div>
  );
}


import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { SummaryExpand } from "@/components/ui/summary-expand";
import { cn } from "@/lib/utils";
import { generateChatCompletion } from "@/services/openai";
import { searchPinecone } from "@/services/pinecone";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  fullContent?: string;
  isUser: boolean;
  timestamp: Date;
  needsSummary?: boolean;
}

const Chat = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm your knowledge clone assistant. Ask me anything based on your uploaded data.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Get settings from localStorage
      const vectorPercentage = parseInt(localStorage.getItem("vectorPercentage") || "75");
      const resultLength = parseInt(localStorage.getItem("resultLength") || "200");
      const summarizeThreshold = parseInt(localStorage.getItem("summarizeThreshold") || "500");
      
      // Calculate token estimates (rough approximation)
      const maxTokens = resultLength * 1.5;
      
      // Get context from Pinecone if vectorPercentage > 0
      let vectorResults = "";
      if (vectorPercentage > 0) {
        try {
          vectorResults = await searchPinecone(prompt);
        } catch (error) {
          console.error("Error searching Pinecone:", error);
          toast.error("Failed to search knowledge database. Check your Pinecone API key.");
        }
      }

      // Get web results if needed (mock for now)
      // In a real implementation, you would call an actual web search API
      const webResults = vectorPercentage < 100 ? "Simulated web search results would appear here." : "";
      
      // Prepare past messages for context (excluding system messages)
      const pastMessages = messages
        .filter(m => m.id !== "1") // Skip initial greeting
        .slice(-5) // Only use last 5 messages for context
        .map(m => ({
          role: m.isUser ? 'user' as const : 'assistant' as const,
          content: m.content
        }));

      // Generate response with context
      const response = await generateChatCompletion(
        [...pastMessages, { role: 'user', content: prompt }],
        { vectorResults, webResults, maxTokens }
      );

      // Check if response needs to be summarized
      const needsSummary = response.split(/\s+/).length > summarizeThreshold;
      
      let displayContent = response;
      let fullContent = undefined;
      
      if (needsSummary) {
        // Create a simple summary by taking the first part of the response
        const words = response.split(/\s+/);
        displayContent = words.slice(0, summarizeThreshold / 2).join(' ') + '...';
        fullContent = response;
      }

      // Add AI response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: displayContent,
        fullContent: fullContent,
        isUser: false,
        timestamp: new Date(),
        needsSummary: needsSummary
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error while generating a response. Please check your API keys in the Data Management section.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to generate response. Please check your API keys.");
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 py-3 border-b bg-white shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/data-management" className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-semibold">Knowledge Clone Chat</h1>
          </div>
          
          <Link to="/data-management">
            <Button variant="outline">Manage Data</Button>
          </Link>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full">
        <div className="flex justify-center mb-8">
          <UserAvatar 
            size="xl"
            fallback="U"
          />
        </div>

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.isUser
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {message.needsSummary && message.fullContent ? (
                  <SummaryExpand
                    summary={message.content}
                    fullContent={message.fullContent}
                  />
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 max-w-[80%] rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="flex items-center gap-1" 
            disabled={loading}
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

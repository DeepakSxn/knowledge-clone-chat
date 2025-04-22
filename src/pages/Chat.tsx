
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { SummaryExpand } from "@/components/ui/summary-expand";
import { cn } from "@/lib/utils";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const longResponse = "This is a simulated response. When connected to actual APIs, I'll respond based on your vector database and web search settings. The response length would be determined by your settings in the data management section. Responses longer than your specified threshold would be summarized and provide a 'Show More Details' option to see the full content. This feature helps keep the chat interface clean while still giving you access to detailed information when needed. Your vector database settings would determine how much the response relies on your uploaded knowledge versus web search results.";
      
      // Example of a response that exceeds threshold (would be summarized)
      const summary = "This is a simulated response. When connected to actual APIs, I'll respond based on your vector database and web search settings. The response length would be determined by your settings...";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: summary,
        fullContent: longResponse,
        isUser: false,
        timestamp: new Date(),
        needsSummary: true
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setPrompt("");
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
            // You can add the src prop when you have a user image
            // src="/path-to-user-image.jpg" 
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
          />
          <Button type="submit" className="flex items-center gap-1">
            <Send className="h-4 w-4" />
            <span>Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

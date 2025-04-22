
import { useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SummaryExpandProps {
  summary: string;
  fullContent: string;
  className?: string;
}

export function SummaryExpand({
  summary,
  fullContent,
  className
}: SummaryExpandProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {expanded ? (
        <div className="animate-fade-in">
          <p>{fullContent}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpanded(false)}
            className="mt-2"
          >
            Show Less
          </Button>
        </div>
      ) : (
        <div>
          <p>{summary}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpanded(true)}
            className="mt-2"
          >
            Show More Details
          </Button>
        </div>
      )}
    </div>
  );
}

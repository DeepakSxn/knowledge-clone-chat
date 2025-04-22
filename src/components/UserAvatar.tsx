
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function UserAvatar({ 
  src, 
  fallback = "U", 
  size = "md" 
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  return (
    <Avatar className={`${sizeClasses[size]} border-2 border-primary`}>
      {src && <AvatarImage src={src} alt="User avatar" />}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}

import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface SpecialBannerProps {
  message?: string;
}

export default function SpecialBanner({ message = "Free delivery on orders over $35" }: SpecialBannerProps) {
  return (
    <div className="bg-accent-light/10 p-3 border-l-4 border-accent flex items-center gap-2 m-3 rounded">
      <Tag className="text-accent" size={18} />
      <p className="text-sm font-medium text-neutral-800">{message}</p>
    </div>
  );
}

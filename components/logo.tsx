import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo(props: { className?: string, link?: string }) {
  return (
    <Link href={props.link ?? '/'} className={cn("flex items-center space-x-3", props.className)}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-sm">D</span>
        </div>
        <span className="text-xl font-light tracking-tight text-foreground">doable</span>
      </div>
    </Link>
  );
}

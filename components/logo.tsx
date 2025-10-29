import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo(props: { className?: string; link?: string }) {
  return (
    <Link
      className={cn("flex items-center space-x-3", props.className)}
      href={props.link ?? "/"}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl font-medium tracking-tight text-foreground">
          doable
        </span>
      </div>
    </Link>
  );
}

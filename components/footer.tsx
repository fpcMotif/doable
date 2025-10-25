import { buttonVariants } from "@/components/ui/button";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

export function Footer(props: {
  builtBy: string;
  builtByLink: string;
  githubLink: string;
  twitterLink: string;
  linkedinLink: string;
}) {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 py-12 md:flex-row md:py-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-left">
              Built by{" "}
              <a
                href={props.builtByLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                {props.builtBy}
              </a>
              . The source code is available on{" "}
              <a
                href={props.githubLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { href: props.twitterLink, icon: TwitterLogoIcon },
                { href: props.linkedinLink, icon: LinkedInLogoIcon },
                { href: props.githubLink, icon: GitHubLogoIcon },
              ] as const
            ).map((link, index) => (
              <Link
                href={link.href}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                key={index}
              >
                <link.icon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

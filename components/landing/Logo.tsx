import type React from "react";

type LogoProps = {
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-xl font-semibold text-foreground">doable</span>
    </div>
  );
};

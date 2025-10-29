import type React from "react";

type HorizontalLineProps = {
  className?: string;
};

export const HorizontalLine: React.FC<HorizontalLineProps> = ({
  className = "",
}) => {
  return (
    <div className={`w-full h-px bg-gray-200 dark:bg-gray-700 ${className}`} />
  );
};

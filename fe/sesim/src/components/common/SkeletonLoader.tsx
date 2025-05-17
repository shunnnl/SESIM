import React from "react";

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: "text" | "rectangular" | "rounded" | "circular";
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = "1rem",
  className = "",
  variant = "text"
}) => {
  const baseClass = "animate-pulse bg-gray-700/30";
  
  const variantClass = 
    variant === "text" ? "h-4" :
    variant === "rectangular" ? "" :
    variant === "rounded" ? "rounded-md" :
    variant === "circular" ? "rounded-full" : "";
  
  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-row px-[16px] py-[16px] bg-[#1D2433] rounded-[16px] gap-5 w-full items-center justify-between">
      <div className="flex flex-col gap-2 w-full">
        <SkeletonLoader 
          width="50%" 
          height="0.875rem" 
          className="rounded-md"
        />
        <SkeletonLoader 
          width="70%" 
          height="1.5rem" 
          className="rounded-md"
        />
      </div>
      <div className="flex flex-col gap-2 items-end">
        <SkeletonLoader 
          width="28px"
          height="28px" 
          variant="circular"
        />
        <SkeletonLoader 
          width="80px"
          height="1.5rem"
          className="rounded-md"
        />
      </div>
    </div>
  );
};

export const ComparisonIndicatorSkeleton: React.FC = () => {
  return (
    <SkeletonLoader 
      width="80px" 
      height="1.5rem" 
      className="rounded-md" 
    />
  );
};

export const ChartContainerSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex flex-row gap-3 items-center">
        <SkeletonLoader 
          width="24px"
          height="24px" 
          variant="circular"
        />
        <SkeletonLoader 
          width="30%" 
          height="1rem" 
          className="rounded-md"
        />
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <SkeletonLoader 
          width="100%" 
          height="100%" 
          className="rounded-md min-h-[200px]"
        />
      </div>
    </div>
  );
}; 
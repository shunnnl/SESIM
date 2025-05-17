import React from "react";
import { LuTrendingUp, LuTrendingDown, LuMinus, LuLoader } from "react-icons/lu";

interface CostComparisonIndicatorProps {
  currentCost: number;
  previousCost: number;
  currency?: string;
  unit?: string;
  isLoading?: boolean;
  showPercentage?: boolean;
}

export const CostComparisonIndicator: React.FC<CostComparisonIndicatorProps> = ({
  currentCost,
  previousCost,
  currency = "$",
  unit = "",
  isLoading = false,
  showPercentage = true
}) => {
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-[36px] bg-gray-500/10 text-gray-400 text-xs font-medium animate-pulse">
        <LuLoader 
          size={14} 
          className="animate-spin"
        />
        <span>로드 중...</span>
      </div>
    );
  }

  if (previousCost === undefined || previousCost === 0) return null;

  const isIncrease = currentCost > previousCost;
  const isDecrease = currentCost < previousCost;
  const difference = isIncrease ? currentCost - previousCost : previousCost - currentCost;
  const percentChange = ((currentCost - previousCost) / previousCost) * 100;
  const absPercentChange = Math.abs(percentChange);

  const bgColor = isIncrease
    ? "bg-red-500/10"
    : isDecrease
      ? "bg-green-500/10"
      : "bg-gray-500/10";

  const textColor = isIncrease
    ? "text-red-400"
    : isDecrease
      ? "text-green-400"
      : "text-gray-400";

  let text;
  if (showPercentage) {
    text = `${absPercentChange.toFixed(1)}%`;
  } else {
    text = currency
      ? `${currency} ${difference.toFixed(2)}`
      : `${difference.toFixed(0)} ${unit}`;
  }

  const Icon = isIncrease
    ? LuTrendingUp
    : isDecrease
      ? LuTrendingDown
      : LuMinus;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-[36px] ${bgColor} ${textColor} text-xs font-medium`}>
      <Icon size={14} />
      <span>{text}</span>
    </div>
  );
};
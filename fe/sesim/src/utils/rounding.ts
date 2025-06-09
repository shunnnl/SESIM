export const roundCost = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const roundSeconds = (seconds: number): number => {
  return Math.round((seconds / 3600) * 100) / 100;
};
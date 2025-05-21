export const addComma = (value: number | string): string => {
  if (value === null || value === undefined) return "0";

  const stringValue = value.toString();
  const parts = stringValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
};
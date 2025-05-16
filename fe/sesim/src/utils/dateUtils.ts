export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};


export const getThreeMonthsAgo = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);

  return date.toISOString().split('T')[0];
};


export const getCurrentDate = (): string => {

  return new Date().toISOString().split('T')[0];
};

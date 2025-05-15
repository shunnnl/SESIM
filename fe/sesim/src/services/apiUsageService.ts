import api from "./api";

export const getAPIUsage = async () => {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setMonth(startDate.getMonth() - 2);
  startDate.setDate(2);

  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];

  const response = await api.get("/deployment/api-usage/interval", {
    params: {
      startTime: formattedStartDate,
      endTime: formattedEndDate,
    },
  });

  return response.data;
};
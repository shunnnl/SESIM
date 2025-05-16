import api from "./api";
import { getCurrentDate } from "../utils/dateUtils";

export const getAPIUsageInit = async () => {
  const response = await api.get("/deployment/api-usage/init");
  console.log("API Usage Init Response:", response.data);

  return response.data;
};


// 모든 프로젝트, 모든 기간 데이터 조회 함수 
export const getAPIUsageAllProjectsAllPeriodsData = async (createdAt?: string) => {
  const startDate = createdAt;
  const endDate = getCurrentDate()

  const response = await api.get(`/deployment/api-usage/interval/all/all`, {
    params: {
      startTime: startDate,
      endTime: endDate,
    }
  });
  
  console.log("API Usage All Projects All Periods Data:", response.data);
  return response.data;
};
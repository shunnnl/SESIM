import api from "./api";
import { getCurrentDate, getMonthEndDate, getMonthStartDate } from "../utils/dateUtils";

export const getAPIUsageInit = async () => {
  const response = await api.get("/deployment/api-usage/init");
  console.log("API Usage Init Response:", response.data);

  return response.data;
};


// 모든 프로젝트, 모든 기간 데이터 조회
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


// 특정 프로젝트, 모든 기간 데이터 조회
export const getAPIUsageSpecificProjectAllPeriodsData = async (projectId: string, createdAt?: string) => {
  const startDate = createdAt;
  const endDate = getCurrentDate()

  const response = await api.get(`/deployment/api-usage/interval/specific/all`, {
    params: {
      startTime: startDate,
      endTime: endDate,
      projectId: projectId,
    }
  });

  console.log("API Usage Specific Project All Periods Data:", response.data);
  return response.data;
};


// 모든 프로젝트, 특정 월 데이터 조회
export const getAPIUsageAllProjectsMonthPeriodData = async (month: string) => {
  const startDate = getMonthStartDate(month);
  const endDate = getMonthEndDate(month);

  const response = await api.get(`/deployment/api-usage/interval/all/specific`, {
    params: {
      startTime: startDate,
      endTime: endDate,
    }
  });

  console.log("API Usage All Projects Month Period Data:", response.data);
  return response.data;
};


// 특정 프로젝트, 특정 월 데이터 조회
export const getAPIUsageSpecificProjectMonthPeriodData = async (projectId: string, month: string) => {
  const startDate = getMonthStartDate(month);
  const endDate = getMonthEndDate(month);

  const response = await api.get(`/deployment/api-usage/interval/specific/specific`, {
    params: {
      startTime: startDate,
      endTime: endDate,
      projectId: projectId,
    }
  });

  console.log("API Usage Specific Project Month Period Data:", response.data);
  return response.data;
};
import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useAppDispatch } from "../store/hooks";
import { CostChangeInfo } from "../types/APIUsageTypes";
import { APIUsageProjectInfo } from "../types/ProjectTypes";
import {
  fetchAPIUsageInitData,
  fetchAllProjectsAllPeriods,
  fetchAllProjectsMonthPeriod,
  fetchSpecificProjectAllPeriods,
  fetchSpecificProjectMonthPeriod,
} from "../store/APIUsageSlice";

function calculateChangeInfo(current: number, previous: number): CostChangeInfo {
  const percentage = ((current - previous) / previous) * 100;
  const status = percentage > 0 ? "UP" : percentage < 0 ? "DOWN" : "EQUAL";
  return { percentage, status };
}

export const useAPIUsageData = () => {
  const dispatch = useAppDispatch();
  const initDataLoaded = useRef(false);

  const apiUsageState = useSelector((state: RootState) => state.apiUsage);
  
  const createdAt = apiUsageState.apiUsageInitData?.createdAt || "2023-01-01";
  const currentMonthCost = apiUsageState.apiUsageInitData?.totalCost || 0;
  const currentMonthRequests = apiUsageState.apiUsageInitData?.totalRequests || 0;
  const currentMonthSeconds = apiUsageState.apiUsageInitData?.totalSeconds || 0;
  const previousMonthCost = apiUsageState.apiUsageInitData?.lastTotalCost || 0;
  const previousMonthRequests = apiUsageState.apiUsageInitData?.lastTotalRequests || 0;
  const previousMonthSeconds = apiUsageState.apiUsageInitData?.lastTotalSeconds || 0;
  const projectInfo = apiUsageState.apiUsageInitData?.projects || null;

  const isInitDataLoading = apiUsageState.isInitDataLoading;
  const isAllProjectsAllPeriodsLoading = apiUsageState.isAllProjectsAllPeriodsLoading;
  const isSpecificProjectAllPeriodsLoading = apiUsageState.isSpecificProjectAllPeriodsLoading;
  const isAllProjectsMonthPeriodLoading = apiUsageState.isAllProjectsMonthPeriodLoading;
  const isSpecificProjectMonthPeriodLoading = apiUsageState.isSpecificProjectMonthPeriodLoading;

  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const [selectedProjectName, setSelectedProjectName] = useState<string>("모든 프로젝트");
  const [selectedMonthName, setSelectedMonthName] = useState<string>("전체 기간");
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([
    { value: "all", label: "전체 기간" }
  ]);

  const costChangeInfo = calculateChangeInfo(currentMonthCost, previousMonthCost);
  const requestChangeInfo = calculateChangeInfo(currentMonthRequests, previousMonthRequests);
  const secondsChangeInfo = calculateChangeInfo(currentMonthSeconds, previousMonthSeconds);

  const handleSelectProject = (value: string) => {
    setSelectedProject(value);
    const project = projectInfo?.find((p: APIUsageProjectInfo) => p.projectId.toString() === value);
    setSelectedProjectName(project ? project.name : "모든 프로젝트");
    loadDataBySelection();
  };


  const handleSelectMonth = (value: string) => {
    setSelectedMonth(value);
    const found = monthOptions.find((m) => m.value === value);
    setSelectedMonthName(found ? found.label : "전체 기간");
    loadDataBySelection();
  };


  const generateMonthOptions = useCallback((userCreatedAt: string) => {
    const options: { value: string; label: string }[] = [];
    const iterateDate = new Date(userCreatedAt);
    iterateDate.setDate(1);
    const currentDate = new Date();

    while (iterateDate <= currentDate) {
      const year = iterateDate.getFullYear();
      const month = (iterateDate.getMonth() + 1).toString().padStart(2, "0");
      options.push({ value: `${year}-${month}`, label: `${year}년 ${month}월` });
      iterateDate.setMonth(iterateDate.getMonth() + 1);
    }

    return [{ value: "all", label: "전체 기간" }, ...options.reverse()];
  }, []);


  const loadDataBySelection = useCallback(() => {
    if (!createdAt) {
      return;
    }

    if (selectedProject === "all" && selectedMonth === "all") {
      dispatch(fetchAllProjectsAllPeriods({ createdAt: createdAt }));
    } else if (selectedProject !== "all" && selectedMonth === "all") {
      dispatch(fetchSpecificProjectAllPeriods({ projectId: selectedProject, createdAt: createdAt }));
    } else if (selectedProject === "all" && selectedMonth !== "all") {
      dispatch(fetchAllProjectsMonthPeriod({ month: selectedMonth }));
    } else {
      dispatch(fetchSpecificProjectMonthPeriod({ projectId: selectedProject, month: selectedMonth }));
    }
  }, [createdAt, selectedProject, selectedMonth, dispatch]);


  useEffect(() => {
    if (!initDataLoaded.current && !apiUsageState.apiUsageInitData) {
      dispatch(fetchAPIUsageInitData());
      initDataLoaded.current = true;
    }
  }, [dispatch, apiUsageState.apiUsageInitData]);


  useEffect(() => {
    if (createdAt && !isInitDataLoading && apiUsageState.apiUsageInitData) {
      setMonthOptions(generateMonthOptions(createdAt));
    }
  }, [createdAt, generateMonthOptions, isInitDataLoading, apiUsageState.apiUsageInitData]);


  useEffect(() => {
    loadDataBySelection();
  }, [loadDataBySelection, isInitDataLoading, apiUsageState.apiUsageInitData]);


  return {
    isInitLoading: isInitDataLoading,
    isLoading:
      isAllProjectsAllPeriodsLoading ||
      isSpecificProjectAllPeriodsLoading ||
      isAllProjectsMonthPeriodLoading ||
      isSpecificProjectMonthPeriodLoading,
    currentMonthCost,
    currentMonthRequests,
    currentMonthSeconds,
    costChangeInfo,
    requestChangeInfo,
    secondsChangeInfo,
    projectInfo,
    selectedProject,
    selectedProjectName,
    selectedMonth,
    selectedMonthName,
    monthOptions,
    handleSelectProject,
    handleSelectMonth,
  };
};

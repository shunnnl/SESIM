import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { CostChangeInfo } from "../types/APIUsageTypes";
import { setAPIUsageData, setAPIUsageInitData, setDataLoaded } from "../store/APIUsageSlice";
import {
  getAPIUsageInit,
  getAPIUsageAllProjectsAllPeriodsData,
} from "../services/apiUsageService";

export const useAPIUsageData = () => {
  const dispatch = useDispatch();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    projects,
    createdAt,
    currentMonthCost,
    currentMonthRequests,
    currentMonthSeconds,
    previousMonthCost,
    previousMonthRequests,
    previousMonthSeconds,
    projectInfo,
    modelInfo,
  } = useSelector((state: RootState) => state.apiUsage);

  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("모든 프로젝트");

  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedMonthName, setSelectedMonthName] = useState<string>("전체 기간");

  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([{ value: "all", label: "전체 기간" }]);

  const costChangeInfo = calculateChangeInfo(currentMonthCost, previousMonthCost);
  const requestChangeInfo = calculateChangeInfo(currentMonthRequests, previousMonthRequests);
  const secondsChangeInfo = calculateChangeInfo(currentMonthSeconds, previousMonthSeconds);

  // 월 옵션 생성 함수
  const generateMonthOptions = (
    userCreatedAt: string
  ): { value: string; label: string }[] => {
    const createdDate = new Date(userCreatedAt);
    const currentDate = new Date();
    const options: { value: string; label: string }[] = [];

    // 생성 날짜의 첫 달부터 시작
    const iterateDate = new Date(createdDate);
    iterateDate.setDate(1); // 월의 첫째 날로 설정

    // 생성 날짜부터 현재 날짜까지 월별 옵션 생성
    while (iterateDate <= currentDate) {
      const year = iterateDate.getFullYear();
      const month = iterateDate.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
      const monthStr = month.toString().padStart(2, "0"); // 01, 02, ... 형식으로

      options.push({
        value: `${year}-${monthStr}`,
        label: `${year}년 ${month}월`,
      });

      // 다음 달로 이동
      iterateDate.setMonth(iterateDate.getMonth() + 1);
    }

    // 내림차순 정렬 (최신 달이 먼저 오도록)
    options.sort((a, b) => b.value.localeCompare(a.value));

    // "전체 기간" 옵션 추가
    return [{ value: "all", label: "전체 기간" }, ...options];
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    setIsInitLoading(true);
    try {
      const initData = await getAPIUsageInit();
      if (initData.success) {
        dispatch(setAPIUsageInitData(initData.data));

        if (initData.data.createdAt) {
          // 전체 프로젝트, 전체 기간 데이터 로드
          const allProjectsData = await getAPIUsageAllProjectsAllPeriodsData(initData.data.createdAt);

          if (allProjectsData.success) {
            dispatch(setAPIUsageData(allProjectsData.data));
          } else {
            setError(allProjectsData.error || "데이터를 불러오는데 실패했습니다.");
          }
        }
      } else {
        setError(initData.error || "초기 데이터를 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("서버 연결에 실패했습니다.");
      console.error(err);
    } finally {
      setIsInitLoading(false);
    }
  };

  const loadDataBySelection = async () => {
    dispatch(setDataLoaded(false));
    try {
      if (selectedProject === "all" && selectedMonth === "all") {
        const data = await getAPIUsageAllProjectsAllPeriodsData(createdAt || "2025-01-01");

        if (data.success) {
          dispatch(setAPIUsageData(data.data));
        } else {
          setError(data.error || "데이터를 불러오는데 실패했습니다.");
        }
      } else if (selectedProject !== "all" && selectedMonth === "all") {
        // 특정 프로젝트, 전체 기간
      } else if (selectedProject === "all" && selectedMonth !== "all") {
        // 전체 프로젝트, 특정 월
      } else {
        // 특정 프로젝트, 특정 월
      }
    } catch (err) {
      console.error("데이터 로드 중 오류 발생:", err);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      dispatch(setDataLoaded(true));
    }
  };

  function calculateChangeInfo(
    current: number,
    previous: number
  ): CostChangeInfo {
    const percentage = ((current - previous) / previous) * 100;
    const status = percentage > 0 ? "UP" : percentage < 0 ? "DOWN" : "EQUAL";
    return { percentage, status };
  }

  // 프로젝트 선택 핸들러
  const handleSelectProject = (value: string) => {
    setSelectedProject(value);

    if (value === "all") {
      setSelectedProjectName("모든 프로젝트");
    } else {
      const selectedProj = projectInfo?.find(
        (p) => p.projectId.toString() === value
      );
      if (selectedProj) {
        setSelectedProjectName(selectedProj.name);
      }
    }

    loadDataBySelection();
  };

  // 월 선택 핸들러
  const handleSelectMonth = (value: string) => {
    setSelectedMonth(value);

    if (value === "all") {
      setSelectedMonthName("전체 기간");
    } else {
      const selectedMonthName = monthOptions.find((m) => m.value === value);
      if (selectedMonthName) {
        setSelectedMonthName(selectedMonthName.label);
      }
    }

    loadDataBySelection();
  };

  // createdAt부터 현재까지의 월 옵션 생성
  useEffect(() => {
    if (createdAt) {
      const options = generateMonthOptions(createdAt);
      setMonthOptions(options);
    }
  }, [createdAt]);

  useEffect(() => {
    loadInitialData();
  }, []);

  return {
    isInitLoading,
    error,
    projects,
    createdAt,
    currentMonthCost,
    currentMonthRequests,
    currentMonthSeconds,
    costChangeInfo,
    requestChangeInfo,
    secondsChangeInfo,
    projectInfo,
    modelInfo,
    selectedProject,
    selectedProjectName,
    selectedMonth,
    selectedMonthName,
    monthOptions,
    handleSelectProject,
    handleSelectMonth,
  };
};

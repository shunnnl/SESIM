export interface IntervalDayProject {
  date: string;
  projectIntervalRequestCount: string;
  projectIntervalSeconds: number;
  projectIntervalCost: number;
}

export interface IntervalMonthProject {
  date: string;
  projectIntervalRequestCount: number;
  projectIntervalSeconds: number;
  projectIntervalCost: number;
}

export interface IntervalDayModels {
  date: string;
  intervalRequestCount: number;
  intervalSeconds: number;
  intervalCost: number;
}

export interface IntervalMonthModels {
  date: string;
  intervalRequestCount: number;
  intervalSeconds: number;
  intervalCost: number;
}

export interface APIUsageModel {
  modelId: number;
  modelName: string;
  totalRequestCount: number;
  totalSeconds: number;
  hourlyRate: number;
  totalCost: number;
  intervalDayModels: IntervalDayModels[];
  intervalMonthModels: IntervalMonthModels[];
}

export interface APIUsageProject {
  projectId: number;
  projectName: string;
  projectTotalRequestCount: number;
  projectTotalSeconds: number;
  projectTotalCost: number;
  intervalDayProjects: IntervalDayProject[];
  intervalMonthProjects: IntervalMonthProject[];
  models: APIUsageModel[];
}

export type CostChangeStatus = "UP" | "DOWN" | "EQUAL";

export interface CostChangeInfo {
  percentage: number;
  status: CostChangeStatus;
};

export interface ProjectCost {
  projectId: number;
  cost: number;
};

export interface ProjectRequest {
  projectId: number;
  requestCount: number;
};

export interface ProjectSecond {
  projectId: number;
  second: number;
};

export interface ModelCost {
  modelId: number;
  cost: number;
};

export interface ModelRequest {
  modelId: number;
  requestCount: number;
};

export interface ModelSecond {
  modelId: number;
  second: number;
};

export interface MonthProjectCost {
  month: string;
  projectCosts: ProjectCost[];
};

export interface MonthProjectRequest {
  month: string;
  projectRequests: ProjectRequest[];
};

export interface MonthProjectSecond {
  month: string;
  projectSeconds: ProjectSecond[];
};

export interface DailyProjectCost {
  date: string;
  totalCost: number;
  projectCosts: ProjectCost[];
};

export interface MonthModelCost {
  month: string;
  modelCosts: ModelCost[];
};

export interface MonthModelRequest {
  month: string;
  modelRequests: ModelRequest[];
};

export interface MonthModelSecond {
  month: string;
  modelSeconds: ModelSecond[];
};

export interface DailyModelCost {
  date: string;
  totalCost: number;
  modelCosts: ModelCost[];
};

export interface DailyModelRequest {
  date: string;
  totalRequests: number;
  modelRequests: ModelRequest[];
};

export interface DailyModelSecond {
  date: string;
  totalSeconds: number;
  modelSeconds: ModelSecond[];
};

export interface DailyProjectRequest {
  date: string;
  totalRequests: number;
  projectRequests: ProjectRequest[];
};

export interface DailyProjectSecond {
  date: string;
  totalSeconds: number;
  projectSeconds: ProjectSecond[];
};

export interface AllProjectsAllPeriodsData {
  totalCost: number;
  totalRequests: number;
  totalSeconds: number;
  totalProjectCount: number;
  projectCosts: ProjectCost[];
  monthProjectCosts: MonthProjectCost[];
  monthProjectRequests: MonthProjectRequest[];
  monthProjectSeconds: MonthProjectSecond[];
  dailyProjectCosts: DailyProjectCost[];
};

export interface SpecificProjectAllPeriodsData {
  totalCost: number;
  totalRequests: number;
  totalSeconds: number;
  totalModelCount: number;
  monthModelCosts: MonthModelCost[];
  monthModelRequests: MonthModelRequest[];
  monthModelSeconds: MonthModelSecond[];
  dailyModelCosts: DailyModelCost[];
};

export interface AllProjectsMonthPeriodData {
  curMonthTotalCost: number;
  lastMonthTotalCost: number;
  curMonthTotalRequests: number;
  lastMonthTotalRequests: number;
  curMonthTotalSeconds: number;
  lastMonthTotalSeconds: number;
  projectRequestCounts: ProjectRequest[];
  projectSeconds: ProjectSecond[];
  projectCosts: ProjectCost[];
  dailyProjectCosts: DailyProjectCost[];
  dailyProjectRequests: DailyProjectRequest[];
  dailyProjectSeconds: DailyProjectSecond[];
};

export interface SpecificProjectMonthPeriodData {
  curMonthTotalCost: number;
  lastMonthTotalCost: number;
  curMonthTotalRequests: number;
  lastMonthTotalRequests: number;
  curMonthTotalSeconds: number;
  lastMonthTotalSeconds: number;
  modelRequestCounts: ModelRequest[];
  modelCosts: ModelCost[];
  modelSeconds: ModelSecond[];
  dailyModelCosts: DailyModelCost[];
  dailyModelRequests: DailyModelRequest[];
  dailyModelSeconds: DailyModelSecond[];
};
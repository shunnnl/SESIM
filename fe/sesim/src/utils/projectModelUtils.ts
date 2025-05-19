import { useSelector } from "react-redux";
import { RootState } from "../store";
import { APIUsageProjectInfo, APIUsageModelInfo } from "../types/ProjectTypes";


export const useProjectNames = (): Record<number, string> => {
  const projectInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.projects);
  const projectNames: Record<number, string> = {};

  if (projectInfo) {
    projectInfo.forEach((project: APIUsageProjectInfo) => {
      projectNames[project.projectId] = project.name;
    });
  }

  return projectNames;
};


export const useModelNames = (): Record<number, string> => {
  const modelInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.models);
  const modelNames: Record<number, string> = {};

  if (modelInfo) {
    modelInfo.forEach((model: APIUsageModelInfo) => {
      modelNames[model.modelId] = model.name;
    });
  }

  return modelNames;
};


export const getProjectNameById = (
  projectId: number, 
  projectNames: Record<number, string>
): string => {
  return projectNames[projectId] || `프로젝트 ${projectId}`;
};


export const getModelNameById = (
  modelId: number, 
  modelNames: Record<number, string>
): string => {
  return modelNames[modelId] || `모델 ${modelId}`;
}

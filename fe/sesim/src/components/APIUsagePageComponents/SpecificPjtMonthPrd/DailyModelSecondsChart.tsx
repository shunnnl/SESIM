import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { APIUsageModelInfo } from "../../../types/ProjectTypes";
import { DailyModelSecond } from "../../../types/APIUsageTypes";
import { GenericLineChart, LineChartDataItem } from "../../../components/common/ChartComponents";

interface DailyModelDataItem extends LineChartDataItem {
  [modelId: string]: string | number;
}

const processModelDailyData = (data: DailyModelSecond[] | null): DailyModelDataItem[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const dailyData: Record<string, DailyModelDataItem> = {};

  data.forEach(dailyItem => {
    if (!dailyItem || !dailyItem.date) {
      return;
    }

    try {
      const date = new Date(dailyItem.date);
      if (isNaN(date.getTime())) {
        return;
      }

      const dateKey = date.toISOString().split("T")[0];
      const displayDate = `${dateKey.substring(5, 10)}`;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: displayDate };
      }

      if (dailyItem.modelSeconds && Array.isArray(dailyItem.modelSeconds)) {
        dailyItem.modelSeconds.forEach((modelSecond) => {
          dailyData[dateKey][modelSecond.modelId.toString()] = modelSecond.second;
        });
      }
    } catch (error) {
      console.error("날짜 처리 중 오류 발생:", dailyItem.date, error);
    }
  });

  if (Object.keys(dailyData).length === 0) {
    return [];
  }

  const sortedData = Object.values(dailyData).sort((a, b) => {
    const dateA = new Date(Object.keys(dailyData).find(key => dailyData[key] === a) || "");
    const dateB = new Date(Object.keys(dailyData).find(key => dailyData[key] === b) || "");
    return dateA.getTime() - dateB.getTime();
  });

  return sortedData;
};

export default function DailyModelSecondsChart({ data }: { data: DailyModelSecond[] }) {
  const modelInfo = useSelector((state: RootState) => state.apiUsage.apiUsageInitData?.models);

  const modelNames = useMemo(() => {
    const names: Record<string, string> = {};

    if (modelInfo) {
      modelInfo.forEach((model: APIUsageModelInfo) => {
        names[model.modelId.toString()] = model.name;
      });
    }

    return names;
  }, [modelInfo]);

  const dailyData = useMemo(() => processModelDailyData(data), [data]);

  if (!data || data.length === 0 || dailyData.length === 0) {
    return (
      <div className="w-full h-80 p-4 flex justify-center items-center">
        <p className="text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  return <GenericLineChart 
    data={dailyData} 
    keyMap={modelNames} 
    tooltipSuffix="h"
    height="80" 
  />;
};
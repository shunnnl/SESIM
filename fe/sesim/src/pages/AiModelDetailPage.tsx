import { useState } from "react";
import { ImageTitleBannerWithNav } from "../components/AiModelDetail/ImageTitleBannerWithNav";

export const AiModelDetailPage = () => {
    const [selectedTab, setSelectedTab] = useState<"description" | "examplecode">("description");
    
    return (
        <div>
            <ImageTitleBannerWithNav
                modelName="AI 모델 이름!!"
                description="웹 요청에서 해킹 시도와 이상 접근을 식별합니다."
            />
            <div className="container-padding">
                { }
            
                
            </div>
        </div>
    );
};

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAiModels } from "../store/aiModelSlice";
import { getAiModels } from "../services/aiModelService";
import backgroundImage from "../assets/images/ai-model-bg.png";
import { AllAiModels } from "../components/AiModel/AllAiModels";
import { MostAiModel } from "../components/AiModel/MostAiModel";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";

export const AiModelPage: React.FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAiModels = async () => {
            const response = await getAiModels();
            dispatch(setAiModels(response));
        };
        fetchAiModels();
        
    }, []);


    return (
        <div>
            <PageTitleImageWithText
                title="AI 모델"
                description1="SESIM은 고객 데이터를 외부로 보내지 않고,"
                description2="프라이빗 환경에서 AI 보안 모델을 맞춤형으로 제공합니다."
                backgroundImage={backgroundImage}
            />
            <div className="container-padding">
                <MostAiModel />
                <AllAiModels />
            </div>
        </div>
    );
};


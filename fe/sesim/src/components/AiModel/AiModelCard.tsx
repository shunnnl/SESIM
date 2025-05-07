import { SmallAnimatedButton } from "./SmallAnimatedButton"
import sesimImage from "../../assets/images/sesim-logo.png"

interface AiModelCardProps {
    name: string;
    featureTitle: string;
    featureList: string[];
}

export const AiModelCard = ({ name, featureTitle, featureList }: AiModelCardProps) => {
    return (
        <div className="bg-[#2C304B] rounded-[10px] border-[1px] border-[#505671] px-[50px] py-[40px] w-[320px] h-[310px] relative">
            <p className="text-[12px] font-medium pl-[10px]">{featureTitle}</p>
            <div className="flex items-center mt-[2px] mb-[10px]">
                <img
                    src={sesimImage}
                    alt="global"
                    className="w-[40px] h-[40px]"
                />
                <p className="text-[25px] font-bold">{name}</p>
            </div>
            {featureList.map((detail, index) => (
                <p 
                    key={index}
                    className="text-[14px] font-medium pl-[10px] my-[8px]"
                >
                    * {detail}
                </p>
            ))}
            
            <div className="absolute bottom-0 left-0 w-full px-[60px] pb-[40px]">
                <SmallAnimatedButton
                    text="자세히 보기"
                    link={`/ai-model/${name}`}
                    onClick={() => { window.scrollTo(0, 0); }}
                />
            </div>
        </div>
    );
};

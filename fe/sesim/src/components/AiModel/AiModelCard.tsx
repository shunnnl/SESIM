import { useState } from "react";
import { BsCircleFill } from "react-icons/bs";
import { SmallAnimatedButton } from "./SmallAnimatedButton"

interface AiModelCardProps {
    id: number;
    name: string;
    featureTitle: string;
    featureList: string[];
}

export const AiModelCard = ({ id, name, featureTitle, featureList }: AiModelCardProps) => {
    const [isButtonHover, setIsButtonHover] = useState(false);

    return (
        <div
            className={"bg-[#2C304B] rounded-[10px] border-[1px] border-[#505671] px-[45px] py-[40px] w-[320px] h-[310px] relative transition-all duration-300 hover:-translate-y-2" + (isButtonHover ? " z-10" : "")}
            style={isButtonHover ? { boxShadow: "0 0 30px 0 #74D0F4" } : {}}
        >
            <p className="text-[12px] font-medium">{featureTitle}</p>
            <p className="text-[24px] font-bold mt-[2px] mb-[10px]">{name}</p>
            <div className="mt-[20px]">
                {featureList.map((detail, index) => (
                    <p 
                        key={index}
                        className="text-[15px] font-medium  my-[8px] flex items-center gap-[6px]"
                    >
                        <BsCircleFill className="size-[8px] text-white" /> {detail}
                    </p>
                ))}
            </div>
            
            <div className="absolute bottom-0 left-0 w-fit px-[50px] pb-[40px]">
                <div
                    onMouseEnter={() => setIsButtonHover(true)}
                    onMouseLeave={() => setIsButtonHover(false)}
                >
                    <SmallAnimatedButton
                        text="자세히 보기"
                        link={`/ai-model/${id}`}
                        onClick={() => { window.scrollTo(0, 0); }}
                    />
                </div>
            </div>
        </div>
    );
};

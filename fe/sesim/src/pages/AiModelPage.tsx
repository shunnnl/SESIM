
import globalImage from "../assets/images/global.png";
import { MostAiModel } from "../components/AiModel/MostAiModels";


export const AiModelPage: React.FC = () => {
    return (
        <div>
            <MostAiModel />


            <div className="mt-[88px] mb-[300px] text-white">
                <h1 className="text-[24px] md:text-[32px] lg:text-[37px] font-bold text-center">다양한 보안AI 모델을 찾아보세요</h1>

                <div className="relative w-[600px] h-[600px] mx-auto my-[88px]">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[150px] rounded-full"
                        style={{
                            background: "#112F5D", 
                            boxShadow: "0 0 160px 120px #112F5D, 0 0 320px 240px #112F5D",
                            opacity: 0.4,
                            zIndex: 1
                        }}
                    ></div>
                    <img
                        src={globalImage}
                        alt="global"
                        className="relative w-full h-full object-cover z-10"
                    />
                </div>
            </div>  


            
        </div>
    );
};


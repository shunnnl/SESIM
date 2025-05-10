import AboutCompImage1 from "../../assets/images/about-comp1.webp";
import AboutCompImage2 from "../../assets/images/about-comp2.webp";
import AboutCompImage3 from "../../assets/images/about-comp3.webp";
import AboutCompImage4 from "../../assets/images/about-comp4.webp";
import AboutCompImage5 from "../../assets/images/about-comp5.webp";

export const SesimFunctions: React.FC = () => {
    return (
        <>
            <div className="flex flex-col items-center justify-center mt-[200px] -space-y-[20px]">
                <h1 className="text-[60px] font-bold">AI 보안 서비스 플랫폼을 위한</h1>
                <h1 className="text-[60px] font-bold">모든 기능을 담았습니다</h1>
            </div>

            <div className="grid grid-cols-8 gap-x-[80px] gap-y-[30px] place-items-center mt-[60px]">
                <div className="col-span-2 col-start-2 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage1} 
                        alt="AboutCompImage1" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-[27px] font-bold">프라이빗 AI 배포</p>
                </div>

                <div className="col-span-2 col-start-4 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage2} 
                        alt="AboutCompImage2" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-[27px] font-bold">맞춤형 학습 지원</p>
                </div>

                <div className="col-span-2 col-start-6 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage3} 
                        alt="AboutCompImage3" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-[27px] font-bold">실시간 모니터링</p>
                </div>

                <div className="col-span-2 col-start-3 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage4} 
                        alt="AboutCompImage4" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-[27px] font-bold">강력한 보안 정책</p>
                </div>

                <div className="col-span-2 col-start-5 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage5} 
                        alt="AboutCompImage5" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-[27px] font-bold">간편한 설치 및 관리</p>
                </div>
            </div>
        </>
    );
};

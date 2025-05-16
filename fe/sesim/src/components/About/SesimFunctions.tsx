import AboutCompImage1 from "../../assets/images/about-comp1.svg";
import AboutCompImage2 from "../../assets/images/about-comp2.svg";
import AboutCompImage3 from "../../assets/images/about-comp3.svg";
import AboutCompImage4 from "../../assets/images/about-comp4.svg";
import AboutCompImage5 from "../../assets/images/about-comp5.svg";

export const SesimFunctions: React.FC = () => {
    return (
        <div className="py-[100px]">
            <h1 className="text-4xl font-bold text-center">AI 보안 서비스 플랫폼을 위한 모든 기능을 담았습니다</h1>

            <div className="grid grid-cols-8 gap-x-[80px] gap-y-[30px] place-items-center mt-[60px] text-[#E8E8E8]">
                <div className="col-span-2 col-start-2 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage1} 
                        alt="AboutCompImage1" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-2xl font-bold">프라이빗 AI 배포</p>
                </div>

                <div className="col-span-2 col-start-4 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage2} 
                        alt="AboutCompImage2" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-2xl font-bold whitespace-nowrap">고객 맞춤형 AI 학습 지원</p>
                </div>

                <div className="col-span-2 col-start-6 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage3} 
                        alt="AboutCompImage3" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-2xl font-bold">실시간 모니터링</p>
                </div>

                <div className="col-span-2 col-start-3 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage4} 
                        alt="AboutCompImage4" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-2xl font-bold">강력한 보안 정책</p>
                </div>

                <div className="col-span-2 col-start-5 flex flex-col items-center justify-center gap-[10px]">
                    <img 
                        src={AboutCompImage5} 
                        alt="AboutCompImage5" 
                        className="w-[200px] h-[200px]"
                    />
                    <p className="text-2xl font-bold">간편한 배포 및 관리</p>
                </div>
            </div>
        </div>
    );
};

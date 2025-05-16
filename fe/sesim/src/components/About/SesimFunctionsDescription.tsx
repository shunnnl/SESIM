import AboutCompImage1 from "../../assets/images/about-out-comp1.webp";
import AboutCompImage2 from "../../assets/images/about-out-comp2.webp";
import AboutCompImage3 from "../../assets/images/about-out-comp3.webp";
import AboutCompImage4 from "../../assets/images/about-out-comp4.webp";
import AboutCompImage5 from "../../assets/images/about-out-comp5.webp";

export const SesimFunctionsDescription: React.FC = () => {
    return (
        <div className="flex gap-[50px] justify-center">

            <h3 className="text-2xl font-light">세심한 보안</h3>

            <div className="flex flex-col items-center pt-[5px]">
                <div className="w-[20px] h-[20px] bg-[#196DFD] rounded-full" />
                <div className="w-[2px] h-[155px] bg-[#FFFFFF]/30"/>
                <div className="w-[20px] h-[20px] bg-[#196DFD] rounded-full" />
                <div className="w-[2px] h-[155px] bg-[#FFFFFF]/30"/>
                <div className="w-[20px] h-[20px] bg-[#196DFD] rounded-full" />
                <div className="w-[2px] h-[155px] bg-[#FFFFFF]/30"/>
                <div className="w-[20px] h-[20px] bg-[#196DFD] rounded-full" />
                <div className="w-[2px] h-[155px] bg-[#FFFFFF]/30"/>
                <div className="w-[20px] h-[20px] bg-[#196DFD] rounded-full" />
            </div>


            <div className="flex flex-col gap-[50px]">
                <div>
                    <div className="flex items-center gap-[10px]">
                        <img 
                            src={AboutCompImage1} 
                            alt="AboutCompImage1" 
                            className="w-[50px]"
                        />
                        <p className="text-2xl font-bold">프라이빗 AI 배포</p>
                    </div>
                    <div className="text-lg mt-[20px]">
                        <p><span className="font-bold">SESIM</span>은 고객 데이터를 외부로 보내지 않고,</p>
                        <p><span className="text-[#9DC6FF]">프라이빗</span> 환경에서 AI 보안 모델을 맞춤형으로 제공합니다.</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-[10px]">
                        <img 
                            src={AboutCompImage2} 
                            alt="AboutCompImage1" 
                            className="w-[50px]"
                        />
                        <p className="text-2xl font-bold">맞춤형 학습 지원</p>
                    </div>
                    <div className="text-lg mt-[20px]">
                        <p>조직의 보안 로그와 운영 환경에 맞춰 AI 모델을 <span className="text-[#9DC6FF]">최적화</span>하여, </p>
                        <p>더욱 정확한 <span className="font-bold">이상 탐지</span>를 지원합니다.</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-[10px]">
                        <img 
                            src={AboutCompImage3} 
                            alt="AboutCompImage1" 
                            className="w-[50px]"
                        />
                        <p className="text-2xl font-bold">실시간 모니터링</p>
                    </div>
                    <div className="text-lg mt-[20px]">
                        <p>AI 모델의 <span className="text-[#9DC6FF]">탐지 현황</span>과 <span className="text-[#9DC6FF]">리소스 사용량</span>을 <span className="font-bold">실시간</span>으로 시각화하여,</p>
                        <p>이상 징후를 빠르게 파악할 수 있습니다.</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-[10px]">
                        <img 
                            src={AboutCompImage4} 
                            alt="AboutCompImage1" 
                            className="w-[50px]"
                        />
                        <p className="text-2xl font-bold">강력한 보안 정책</p>
                    </div>
                    <div className="text-lg mt-[20px]">
                        <p><span className="font-bold">역할 기반 접근 제어(RBAC)</span>와 <span className="font-bold">암호화 저장</span>을 기본으로 하여, </p>
                        <p>민감한 정보도 안전하게 보호합니다.</p>
                    </div>
                </div>
                
                <div>
                    <div className="flex items-center gap-[10px]">
                        <img 
                            src={AboutCompImage5} 
                            alt="AboutCompImage1" 
                            className="w-[50px]"
                        />
                        <p className="text-2xl font-bold">간편한 설치 및 관리</p>
                    </div>
                    <div className="text-lg mt-[20px]">
                        <p>웹 포털을 통해 원하는 모델을 선택하고,</p>
                        <p><span className="font-bold">원클릭</span>으로 설치부터 관리까지 손쉽게 처리할 수 있습니다.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
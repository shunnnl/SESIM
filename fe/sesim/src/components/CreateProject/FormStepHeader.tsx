import infoIcon from "../../assets/images/info.webp";

interface FormStepHeaderProps {
    step: string;
    title: string;
    description1: string;
    description2?: string;
    information?: string;
    currentStep?: number;
}

export const FormStepHeader : React.FC<FormStepHeaderProps> = ({ step, title, description1, description2, information, currentStep }) => {
    const stepNumber = parseInt(step);
    const isCurrentStep = currentStep === stepNumber - 1;

    return (
        <div className="form-step-header flex flex-col gap-[10px]">
            <div className="flex-1 flex gap-[2px] justify-between items-end">
                <div className="flex gap-[15px] items-center">
                    <p className={`text-5xl font-bold leading-none select-none ${isCurrentStep ? "text-white" : "text-[#949494]/50"}`}>{step}</p>
                    <h2 className="text-4xl font-bold">{title}</h2>
                </div>
                {information && (
                    <p className="flex items-center gap-2 text-[15px] text-white">
                        <img
                            src={infoIcon}
                            alt="info"
                            className=" w-[20px] h-[20px]"
                        />
                        {information}
                    </p>
                )}
            </div>
            <div className="flex flex-row gap-[10px] ml-[5%]">
                <div className="bg-[#495AFF] w-[6px] rounded-full"></div>
                <div className="flex flex-col justify-center text-base font-normal">
                    <p>{description1}</p>
                    {description2 && <p>{description2}</p>}
                </div>
            </div>
        </div>
    );
};
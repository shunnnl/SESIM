import infoIcon from "../../assets/images/info.png";

interface FormStepHeaderProps {
    step: string;
    title: string;
    description: string;
    must?: boolean;
    information?: string;
}

export const FormStepHeader : React.FC<FormStepHeaderProps> = ({ step, title, description, information, must }) => {
    return (
        <div className="flex flex-row gap-[20px] items-start">  
            <p className="text-[50px] font-bold text-[#949494]/50 leading-none select-none">{step}</p>
            <div className="flex-1 flex flex-col gap-[2px]">
                <h2 className="text-[25px] font-bold">{title}</h2>
                <div className="flex flex-row justify-between tems-center gap-0 text-[16px] font-normal">
                    <p>
                        {description}
                        {must && <span className="text-[#FF7E7E] ml-1">*</span>}
                    </p>
                    {information && (
                        <p className="flex items-center gap-2 text-[15px] text-white">
                            <img src={infoIcon} alt="info" className=" w-[20px] h-[20px]" />
                            {information}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
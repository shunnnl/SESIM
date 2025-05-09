import sesimIcon from "../../assets/images/sesim-logo.png"

interface SmallCardProps {  
    description: string;
    modelName: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export const SmallCard : React.FC<SmallCardProps> = ({ description, modelName, isSelected, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center bg-[#242C4D] rounded-[20px] border-[#505671] border-[1px] px-[30px] py-[20px] min-h-[100px] h-full hover:bg-[#3C4061] transition-all duration-200 ${
                isSelected ? "shadow-[0_0_20px_#74D0F4]" : ""
            }`}
        >
            <p className="text-[12px] font-normal">{description}</p>
            <p className="text-[22px] font-bold ml-2">{modelName}</p>
        </button>
    );
};

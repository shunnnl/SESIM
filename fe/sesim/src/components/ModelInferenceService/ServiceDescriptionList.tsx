import { BlueCircle } from "../common/BlueCircle";

interface ServiceDescriptionListProps {
    title: string;
    description: string;
}

export const ServiceDescriptionList: React.FC<ServiceDescriptionListProps> = ({ title, description }) => {
    return (
        <div className="flex flex-row items-baseline gap-[15px]">
            <BlueCircle />
            <div>
                <p className="text-[15px] md:text-[17px] lg:text-[19px] font-bold">{title}</p>
                <p className="text-[15px] md:text-[17px] lg:text-[19px] font-normal">{description}</p>
            </div>
        </div>
    );
};
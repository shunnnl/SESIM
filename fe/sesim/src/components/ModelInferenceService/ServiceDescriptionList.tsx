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
                <p className="text-[15px] font-bold">{title}</p>
                <p>{description}</p>
            </div>
        </div>
    );
};
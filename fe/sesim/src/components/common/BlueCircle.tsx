interface BlueCircleProps {
    color?: string;
}

export const BlueCircle: React.FC<BlueCircleProps> = ({ color }) => {
    const defaultColor = "#196DFD";

    return (
        <div 
            className="w-[10px] h-[10px] rounded-full"
            style={{ backgroundColor: color || defaultColor }}
        ></div>
    )
}
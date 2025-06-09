import ModelInferenceImg1 from "../../assets/images/model-inference1.webp";

export const AiImage = () => {
    return (
        <div className="w-[90%] max-w-[436px] aspect-square border-2 border-[#949393] border-dashed rounded-full flex justify-center items-center">
            <div className="w-[70%] aspect-square rounded-full overflow-hidden">
                <img 
                    src={ModelInferenceImg1} 
                    alt="model-inference-service-image"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};
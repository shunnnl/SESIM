import { FiArrowUpRight } from "react-icons/fi";
import { Model } from "../../types/ProjectTypes";
import bgImage from "../../assets/images/model-bg-1.webp";
import bgImage2 from "../../assets/images/model-bg-2.webp";
import bgImage3 from "../../assets/images/model-bg-3.webp";
import bgImage4 from "../../assets/images/model-bg-4.webp";
import bgImage5 from "../../assets/images/model-bg-5.webp";
import bgImage6 from "../../assets/images/model-bg-6.webp";


interface AIModelListProps {
    items: Model[];
}

const AIModelListItem: React.FC<AIModelListProps> = ({ items }) => {
    const BG_IMAGES = [bgImage, bgImage2, bgImage3, bgImage4, bgImage5, bgImage6];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => {
                const backgroundImage = BG_IMAGES[item.modelId % 6];
                return (
                    <div
                        key={item.modelId}
                        className="relative rounded-2xl h-35 overflow-hidden"
                        style={{
                            boxShadow: '0px 0px 10px rgba(116, 208, 244, 0.3)',
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-70 rounded-2xl z-0" />

                        <div className="relative z-10 p-6">
                            <p className="text-sm mb-1">{item.description}</p>
                            <p className="text-xl font-semibold mb-2">
                                {item.modelName}
                            </p>

                            <button
                                className="flex items-center gap-1 text-white text-sm font-normal px-4 py-1 mt-4 hover:bg-gradient-to-r hover:from-[#5A316C] hover:via-[#513176] hover:to-[#2C3273]"
                                style={{
                                    position: "relative",
                                    border: "1px solid transparent",
                                    borderRadius: "9999px",
                                    backgroundImage:
                                        "linear-gradient(#020207, #020207), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                                    backgroundOrigin: "border-box",
                                    backgroundClip: "padding-box, border-box",
                                    color: "white",
                                }}
                                // onClick={() => {
                                //     if (item.) {  
                                //         window.location.href = item.grafanaUrl; 
                                //     }
                                // }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundImage =
                                        "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundImage =
                                        "linear-gradient(#020207, #020207), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                }}
                            >
                                대시보드 확인
                                <span className="bg-blue-500 p-0.5 rounded-full flex items-center justify-center overflow-hidden ml-1">
                                    <FiArrowUpRight className="text-xs text-white" />
                                </span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AIModelListItem;

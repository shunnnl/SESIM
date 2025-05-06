import { FiArrowUpRight } from "react-icons/fi";
import bgImage from "../../assets/images/project-bg.png";
import bgImage2 from "../../assets/images/project-bg2.png";
import bgImage3 from "../../assets/images/project-bg3.png";
import bgImage4 from "../../assets/images/project-bg4.png";

interface Item {
    id: number;
    modelName: string;
    description: string;
    link: string;
}

interface ProjectItemListProps {
    items: Item[];
}

const ProjectItemList: React.FC<ProjectItemListProps> = ({ items }) => {

    const BG_IMAGES = [bgImage, bgImage2, bgImage3, bgImage4];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => {
                const backgroundImage = BG_IMAGES[item.id % 4]; return (
                    <div
                        key={item.id}
                        className="relative rounded-2xl h-44 overflow-hidden"
                        style={{
                            boxShadow: '0px 0px 10px rgba(116, 208, 244, 0.3)',
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-55 rounded-2xl z-0" />

                        <div className="relative z-10 p-6">
                            <p className="text-sm ml-2 mb-1">{item.description}</p>
                            <p className="text-xl font-semibold mb-2">
                                <img src="src/assets/images/logo-sesim.png" alt="icon" className="inline-block w-6 h-6" />
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
                                onClick={() => {
                                    if (item.link) {
                                        window.location.href = item.link;
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundImage =
                                        "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundImage =
                                        "linear-gradient(#020207, #020207), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                                }}
                            >
                                결과보기
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

export default ProjectItemList;
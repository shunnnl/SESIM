import { Project, Model } from "../../types/ProjectTypes";

interface ApiKeyButtonProps {
    project: Project;
    model: Model;
    isClicked: boolean;
    isLoading: boolean;
    onClick: (model: Model) => void;
}

const ApiKeyButton: React.FC<ApiKeyButtonProps> = ({
    project,
    model,
    isLoading,
    onClick
}) => {
    
    let label = "API Key 확인";

    return (
        <button
            className={`text-base rounded-full px-3 py-1 w-36 ml-4 relative z-0 ${project.deployed
                ? "text-white hover:bg-gradient-to-r hover:from-gradientpink30 hover:via-gradientpurple30 hover:to-gradientblue30"
                : "text-gray-300 bg-gray-500 border border-gray-300 cursor-not-allowed"
                }`}
            style={
                project.deployed
                    ? {
                        position: "relative",
                        border: "2px solid transparent",
                        borderRadius: "9999px",
                        backgroundImage:
                            "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                        color: "white",
                    }
                    : undefined
            }
            onMouseEnter={(e) => {
                if (project.deployed
                ) {
                    e.currentTarget.style.backgroundImage =
                        "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                }
            }}
            onMouseLeave={(e) => {
                if (project.deployed
                ) {
                    e.currentTarget.style.backgroundImage =
                        "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                }
            }}
            onClick={() => {
                if (project.deployed
                ) {
                    onClick(model);
                }
            }}
            disabled={!project.deployed
                || isLoading}
        >
            {label}
        </button>
    );
};

export default ApiKeyButton;
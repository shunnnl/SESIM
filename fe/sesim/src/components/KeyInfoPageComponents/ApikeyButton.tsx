import { Project, Model } from "../../types/keyinfoTypes";

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
    isClicked,
    isLoading,
    onClick
}) => {
    const isDeployed = project.steps[3]?.stepStatus === "DEPLOYED";
    const hasChecked = model.apiKeyCheck;
    const isClickable = isDeployed && !hasChecked && !isClicked;

    let label = "API Key 확인";
    if (project.steps[3]?.stepStatus === "DEPLOYING") {
        label = "배포 중";
    } else if (hasChecked || isClicked) {
        label = "API Key 확인 완료";
    }

    return (
        <button
            className={`text-base rounded-full px-3 py-1 w-36 ml-4 relative z-0 ${
                isClickable
                    ? "text-white hover:bg-gradient-to-r hover:from-gradientpink30 hover:via-gradientpurple30 hover:to-gradientblue30"
                    : "text-gray-300 bg-gray-500 border border-gray-300 cursor-not-allowed"
            }`}
            style={
                isClickable
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
                if (isClickable) {
                    e.currentTarget.style.backgroundImage =
                        "linear-gradient(to right, #5A316C, #513176, #2C3273), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                }
            }}
            onMouseLeave={(e) => {
                if (isClickable) {
                    e.currentTarget.style.backgroundImage =
                        "linear-gradient(#242C4D, #242C4D), linear-gradient(to right, #DF3DAF, #B93FDA, #243FC7)";
                }
            }}
            onClick={() => {
                if (isClickable) {
                    onClick(model);
                }
            }}
            disabled={!isClickable || isLoading}
        >
            {label}
        </button>
    );
};

export default ApiKeyButton;
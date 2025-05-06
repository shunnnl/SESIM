import { AboutSesim } from "../components/About/AboutSesim";
import { ImageTitleBanner } from "../components/About/ImageTitleBanner";
import { SesimFunctions } from "../components/About/SesimFunctions";

export const AboutPage: React.FC = () => {
    return (
        <div className="relative">
            <ImageTitleBanner />

            <div className="container-padding text-white my-[88px] relative z-10">
                <AboutSesim />
                <SesimFunctions />
            </div>
            <div
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                    style={{
                        background: "#00215A", 
                        boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                        opacity: 0.4,
                        zIndex: 0
                }}
            ></div>
            <div
                className="absolute top-[90%] right-0 -translate-y-1/2 w-[150px] h-[150px] rounded-full"
                style={{
                    background: "#00215A", 
                    boxShadow: "0 0 160px 120px #00215A, 0 0 320px 240px #00215A",
                    opacity: 0.4,
                    zIndex: 0
            }}
            ></div>
        </div>
    );
};


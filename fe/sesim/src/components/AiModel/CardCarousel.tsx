import { useState } from "react";
import { Link } from "react-router-dom";
import model1 from "../../assets/images/model1.png";
import model2 from "../../assets/images/model2.png";
import model3 from "../../assets/images/model3.png";

const popularModels = [
    {
        name: "AuthGuard",
        subname: "비정상적 접근 탐지 AI",
        description: "로그를 통한 웹 공격 실시간 포착",
        image: model1,
    },
    {
        name: "WebSentinel",
        subname: "웹 / 앱 이상행동 감지 AI",
        description: "로그를 통한 웹 공격 실시간 포착",
        image: model2,
    },
    {
        name: "NetPulse",
        subname: "이상 트래픽 / 시스템 공격 감지 AI",
        description: "로그를 통한 웹 공격 실시간 포착",
        image: model3,
    }
];

const CARD_BASE_CLASS = "transition-all duration-500 w-[380px] h-[340px] bg-[#181C2F] rounded-2xl p-8 flex flex-col justify-start";

const CARD_STYLE = {
    backgroundSize: "cover",
    backgroundPosition: "center",
    minWidth: 0,
};


function CardItem({ model, style, extraStyle, isLink = false }: any) {
    const content = (
        <>
            <p className="text-[12px] text-white font-medium">{model.subname}</p>
            <h3 className="text-[30px] text-white font-bold mb-2">{model.name}</h3>
            <p className="text-[18px] text-white font-bold">{model.description}</p>
        </>
    );
    const mergedStyle = {
        ...CARD_STYLE,
        backgroundImage: `url(${model.image})`,
        ...extraStyle,
    };
    if (isLink) {
        return (
            <Link
                to={`/ai-model/${model.name}`}
                className={`${CARD_BASE_CLASS} ${style}`}
                style={mergedStyle}
                onClick={() => { window.scrollTo(0, 0); }}
            >
                {content}
            </Link>
        );
    }
    return (
        <div
            className={`${CARD_BASE_CLASS} ${style}`}
            style={mergedStyle}
        >
            {content}
        </div>
    );
};


export const CardCarousel = () => {
    const [current, setCurrent] = useState(0);
    const prev = () => setCurrent((prev) => (prev === 0 ? popularModels.length - 1 : prev - 1));
    const next = () => setCurrent((prev) => (prev === popularModels.length - 1 ? 0 : prev + 1));

    return (
        <div className="relative w-full flex flex-col items-center">
            <div className="relative flex items-center justify-center w-full h-[400px]">
                <button
                    onClick={prev}
                    className="z-30 text-4xl text-white bg-black/30 rounded-full px-3 py-1 absolute left-4 top-1/2 -translate-y-1/2"
                >
                    &#60;
                </button>
                <div className="flex w-full justify-center items-center relative">
                    {popularModels.map((model, idx) => {
                        const leftIdx = (current - 1 + popularModels.length) % popularModels.length;
                        const rightIdx = (current + 1) % popularModels.length;
                        if (idx === current) {
                            return (
                                <CardItem
                                    key={idx}
                                    model={model}
                                    style="opacity-100 scale-100 z-20 relative cursor-pointer"
                                    extraStyle={{ boxShadow: "0 0 50px 0 #74D0F4" }}
                                    isLink={true}
                                />
                            );
                        } else if (idx === rightIdx) {
                            return (
                                <CardItem
                                    key={idx}
                                    model={model}
                                    style="opacity-60 scale-95 z-10 relative left-16"
                                />
                            );
                        } else if (idx === leftIdx) {
                            return (
                                <CardItem
                                    key={idx}
                                    model={model}
                                    style="opacity-60 scale-95 z-10 relative -left-16"
                                />
                            );
                        }
                        return null;
                    })}
                </div>
                <button
                    onClick={next}
                    className="z-30 text-4xl text-white bg-black/30 rounded-full px-3 py-1 absolute right-4 top-1/2 -translate-y-1/2"
                >
                    &#62;
                </button>
            </div>
            <div className="flex justify-center mt-4 gap-2">
                {popularModels.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-3 h-3 rounded-full ${current === idx ? "bg-blue-400" : "bg-gray-500"}`}
                        onClick={() => setCurrent(idx)}
                        style={{ cursor: "pointer" }}
                    />
                ))}
            </div>
        </div>
    );
};
import React from "react";
import { IoWarningOutline } from "react-icons/io5";
import { BsCircleFill, BsQuestionCircle } from "react-icons/bs";

interface NoticeItem {
    text: string;
}
interface FAQItem {
    question: string;
    answer: string;
}

interface GuideNoticeAndFAQProps {
    noticeList: NoticeItem[];
    faqList: FAQItem[];
}

export const GuideNoticeAndFAQ: React.FC<GuideNoticeAndFAQProps> = ({ noticeList, faqList }) => (
    <div className="mt-[100px]">
        <div className="flex flex-row gap-[50px]">
            <div className="flex-2">
                <div className="flex flex-row gap-[10px] items-center">
                    <IoWarningOutline className="text-[#cf4a24] text-4xl" />
                    <h3 className="text-2xl font-bold">주의 사항</h3>
                </div>
                <div className="flex flex-row gap-[20px] mt-[15px]">
                    <div className="bg-[#cf4a24] w-[6px] rounded-full"></div>
                    <div className="text-lg">
                        {noticeList.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-[10px]">
                                <BsCircleFill className="size-[4px] text-white" />
                                <p>{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-3">
                <div className="flex flex-row gap-[10px] items-center">
                    <BsQuestionCircle className="text-[#9DC6FF] text-3xl" />
                    <h3 className="text-2xl font-bold">자주 묻는 질문</h3>
                </div>
                <div className="mt-[15px] ml-[40px] text-lg">
                    {faqList.map((item, idx) => (
                        <div key={idx} className={idx !== 0 ? "mt-[10px]" : ""}>
                            <p className="font-bold">Q) {item.question}</p>
                            <p>A) {item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
); 
import { UserGuideStep1 } from "./UserGuideStep1";
import { UserGuideStep2 } from "./UserGuideStep2";
import { UserGuideStep3 } from "./UserGuideStep3";
import { UserGuideStep4 } from "./UserGuideStep4";
import { UserGuideStep5 } from "./UserGuideStep5";

export const UserGuideSection = () => {
    return (
        <div className="pb-[100px]">
            <UserGuideStep1 />
            <UserGuideStep2 />
            <UserGuideStep3 />
            <UserGuideStep4 />
            <UserGuideStep5 />
        </div>
    );
};

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { HelpButton } from "../components/common/HelpButton";
import { FirstStep } from "../components/CreateProject/FirstStep";
import { ThirdStep } from "../components/CreateProject/ThirdStep";
import { ForthStep } from "../components/CreateProject/ForthStep";
import { FifthStep } from "../components/CreateProject/FifthStep";
import { SecondStep } from "../components/CreateProject/SecondStep";
import { ScrollToTopButton } from "../components/common/ScrollToTopButton";
import { ProgressStepper } from "../components/CreateProject/ProgressStepper";
import { BackgroundBlobs } from "../components/CreateProject/BackgroundBlobs";
import { ProjectErrorModal } from "../components/CreateProject/ProjectErrorModal";
import { ProjectStartModal } from "../components/CreateProject/ProjectStartModal";
import { ProjectLoadingModal } from "../components/CreateProject/ProjectLoadingModal";
import { getDeployOptions, getRoleArns, createProject } from "../services/createProjectService";
import { CreateProjectTitleImageWithText } from "../components/CreateProject/CreateProjectTitleImageWithText";
import { clearAwsSession, clearProjectInfo, clearSelectedModels, clearModelConfig } from "../store/createProjectInfoSlice";

export const CreateProjectPage = () => {
    // Router & Redux
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedModels = useSelector((state: RootState) => state.createProjectInfo.selectedModels);
    const createProjectInfo = useSelector((state: RootState) => state.createProjectInfo);

    // Refs
    const secondStepRef = useRef<HTMLDivElement>(null);
    const thirdStepRef = useRef<HTMLDivElement>(null);
    const forthStepRef = useRef<HTMLDivElement>(null);
    const fifthStepRef = useRef<HTMLDivElement>(null);

    // Step States
    const [firstStepDone, setFirstStepDone] = useState(false);
    const [secondStepDone, setSecondStepDone] = useState(false);
    const [fifthStepDone, setFifthStepDone] = useState(false);
    const [forthStepDone, setForthStepDone] = useState(false);

    // Project Configuration States
    const [selectedInstancePrice, setSelectedInstancePrice] = useState<number>(0);
    const [roleArns, setRoleArns] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [infrastructure, setInfrastructure] = useState<any[]>([]);
    const [combinedPrices, setCombinedPrices] = useState<any[]>([]);
    const [selectedInstanceIdxMap, setSelectedInstanceIdxMap] = useState<{ [modelId: string]: number }>({});

    // Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    // ScrollTop States
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Computed States
    const isAllSelected = selectedModels.length > 0 && selectedModels.every(model => selectedInstanceIdxMap[model.id] !== undefined) && forthStepDone && fifthStepDone;


    const handleCreateProject = async () => {
        setIsLoading(true);
        const projectInfo = {
            arnId: createProjectInfo.arnId,
            projectName: createProjectInfo.projectName,
            projectDescription: createProjectInfo.projectDescription,
            modelConfigs: createProjectInfo.modelConfigs,
        };

        const response = await createProject(projectInfo);
        
        if (response.success === true) {
            setIsLoading(false);
            dispatch(clearAwsSession());
            dispatch(clearProjectInfo());
            dispatch(clearSelectedModels());
            dispatch(clearModelConfig());
            setShowSuccessModal(true);
        } else {
            setIsLoading(false);
            setErrorMessage("프로젝트 생성에 실패했습니다");
            setShowErrorModal(true);
        }
    };


    const handleModalConfirm = () => {
        setShowSuccessModal(false);
        navigate("/keyinfo");
    };


    const handleErrorModalConfirm = () => {
        setShowErrorModal(false);
    };

    useEffect(() => {
        const fetchDeployOptions = async () => {
            const roleArns = await getRoleArns();
            const deployOptions = await getDeployOptions();
            setRoleArns(roleArns.data);
            setModels(deployOptions.data.models);
            setRegions(deployOptions.data.regions);
            setInfrastructure(deployOptions.data.infrastructureSpecs);
            setCombinedPrices(deployOptions.data.combinedPrices);
        };
        fetchDeployOptions();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative overflow-hidden">
            <div className="bg-gradient-1000 absolute top-0 left-0 w-full z-0"></div>
            <BackgroundBlobs />
            <CreateProjectTitleImageWithText />

            <ProgressStepper
                currentStep={
                    !firstStepDone ? 0 :
                    !secondStepDone ? 1 :
                    selectedModels.length === 0 ? 2 :
                    !selectedModels.every(model => selectedInstanceIdxMap[model.id] !== undefined) ? 3 :
                    4
                }
            />

            <div className={`container-padding text-white py-[120px]${selectedModels.length > 0 && selectedInstancePrice > 0 ? " pb-[200px]" : ""} relative z-10`}>
                <FirstStep
                    roleArns={roleArns}
                    setFirstStepDone={setFirstStepDone}
                    currentStep={!firstStepDone ? 0 : -1}
                />
                <SecondStep 
                    ref={secondStepRef}
                    show={firstStepDone}
                    setSecondStepDone={setSecondStepDone}
                    currentStep={firstStepDone && !secondStepDone ? 1 : -1}
                />
                <ThirdStep
                    ref={thirdStepRef}
                    models={models}
                    show={secondStepDone}
                    currentStep={secondStepDone && selectedModels.length === 0 ? 2 : -1}
                />
                <ForthStep
                    ref={forthStepRef}
                    regions={regions}
                    infrastructure={infrastructure}
                    selectedModels={selectedModels}
                    combinedPrices={combinedPrices}
                    show={selectedModels.length > 0}
                    setSelectedInstancePrice={setSelectedInstancePrice}
                    onInstanceMapChange={setSelectedInstanceIdxMap}
                    currentStep={selectedModels.length > 0 ? 3 : -1}
                    setForthStepDone={setForthStepDone}
                />
                <FifthStep 
                    ref={fifthStepRef}
                    show={selectedModels.length > 0 && selectedInstancePrice > 0}
                    setFifthStepDone={setFifthStepDone}
                    currentStep={selectedModels.length > 0 && selectedInstancePrice > 0 ? 4 : -1}
                />
            </div>

            <HelpButton up={showScrollTop}/>
            <ScrollToTopButton show={showScrollTop} />
            
            <div
                className={`fixed left-0 bottom-0 w-full z-50 transition-all duration-500
                    ${selectedModels.length > 0 && selectedInstancePrice > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
                `}
                style={{ maxHeight: "1000px" }}
            >
                <div className="border-t border-[#3C3D5C] bg-[#242C4D] py-[20px]">
                    <div className="flex justify-between items-center px-4 md:px-12">
                        <div>
                            <p className="text-[30px] font-bold text-[#3893FF]">$ {selectedInstancePrice.toFixed(2)} / h</p>
                            <p className="text-[16px] font-medium text-[#A3A3A3]">활성화된 인스턴스(서버) 당 요금</p>
                        </div>
                        <button
                            className={`bg-[#3893FF] text-white font-bold py-[10px] px-[20px] rounded-[5px] w-[200px]
                                transition-all duration-200
                                ${!isAllSelected ? "opacity-50 cursor-not-allowed bg-gray-400" : ""}
                            `}
                            disabled={!isAllSelected}
                            onClick={handleCreateProject}
                        >
                            프로젝트 생성
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ProjectStartModal 
                isOpen={showSuccessModal}
                onConfirm={handleModalConfirm}
            />
            <ProjectLoadingModal 
                isOpen={isLoading}
            />
            <ProjectErrorModal
                isOpen={showErrorModal}
                onConfirm={handleErrorModalConfirm}
                errorMessage={errorMessage}
            />
        </div>
    );
};

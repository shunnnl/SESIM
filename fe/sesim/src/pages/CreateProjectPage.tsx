import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { FirstStep } from "../components/CreateProject/FirstStep";
import { ThirdStep } from "../components/CreateProject/ThirdStep";
import { ForthStep } from "../components/CreateProject/ForthStep";
import { SecondStep } from "../components/CreateProject/SecondStep";
import backgroundImage from "../assets/images/create-project-bg.png";
import { ProjectStartModal } from "../components/CreateProject/ProjectStartModal";
import { ProjectLoadingModal } from "../components/CreateProject/ProjectLoadingModal";
import { ProjectErrorModal } from "../components/CreateProject/ProjectErrorModal";
import { PageTitleImageWithText } from "../components/common/PageTitleImageWithText";
import { getDeployOptions, getRoleArns, createProject } from "../services/createProjectService";
import { clearAwsSession, clearProjectInfo, clearSelectedModels, clearModelConfig } from "../store/createProjectInfoSlice";

export const CreateProjectPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const selectedModels = useSelector((state: RootState) => state.createProjectInfo.selectedModels);
    const createProjectInfo = useSelector((state: RootState) => state.createProjectInfo);
    const [firstStepDone, setFirstStepDone] = useState(false);
    const [secondStepDone, setSecondStepDone] = useState(false);
    const [selectedInstancePrice, setSelectedInstancePrice] = useState<number>(0);
    const [roleArns, setRoleArns] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [infrastructure, setInfrastructure] = useState<any[]>([]);
    const [combinedPrices, setCombinedPrices] = useState<any[]>([]);
    const [selectedInstanceIdxMap, setSelectedInstanceIdxMap] = useState<{ [modelId: string]: number }>({});
    const isAllSelected = selectedModels.length > 0 && selectedModels.every(model => selectedInstanceIdxMap[model.id] !== undefined);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleCreateProject = async () => {
        setIsLoading(true);
        const projectInfo = {
            arnId: createProjectInfo.arnId,
            projectName: createProjectInfo.projectName,
            projectDescription: createProjectInfo.projectDescription,
            modelConfigs: createProjectInfo.modelConfigs,
            roleArn: createProjectInfo.roleArn
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

    return (
        <div>
            <PageTitleImageWithText
                title="프로젝트 생성"
                description1="개인 맞춤형 AI 보안 프로젝트 생성"
                description2=""
                backgroundImage={backgroundImage}
            />
            <div className="container-padding text-white pt-[120px] ">
                <FirstStep
                    roleArns={roleArns}
                    setFirstStepDone={setFirstStepDone} 
                />
                <SecondStep 
                    show={firstStepDone}
                    setSecondStepDone={setSecondStepDone} 
                />
                <ThirdStep
                    models={models}
                    show={secondStepDone} 
                />
                <ForthStep
                    regions={regions}
                    infrastructure={infrastructure}
                    selectedModels={selectedModels}
                    combinedPrices={combinedPrices}
                    show={selectedModels.length > 0}
                    setSelectedInstancePrice={setSelectedInstancePrice}
                    onInstanceMapChange={setSelectedInstanceIdxMap}
                />
            </div>
            
            <div className="mt-[100px]">
                <div className={`transition-all duration-500 ${selectedModels.length > 0 && selectedInstancePrice > 0 ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-10"} overflow-hidden`}>
                    <div className="container-padding flex justify-between items-center border-t border-[#3C3D5C] bg-[#242C4D] py-[20px] mt-[40px]">
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

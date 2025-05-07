import { useState } from "react"
import { motion } from "framer-motion"
import { useDispatch } from "react-redux";
import { BigCard } from "./BigCard"
import { FormStepHeader } from "./FormStepHeader"
import { setAwsSession } from "../../store/createProjectInfoSlice";
import { verifyRoleArn } from "../../services/createProjectService"
import cloudFormationIcon from "../../assets/images/aws-cloudformation.png"

interface FirstStepProps {
    roleArns: { id: number; roleArn: string }[];
    setFirstStepDone: (done: boolean) => void;
}

export const FirstStep = ({ setFirstStepDone, roleArns }: FirstStepProps) => {
    const [validationStatus, setValidationStatus] = useState<"none" | "success" | "fail">("none")
    const [validationMessage, setValidationMessage] = useState("")
    const [arn, setArn] = useState("")
    const dispatch = useDispatch();

    const handleValidation = async () => {
        const response = await verifyRoleArn(arn);
        if (response.success & response.data) {
            dispatch(setAwsSession({
                accessKey: response.data.accessKey,
                secretKey: response.data.secretKey,
                sessionToken: response.data.sessionToken,
                arnId: response.data.arnId,
            }))
            setValidationStatus("success")
            setValidationMessage("검증 완료")
            setFirstStepDone(true)
        } else {
            setValidationStatus("fail")
            setValidationMessage(response.error.message)
            setFirstStepDone(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
            <FormStepHeader
                step="01"
                title="IAM Role 연결" 
                description="SaaS 포털이 고객 AWS에 접근하려면 IAM Role 연결이 필요합니다."
                must={true}
            />
            <div className="mt-[15px]">
                <BigCard>
                    <div>
                        <p className="text-[16px] font-normal text-[#979797]">* CloudFormation 템플릿을 통해 손쉽게 Role을 생성할 수 있습니다.</p>
                        <a 
                            href="https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/template?templateURL=https://sesimbucket.s3.ap-northeast-2.amazonaws.com/trust-role-template.yaml"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] px-[20px] py-[10px] flex flex-row items-center gap-[10px] cursor-pointer w-fit hover:bg-[#3C4061] transition-colors duration-200"
                        >
                            <img 
                                src={cloudFormationIcon} 
                                alt="cloudFormationIcon" 
                                className="w-[25px] h-[30px]" 
                            />
                            <p className="text-[20px] font-bold">CloudFormation</p>
                        </a>
                    </div>
                    <div className="mt-[30px]">
                        <p className="text-[16px] font-normal text-[#979797]">* 기존에 발급한 ARN이 있다면 아래에서 확인해 선택해 주세요.</p>
                        <select className="mt-[10px] w-[500px] bg-[#FFFFFF] border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#000000]">
                            <option value="" disabled selected>ARN을 선택해주세요</option>
                            {roleArns.map((arn) => (
                                <option value={arn.id}>{arn.roleArn}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-[30px]">
                        <p className="text-[16px] font-normal text-[#979797]">* 검증할 IAM Role의 ARN을 입력하고 Assume Role 권한을 확인합니다.</p>
                        <p className="mt-[5px] text-[16px] font-bold">ARN 검증</p>
                        <div className="flex flex-row items-center gap-[20px]">
                            <input 
                                type="text" 
                                className="mt-[10px] w-[500px] bg-transparent border-[#D9D9D9] border-[2px] rounded-[10px] p-[10px] text-[16px] text-[#ffffff] placeholder:text-[#A3A3A3]" 
                                placeholder="ARN을 입력해주세요"
                                value={arn}
                                onChange={(e) => setArn(e.target.value)}
                            />
                            <button 
                                className="mt-[10px] bg-[#2C304B] border-[#505671] border-[1px] rounded-[10px] p-[10px] flex flex-row items-center gap-[10px] h-[50px] hover:bg-[#3C4061] transition-colors duration-200 disabled:bg-[#44485e] disabled:text-[#A3A3A3] disabled:cursor-not-allowed"
                                onClick={handleValidation}
                                disabled={validationStatus === "success"}
                            >
                                <p className="text-[16px] font-medium">Assume Role 검증</p>
                            </button>
                        </div>
                        {validationStatus === "success" && (
                            <p className="mt-[10px] text-[16px] font-medium text-[#90EE90]">{validationMessage}</p>
                        )}
                        {validationStatus === "fail" && (
                            <p className="mt-[10px] text-[16px] font-medium text-[#FF7F7F]">{validationMessage}</p>
                        )}
                    </div>
                </BigCard>
            </div>
        </motion.div>
    );
};

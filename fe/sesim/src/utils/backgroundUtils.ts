export const getPageBackgroundClass = (pathname: string): string => {
    if (pathname === "/") {
        return "bg-cyber-security bg-cover bg-center bg-no-repeat min-h-screen";
    }

    if (pathname === "/model-inference-service/create-project") {
        return "min-h-screen bg-04101D";
    }

    return "bg-[#000000] min-h-screen";
}; 
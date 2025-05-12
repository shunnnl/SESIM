export const getPageBackgroundClass = (pathname: string): string => {
    if (pathname === "/") {
        return "bg-cyber-security bg-cover bg-center bg-no-repeat min-h-screen";
    }
    return "bg-[#04081D] min-h-screen";
}; 
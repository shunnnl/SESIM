export const getPageBackgroundClass = (pathname: string): string => {
    if (pathname === "/") {
        return "bg-cyber-security bg-cover bg-center bg-no-repeat min-h-screen";
    }

    if (pathname === "/apiusage" || pathname === "/project") {
        return "bg-[#04101D] min-h-screen";
    }

    return "bg-[#0A0C35] min-h-screen";
};


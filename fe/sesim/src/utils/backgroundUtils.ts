export const getPageBackgroundClass = (pathname: string): string => {
    if (pathname === "/") {
        return "bg-[#04081D] min-h-screen";
    }

    if (pathname === "/apiusage" || pathname === "/project") {
        return "bg-[#04101D] min-h-screen";
    }

    return "bg-[#000000] min-h-screen";
};
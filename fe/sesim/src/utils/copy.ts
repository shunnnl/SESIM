export function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand("copy");
        console.log("Fallback 복사 성공:", successful);
    } catch (err) {
        console.error("Fallback 복사 실패:", err);
    }

    document.body.removeChild(textArea);
}

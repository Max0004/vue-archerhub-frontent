import html2canvas from "html2canvas";

export interface CapturedImage {
  img: string;
  width: number;
  height: number;
}

export async function captureElementAsImage(
  el: HTMLElement
): Promise<CapturedImage> {
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  return {
    img: canvas.toDataURL("image/png", 1.0),
    width: canvas.width,
    height: canvas.height
  };
}
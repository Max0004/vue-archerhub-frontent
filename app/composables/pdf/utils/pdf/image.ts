import html2canvas from "html2canvas";

export interface CapturedImage {
  img: string;
  width: number;
  height: number;
}

export async function captureElementAsImage(el: HTMLElement) {
  const originalStyle = el.style.color;

  el.style.color = '#000000';

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    return {
      img: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };
  } finally {
    el.style.color = originalStyle;
  }
}
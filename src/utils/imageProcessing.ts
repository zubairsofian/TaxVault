import { jsPDF } from "jspdf";

const yieldFrame = () => new Promise(r => setTimeout(r, 15));

export async function enhanceImageToPdfBase64(
    file: File,
    onProgress?: (progress: number) => void
): Promise<{base64Data: string; isPdfDocument: boolean}> {
    if (onProgress) onProgress(5);

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            if (onProgress) onProgress(15);
            await yieldFrame();

            const img = new Image();
            img.onload = async () => {
                if (onProgress) onProgress(25);
                await yieldFrame();

                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error("Canvas context failed"));
                        return;
                    }
                    
                    const MAX_SIZE = 1200;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    if (onProgress) onProgress(35);
                    await yieldFrame();
                    
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const data = imageData.data;
                    const contrast = 50;
                    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                    
                    const CHUNK_PIXELS = 100000; 
                    const CHUNK_SIZE = CHUNK_PIXELS * 4;

                    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
                        const end = Math.min(i + CHUNK_SIZE, data.length);
                        for (let j = i; j < end; j += 4) {
                            const r = data[j];
                            const g = data[j + 1];
                            const b = data[j + 2];
                            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                            
                            const cGray = factor * (gray - 128) + 128;
                            const val = Math.max(0, Math.min(255, cGray));
                            
                            data[j] = val;
                            data[j + 1] = val;
                            data[j + 2] = val;
                        }
                        
                        if (onProgress) {
                            const processedRatio = (i + CHUNK_SIZE) / data.length;
                            onProgress(Math.min(75, 35 + Math.floor(processedRatio * 40)));
                        }
                        await yieldFrame();
                    }
                    
                    ctx.putImageData(imageData, 0, 0);
                    if (onProgress) onProgress(80);
                    await yieldFrame();
                    
                    const doc = new jsPDF({
                        orientation: width > height ? "landscape" : "portrait",
                        unit: "px",
                        format: [width, height]
                    });
                    
                    const canvasBase64 = canvas.toDataURL("image/jpeg", 0.7);
                    if (onProgress) onProgress(90);
                    await yieldFrame();
                    
                    doc.addImage(canvasBase64, 'JPEG', 0, 0, width, height);
                    if (onProgress) onProgress(95);
                    await yieldFrame();
                    
                    const pdfBase64 = doc.output('datauristring');
                    if (onProgress) onProgress(100);
                    
                    resolve({ base64Data: pdfBase64, isPdfDocument: true });
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error("Image load failed"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
}

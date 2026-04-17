import { jsPDF } from "jspdf";

export async function enhanceImageToPdfBase64(file: File): Promise<{base64Data: string; isPdfDocument: boolean}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Canvas context failed"));
                    return;
                }
                
                // Set max width/height to limit base64 size (e.g. 1200px)
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
                
                // Document enhancement: Draw image, grayscale it, increase contrast
                // 1. Draw image
                ctx.drawImage(img, 0, 0, width, height);
                
                // 2. Grayscale & Contrast
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                const contrast = 50; // Contrast level -255 to 255
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                
                for (let i = 0; i < data.length; i += 4) {
                    // Grayscale
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    
                    // Contrast
                    const cGray = factor * (gray - 128) + 128;
                    const val = Math.max(0, Math.min(255, cGray));
                    
                    data[i] = val;     // red
                    data[i + 1] = val; // green
                    data[i + 2] = val; // blue
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // 3. Convert to PDF
                // Use jsPDF: create a new document taking A4 as base size, but adapt it to image ratio or use standard sizes
                const doc = new jsPDF({
                    orientation: width > height ? "landscape" : "portrait",
                    unit: "px",
                    format: [width, height]
                });
                
                const canvasBase64 = canvas.toDataURL("image/jpeg", 0.7);
                doc.addImage(canvasBase64, 'JPEG', 0, 0, width, height);
                
                // Get PDF as base64 string
                const pdfBase64 = doc.output('datauristring');
                
                resolve({ base64Data: pdfBase64, isPdfDocument: true });
            };
            img.onerror = () => reject(new Error("Image load failed"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
}

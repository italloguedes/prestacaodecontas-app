import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

// Configure PDF.js worker with local import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface ConvertedPage {
    id: string;
    pageNumber: number;
    dataUrl: string;
    blob: Blob;
}

/**
 * Convert a PDF file to images (one per page)
 */
export async function pdfToImages(
    pdfFile: File,
    scale: number = 2
): Promise<ConvertedPage[]> {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: ConvertedPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
        } as any)).promise;

        const dataUrl = canvas.toDataURL('image/png');
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        pages.push({
            id: `page-${i}-${Date.now()}`,
            pageNumber: i,
            dataUrl,
            blob,
        });
    }

    return pages;
}

/**
 * Convert multiple images to a single PDF
 */
export async function imagesToPdf(
    images: { file: File; name: string }[],
    layout: 'single' | 'grid' = 'single'
): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    if (layout === 'single') {
        // One image per page
        for (const img of images) {
            const bytes = await img.file.arrayBuffer();
            const isJpg = img.file.type === 'image/jpeg' || img.file.type === 'image/jpg';
            const image = isJpg
                ? await pdfDoc.embedJpg(bytes)
                : await pdfDoc.embedPng(bytes);

            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const imgDims = image.scaleToFit(width - 40, height - 40);

            page.drawImage(image, {
                x: (width - imgDims.width) / 2,
                y: (height - imgDims.height) / 2,
                width: imgDims.width,
                height: imgDims.height,
            });
        }
    } else {
        // 2x2 grid layout
        let buffer: Awaited<ReturnType<typeof pdfDoc.embedPng | typeof pdfDoc.embedJpg>>[] = [];

        for (const img of images) {
            const bytes = await img.file.arrayBuffer();
            const isJpg = img.file.type === 'image/jpeg' || img.file.type === 'image/jpg';
            const image = isJpg
                ? await pdfDoc.embedJpg(bytes)
                : await pdfDoc.embedPng(bytes);

            buffer.push(image);

            if (buffer.length === 4) {
                const page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                const margin = 40;
                const gap = 20;
                const cellWidth = (width - margin * 2 - gap) / 2;
                const cellHeight = (height - margin * 2 - gap) / 2;

                const positions = [
                    { x: margin, y: margin + cellHeight + gap },
                    { x: margin + cellWidth + gap, y: margin + cellHeight + gap },
                    { x: margin, y: margin },
                    { x: margin + cellWidth + gap, y: margin },
                ];

                buffer.forEach((image, i) => {
                    const imgDims = image.scaleToFit(cellWidth, cellHeight);
                    const pos = positions[i];
                    page.drawImage(image, {
                        x: pos.x + (cellWidth - imgDims.width) / 2,
                        y: pos.y + (cellHeight - imgDims.height) / 2,
                        width: imgDims.width,
                        height: imgDims.height,
                    });
                });

                buffer = [];
            }
        }

        // Remaining images
        if (buffer.length > 0) {
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            const margin = 40;
            const gap = 20;
            const cellWidth = (width - margin * 2 - gap) / 2;
            const cellHeight = (height - margin * 2 - gap) / 2;

            const positions = [
                { x: margin, y: margin + cellHeight + gap },
                { x: margin + cellWidth + gap, y: margin + cellHeight + gap },
                { x: margin, y: margin },
                { x: margin + cellWidth + gap, y: margin },
            ];

            buffer.forEach((image, i) => {
                const imgDims = image.scaleToFit(cellWidth, cellHeight);
                const pos = positions[i];
                page.drawImage(image, {
                    x: pos.x + (cellWidth - imgDims.width) / 2,
                    y: pos.y + (cellHeight - imgDims.height) / 2,
                    width: imgDims.width,
                    height: imgDims.height,
                });
            });
        }
    }

    return pdfDoc.save();
}

/**
 * Download multiple images as a ZIP file
 */
export async function downloadAsZip(
    pages: ConvertedPage[],
    zipName: string = 'pages'
): Promise<void> {
    const zip = new JSZip();

    pages.forEach((page) => {
        zip.file(`page-${page.pageNumber}.png`, page.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download a single image
 */
export function downloadImage(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

import { PDFDocument, PDFImage } from 'pdf-lib';
import type { UploadedFile } from '../store/useFileStore';

export async function generatePDF(files: UploadedFile[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    let imageBuffer: { image: PDFImage, name: string }[] = [];

    const flushImages = async () => {
        if (imageBuffer.length === 0) return;

        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 40;
        const gap = 20;

        // Calculate cell size for 2x2 grid
        const availableWidth = width - (margin * 2) - gap;
        const availableHeight = height - (margin * 2) - gap;
        const cellWidth = availableWidth / 2;
        const cellHeight = availableHeight / 2;

        // Grid positions: [x, y] (y is from bottom)
        // Top-Left, Top-Right, Bottom-Left, Bottom-Right
        // Note: PDF coordinates start from bottom-left
        const positions = [
            { x: margin, y: margin + cellHeight + gap }, // Top-Left
            { x: margin + cellWidth + gap, y: margin + cellHeight + gap }, // Top-Right
            { x: margin, y: margin }, // Bottom-Left
            { x: margin + cellWidth + gap, y: margin }, // Bottom-Right
        ];

        for (let i = 0; i < imageBuffer.length; i++) {
            const { image } = imageBuffer[i];
            const pos = positions[i];

            // Scale image to fit within cell
            const imgDims = image.scaleToFit(cellWidth, cellHeight);

            // Center image in cell
            const xOffset = (cellWidth - imgDims.width) / 2;
            const yOffset = (cellHeight - imgDims.height) / 2;

            page.drawImage(image, {
                x: pos.x + xOffset,
                y: pos.y + yOffset,
                width: imgDims.width,
                height: imgDims.height,
            });
        }

        imageBuffer = [];
    };

    for (const file of files) {
        try {
            const fileBuffer = await file.file.arrayBuffer();

            if (file.type === 'image') {
                let image;
                if (file.file.type === 'image/png') {
                    image = await pdfDoc.embedPng(fileBuffer);
                } else {
                    image = await pdfDoc.embedJpg(fileBuffer);
                }

                imageBuffer.push({ image, name: file.name });

                if (imageBuffer.length === 4) {
                    await flushImages();
                }

            } else if (file.type === 'pdf') {
                // Flush any pending images before adding PDF pages
                await flushImages();

                const srcDoc = await PDFDocument.load(fileBuffer);
                const indices = srcDoc.getPageIndices();
                const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
                copiedPages.forEach((page) => pdfDoc.addPage(page));
            }
        } catch (error) {
            console.error(`Failed to process file ${file.name}:`, error);
        }
    }

    // Flush any remaining images
    await flushImages();

    return await pdfDoc.save();
}

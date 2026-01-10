import pdfImgConvert from 'pdf-img-convert';

/**
 * Generate a cover image from the first page of a PDF buffer.
 * @param pdfBuffer The PDF file buffer
 * @returns A Promise resolving to a Buffer containing the PNG image of the first page
 */
export async function generateCoverImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
        // Convert the first page (page 1) to an image
        // pdf-img-convert is 1-indexed for page numbers in some contexts, 
        // but let's check the API. usually it takes an array of page numbers or defaults to all.
        // We want only the first page.

        const outputImages = await pdfImgConvert.convert(pdfBuffer, {
            page_numbers: [1],
            base64: false, // Return as Uint8Array (Buffer compatible)
            scale: 2.0 // Better quality
        });

        if (outputImages.length === 0) {
            throw new Error('No images generated from PDF');
        }

        // Output is essentially string | Uint8Array | Buffer depending on options. 
        // Default (base64: false) returns Uint8Array or Buffer. 
        // We cast/convert to Buffer to be safe.
        return Buffer.from(outputImages[0]);

    } catch (error) {
        console.error('Error generating cover image:', error);
        throw new Error('Failed to generate cover image');
    }
}

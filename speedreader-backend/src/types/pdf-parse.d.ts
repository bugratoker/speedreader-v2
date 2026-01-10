/**
 * Type declarations for modules without types
 */

declare module 'pdf-parse' {
    interface PDFInfo {
        Title?: string;
        Author?: string;
        Subject?: string;
        Creator?: string;
        Producer?: string;
        CreationDate?: string;
        ModDate?: string;
    }

    interface PDFData {
        numpages: number;
        numrender: number;
        info: PDFInfo;
        metadata: Record<string, unknown> | null;
        text: string;
        version: string;
    }

    interface PDFOptions {
        pagerender?: (pageData: unknown) => string;
        max?: number;
        version?: string;
    }

    function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

    export = pdfParse;
}

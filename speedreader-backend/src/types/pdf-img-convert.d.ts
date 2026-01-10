declare module 'pdf-img-convert' {
    export type ConvertOptions = {
        page_numbers?: number[];
        base64?: boolean;
        scale?: number;
        width?: number;
        height?: number;
    };

    /**
     * Converts a PDF to images.
     * @param pdf The PDF input (files path, buffer, or base64 string)
     * @param options Configuration options
     * @returns Array of images (Buffer or string if base64 is true)
     */
    export function convert(
        pdf: string | Buffer | Uint8Array,
        options?: ConvertOptions
    ): Promise<string[] | Uint8Array[]>;
}

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class StorageService {
    private client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        this.bucketName = process.env.R2_BUCKET_NAME || '';
        this.publicUrl = process.env.R2_PUBLIC_URL || '';

        if (!accountId || !accessKeyId || !secretAccessKey || !this.bucketName) {
            console.warn('R2 Storage credentials missing. Storage service will not function correctly.');
        }

        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: accessKeyId || '',
                secretAccessKey: secretAccessKey || '',
            },
        });
    }

    /**
     * Upload a file to R2
     * @param key The path/key where the file will be stored
     * @param body The file content
     * @param contentType The MIME type of the file
     * @returns The public URL of the uploaded file if configured, otherwise the key
     */
    async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
        try {
            await this.client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: body,
                ContentType: contentType,
            }));

            if (this.publicUrl) {
                // Ensure publicUrl doesn't have a trailing slash and key doesn't have a leading slash
                const baseUrl = this.publicUrl.endsWith('/') ? this.publicUrl.slice(0, -1) : this.publicUrl;
                const safeKey = key.startsWith('/') ? key.slice(1) : key;
                return `${baseUrl}/${safeKey}`;
            }

            return key;
        } catch (error) {
            console.error('Error uploading file to R2:', error);
            throw new Error('Failed to upload file to storage');
        }
    }

    /**
     * Delete a file from R2
     * @param key The path/key of the file to delete
     */
    async deleteFile(key: string): Promise<void> {
        try {
            await this.client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
        } catch (error) {
            console.error('Error deleting file from R2:', error);
            throw new Error('Failed to delete file from storage');
        }
    }
}

export const storageService = new StorageService();

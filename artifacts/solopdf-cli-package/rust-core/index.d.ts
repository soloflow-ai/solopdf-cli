export interface SigningOptions {
  fontSize?: number;
  color?: string;
  xPosition?: number;
  yPosition?: number;
  pages?: number[];
  position?: string;
  rotation?: number;
  opacity?: number;
}

export declare function getPageCount(filePath: string): number;
export declare function signPdfWithOptions(inputPath: string, outputPath: string, signatureText: string, options?: SigningOptions): void;
export declare function getPdfInfoBeforeSigning(filePath: string): any;
export declare function getPdfChecksum(filePath: string): string;
export declare function generateSigningKeyPair(): string;
export declare function getKeyInfoFromJson(keyData: string): any;
export declare function signPdfWithKey(inputPath: string, outputPath: string, keyData: string, reason?: string, location?: string, contactInfo?: string): void;
export declare function verifyPdfSignature(filePath: string): any;

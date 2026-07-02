// Type declarations for document parsing
declare module 'pdf-parse' {
  export interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
  }
  export default function pdf(buffer: Buffer): Promise<PDFData>;
}

declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }
  const mammoth: {
    extractRawText: (options: { buffer: Buffer }) => Promise<MammothResult>;
  };
  export = mammoth;
}

declare module 'node-fetch' {
  export interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    text(): Promise<string>;
    json(): Promise<any>;
  }
  export default function fetch(url: string, options?: any): Promise<Response>;
}

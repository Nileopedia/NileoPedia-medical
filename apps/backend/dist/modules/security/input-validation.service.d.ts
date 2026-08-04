/**
 * Input Validation Service
 *
 * Validates all user inputs to prevent injection attacks:
 * - SQL Injection
 * - XSS
 * - Command Injection
 * - Path Traversal
 * - Prompt Injection
 * - Embedding Injection
 * - RAG Context Poisoning
 */
export declare const sanitizeString: (input: string) => string;
export declare const sanitizeObject: (obj: any) => any;
export declare const validateFileUpload: (file: Express.Multer.File) => {
    valid: boolean;
    errors: string[];
};
export declare const detectPromptInjection: (input: string) => {
    safe: boolean;
    threats: string[];
};
export declare const detectEmbeddingInjection: (text: string) => {
    safe: boolean;
    threats: string[];
};
export declare const detectRAGPoisoning: (text: string) => {
    safe: boolean;
    threats: string[];
};
export declare const validateMedicalQuery: (query: string) => {
    valid: boolean;
    errors: string[];
};
export declare const validateFilePath: (filePath: string) => {
    valid: boolean;
    errors: string[];
};
export declare const validateSQLQuery: (query: string) => {
    valid: boolean;
    threats: string[];
};
export declare function sanitize(input: any): any;
export declare function validate(input: any, schema: any): Promise<any>;
//# sourceMappingURL=input-validation.service.d.ts.map
"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.sanitize = exports.validateSQLQuery = exports.validateFilePath = exports.validateMedicalQuery = exports.detectRAGPoisoning = exports.detectEmbeddingInjection = exports.detectPromptInjection = exports.validateFileUpload = exports.sanitizeObject = exports.sanitizeString = void 0;
const sanitizeString = (input) => {
    if (typeof input !== 'string')
        return '';
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/url\s*\(/gi, '')
        .trim();
};
exports.sanitizeString = sanitizeString;
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'string') {
        return (0, exports.sanitizeString)(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(exports.sanitizeObject);
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[(0, exports.sanitizeString)(key)] = (0, exports.sanitizeObject)(value);
        }
        return sanitized;
    }
    return obj;
};
exports.sanitizeObject = sanitizeObject;
const validateFileUpload = (file) => {
    const errors = [];
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/html',
        'text/plain',
        'application/xml',
        'text/xml',
    ];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.html', '.htm', '.txt', '.xml'];
    const maxFileSize = 50 * 1024 * 1024;
    if (!file) {
        return { valid: false, errors: ['No file provided'] };
    }
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
        errors.push(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
    }
    if (file.size > maxFileSize) {
        errors.push(`File size exceeds maximum of ${maxFileSize / 1024 / 1024}MB`);
    }
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        errors.push('Invalid filename: contains path traversal characters');
    }
    return { valid: errors.length === 0, errors };
};
exports.validateFileUpload = validateFileUpload;
const detectPromptInjection = (input) => {
    const threats = [];
    const lowerInput = input.toLowerCase();
    const injectionPatterns = [
        /ignore\s+(all\s+)?previous\s+instructions/gi,
        /you\s+are\s+now\s+/gi,
        /system\s*:\s*you\s+are/gi,
        /new\s+instructions/gi,
        /override\s+previous/gi,
        /disregard\s+all/gi,
        /pretend\s+you\s+are/gi,
        /act\s+as\s+if/gi,
        /roleplay\s+as/gi,
        /jailbreak/gi,
        /dan\s+mode/gi,
        /developer\s+mode/gi,
        /unlimited\s+mode/gi,
        /bypass\s+filter/gi,
        /disable\s+safety/gi,
        /ignore\s+safety/gi,
    ];
    injectionPatterns.forEach(pattern => {
        if (pattern.test(lowerInput)) {
            threats.push(`Potential prompt injection detected: ${pattern.source}`);
        }
    });
    return { safe: threats.length === 0, threats };
};
exports.detectPromptInjection = detectPromptInjection;
const detectEmbeddingInjection = (text) => {
    const threats = [];
    const suspiciousPatterns = [
        /\[SYSTEM\].*?\[\/SYSTEM\]/gi,
        /<\|im_start\|>system/gi,
        /<\|im_end\|>/gi,
        /\[INST\].*?\[\/INST\]/gi,
        /<<SYS>>/gi,
        /<\/SYS>>/gi,
        /###\s*instruction/gi,
        /###\s*system/gi,
        /\/\/\/\s*system/gi,
        /base64\s*:/gi,
        /data\s*:\s*text\/html/gi,
        /javascript\s*:/gi,
        /vbscript\s*:/gi,
    ];
    suspiciousPatterns.forEach(pattern => {
        if (pattern.test(text)) {
            threats.push(`Potential embedding injection detected`);
        }
    });
    return { safe: threats.length === 0, threats };
};
exports.detectEmbeddingInjection = detectEmbeddingInjection;
const detectRAGPoisoning = (text) => {
    const threats = [];
    const poisoningPatterns = [
        /ignore\s+context/gi,
        /override\s+retrieval/gi,
        /disregard\s+documents/gi,
        /use\s+only\s+this/gi,
        /trust\s+only\s+this/gi,
        /this\s+is\s+the\s+correct/gi,
        /forget\s+previous/gi,
        /new\s+context\s+only/gi,
    ];
    poisoningPatterns.forEach(pattern => {
        if (pattern.test(text)) {
            threats.push(`Potential RAG poisoning detected`);
        }
    });
    return { safe: threats.length === 0, threats };
};
exports.detectRAGPoisoning = detectRAGPoisoning;
const validateMedicalQuery = (query) => {
    const errors = [];
    if (!query || query.trim().length === 0) {
        errors.push('Query cannot be empty');
    }
    if (query.length > 1000) {
        errors.push('Query exceeds maximum length of 1000 characters');
    }
    const promptInjection = (0, exports.detectPromptInjection)(query);
    if (!promptInjection.safe) {
        errors.push(`Prompt injection detected: ${promptInjection.threats.join(', ')}`);
    }
    const embeddingInjection = (0, exports.detectEmbeddingInjection)(query);
    if (!embeddingInjection.safe) {
        errors.push(`Embedding injection detected`);
    }
    const ragPoisoning = (0, exports.detectRAGPoisoning)(query);
    if (!ragPoisoning.safe) {
        errors.push(`RAG poisoning detected`);
    }
    return { valid: errors.length === 0, errors };
};
exports.validateMedicalQuery = validateMedicalQuery;
const validateFilePath = (filePath) => {
    const errors = [];
    if (!filePath) {
        errors.push('File path cannot be empty');
        return { valid: false, errors };
    }
    if (filePath.includes('..')) {
        errors.push('Path traversal detected: contains ".."');
    }
    if (filePath.includes('~')) {
        errors.push('Path traversal detected: contains "~"');
    }
    if (/[<>:"|?*]/.test(filePath)) {
        errors.push('Invalid characters in file path');
    }
    const normalizedPath = require('path').normalize(filePath);
    if (normalizedPath.startsWith('..') || normalizedPath.startsWith('/')) {
        errors.push('Absolute or parent path detected');
    }
    return { valid: errors.length === 0, errors };
};
exports.validateFilePath = validateFilePath;
const validateSQLQuery = (query) => {
    const threats = [];
    const lowerQuery = query.toLowerCase();
    const sqlInjectionPatterns = [
        /\bunion\s+all\s+select\b/gi,
        /\bunion\s+select\b/gi,
        /\bselect\s+.*\bfrom\b/gi,
        /\binsert\s+into\b/gi,
        /\bupdate\b.*\bset\b/gi,
        /\bdelete\s+from\b/gi,
        /\bdrop\s+table\b/gi,
        /\btruncate\b/gi,
        /\balter\s+table\b/gi,
        /--\s/gi,
        /\/\*.*?\*\//gi,
        /\bor\s+1\s*=\s*1\b/gi,
        /\band\s+1\s*=\s*1\b/gi,
        /'\s*or\s+'/gi,
        /"\s*or\s+"/gi,
    ];
    sqlInjectionPatterns.forEach(pattern => {
        if (pattern.test(lowerQuery)) {
            threats.push(`Potential SQL injection: ${pattern.source}`);
        }
    });
    return { valid: threats.length === 0, threats };
};
exports.validateSQLQuery = validateSQLQuery;
function sanitize(input) {
    return (0, exports.sanitizeObject)(input);
}
exports.sanitize = sanitize;
async function validate(input, schema) {
    const { z } = await Promise.resolve().then(() => __importStar(require('zod')));
    if (schema && typeof schema.parse === 'function') {
        return schema.parse(input);
    }
    return input;
}
exports.validate = validate;
//# sourceMappingURL=input-validation.service.js.map
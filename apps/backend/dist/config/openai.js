"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenAI = exports.initOpenAI = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("./env");
let openaiInstance = null;
const initOpenAI = () => {
    if (openaiInstance) {
        return openaiInstance;
    }
    if (!env_1.CONFIG.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not set');
    }
    openaiInstance = new openai_1.default({
        apiKey: env_1.CONFIG.OPENAI_API_KEY,
    });
    return openaiInstance;
};
exports.initOpenAI = initOpenAI;
const getOpenAI = () => {
    if (!openaiInstance) {
        throw new Error('OpenAI not initialized. Call initOpenAI first.');
    }
    return openaiInstance;
};
exports.getOpenAI = getOpenAI;
//# sourceMappingURL=openai.js.map
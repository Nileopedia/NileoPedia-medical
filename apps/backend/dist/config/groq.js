"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroq = exports.initGroq = void 0;
const groq_sdk_1 = require("groq-sdk");
const env_1 = require("./env");
let groqInstance = null;
const initGroq = () => {
    if (groqInstance) {
        return groqInstance;
    }
    if (!env_1.CONFIG.GROQ_API_KEY) {
        throw new Error('Groq API key not set');
    }
    groqInstance = new groq_sdk_1.Groq({
        apiKey: env_1.CONFIG.GROQ_API_KEY,
    });
    return groqInstance;
};
exports.initGroq = initGroq;
const getGroq = () => {
    if (!groqInstance) {
        throw new Error('Groq not initialized. Call initGroq first.');
    }
    return groqInstance;
};
exports.getGroq = getGroq;
//# sourceMappingURL=groq.js.map
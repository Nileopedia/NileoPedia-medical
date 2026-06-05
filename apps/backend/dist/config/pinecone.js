"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPineconeIndex = exports.initPinecone = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("./env");
let pineconeInstance = null;
const initPinecone = () => {
    if (pineconeInstance) {
        return pineconeInstance;
    }
    if (!env_1.CONFIG.PINECONE_API_KEY) {
        throw new Error('Pinecone API key not set');
    }
    pineconeInstance = new pinecone_1.Pinecone({
        apiKey: env_1.CONFIG.PINECONE_API_KEY,
    });
    return pineconeInstance;
};
exports.initPinecone = initPinecone;
const getPineconeIndex = () => {
    if (!pineconeInstance) {
        throw new Error('Pinecone not initialized. Call initPinecone first.');
    }
    return pineconeInstance.Index(env_1.CONFIG.PINECONE_INDEX_NAME);
};
exports.getPineconeIndex = getPineconeIndex;
//# sourceMappingURL=pinecone.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("./env");
const { combine, timestamp, label, printf, errors } = winston_1.default.format;
const loggerFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
exports.logger = winston_1.default.createLogger({
    level: env_1.CONFIG.NODE_ENV === 'development' ? 'debug' : 'info',
    format: combine(errors({ stack: true }), label({ label: 'nileopedia-backend' }), timestamp(), loggerFormat),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ],
});
//# sourceMappingURL=logger.js.map
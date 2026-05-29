"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./workers/document.worker");
require("./workers/ai.worker");
require("./workers/email.worker");
require("./workers/notification.worker");
require("./workers/audit.worker");
require("./workers/cleanup.worker");
const schedulers_1 = require("./schedulers");
console.log('Worker system initialized');
(0, schedulers_1.setupSchedulers)();
process.on('SIGTERM', () => {
    console.log('Worker shutting down...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('Worker shutting down...');
    process.exit(0);
});
//# sourceMappingURL=worker.js.map
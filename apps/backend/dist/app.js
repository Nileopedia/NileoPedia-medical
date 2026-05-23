"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const database_1 = require("./infrastructure/database");
const middleware_1 = require("./shared/middleware");
const routes_1 = require("./routes");
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.CONFIG.CORS_ORIGIN,
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
// Connect to database
(0, database_1.connectDB)()
    .then(() => {
    console.log('Database connected successfully');
    // Setup middleware (cors, helmet, body parser, etc.)
    (0, middleware_1.setupMiddleware)(app);
    // Setup routes
    (0, routes_1.setupRoutes)(app, io);
    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    // Start server
    const PORT = env_1.CONFIG.PORT;
    httpServer.listen(PORT, () => {
        console.log(`Server running in ${env_1.CONFIG.NODE_ENV} mode on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});
//# sourceMappingURL=app.js.map
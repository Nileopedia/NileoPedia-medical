"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("../../config/env");
let sequelizeInstance = null;
const connectDB = async () => {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }
    sequelizeInstance = new sequelize_1.Sequelize(env_1.CONFIG.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
    });
    try {
        await sequelizeInstance.authenticate();
        console.log('Database connected successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
    return sequelizeInstance;
};
exports.connectDB = connectDB;
const getDB = () => {
    if (!sequelizeInstance) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return sequelizeInstance;
};
exports.getDB = getDB;
//# sourceMappingURL=index.js.map
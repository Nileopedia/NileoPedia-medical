"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const User = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        fullName: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        roleId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        organization: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
        specialization: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        refreshToken: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
    }, {
        tableName: 'users',
        timestamps: true,
    });
    return User;
};
exports.User = User;
exports.default = exports.User;
//# sourceMappingURL=user.model.js.map
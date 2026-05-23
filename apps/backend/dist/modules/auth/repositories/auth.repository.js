"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const user_model_1 = require("../../../models/user.model");
const db_1 = require("../../../config/db");
class AuthRepository {
    constructor() {
        const sequelize = (0, db_1.getDB)();
        this.UserModel = (0, user_model_1.User)(sequelize);
    }
    async findByEmail(email) {
        return this.UserModel.findOne({ where: { email } });
    }
    async findById(id) {
        return this.UserModel.findByPk(id);
    }
    async create(userData) {
        return this.UserModel.create(userData);
    }
    async update(id, userData) {
        const [updated] = await this.UserModel.update(userData, { where: { id } });
        return updated;
    }
    async setRefreshToken(id, refreshToken) {
        return this.UserModel.update({ refreshToken }, { where: { id } });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map
import { User } from '../../../models/user.model';
import { getDB } from '../../../config/db';
import { Sequelize } from 'sequelize';

export class AuthRepository {
  private UserModel: ReturnType<typeof User>;

  constructor() {
    const sequelize = getDB();
    this.UserModel = User(sequelize);
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.UserModel.findByPk(id);
  }

  async create(userData: any) {
    return this.UserModel.create(userData);
  }

  async update(id: string, userData: any) {
    const [updated] = await this.UserModel.update(userData, { where: { id } });
    return updated;
  }

  async setRefreshToken(id: string, refreshToken: string | null) {
    return this.UserModel.update({ refreshToken }, { where: { id } });
  }
}
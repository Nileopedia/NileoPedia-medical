import { Sequelize, Model, DataTypes, BuildOptions, Optional } from 'sequelize';
import { getDB } from '../config/db';

export interface UserAttributes {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  roleId: string;
  organization?: string | null;
  specialization?: string | null;
  status: string;
  refreshToken?: string | null;
  profilePicture?: string | null;
  isGoogleUser?: boolean;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = typeof Model & {
  new (values?: object, options?: BuildOptions): UserInstance;
};

export const User = (sequelize: Sequelize) => {
  const User = sequelize.define<UserInstance, UserAttributes>('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    specialization: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isGoogleUser: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'users',
    timestamps: true,
  });

  return User;
};

export default User;
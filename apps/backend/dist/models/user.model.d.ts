import { Sequelize, Model, BuildOptions, Optional } from 'sequelize';
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
    createdAt: Date;
    updatedAt: Date;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
}
export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
    createdAt: Date;
    updatedAt: Date;
}
export type UserModel = typeof Model & {
    new (values?: object, options?: BuildOptions): UserInstance;
};
export declare const User: (sequelize: Sequelize) => import("sequelize").ModelCtor<UserInstance>;
export default User;
//# sourceMappingURL=user.model.d.ts.map
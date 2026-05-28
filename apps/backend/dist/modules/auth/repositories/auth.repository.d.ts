import { UserInstance } from '../../../models/user.model';
export declare class AuthRepository {
    private UserModel;
    constructor();
    findByEmail(email: string): Promise<UserInstance | null>;
    findById(id: string): Promise<UserInstance | null>;
    create(userData: any): Promise<UserInstance>;
    update(id: string, userData: any): Promise<number>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<[affectedCount: number]>;
}
//# sourceMappingURL=auth.repository.d.ts.map
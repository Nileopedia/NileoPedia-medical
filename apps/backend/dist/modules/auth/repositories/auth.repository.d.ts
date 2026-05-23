export declare class AuthRepository {
    private UserModel;
    constructor();
    findByEmail(email: string): Promise<import("../../../models/user.model").UserInstance | null>;
    findById(id: string): Promise<import("../../../models/user.model").UserInstance | null>;
    create(userData: any): Promise<import("../../../models/user.model").UserInstance>;
    update(id: string, userData: any): Promise<number>;
    setRefreshToken(id: string, refreshToken: string | null): Promise<[affectedCount: number]>;
}
//# sourceMappingURL=auth.repository.d.ts.map
import jwt from 'jsonwebtoken';
export declare class JwtService {
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    verifyAccessToken(token: string): string | jwt.JwtPayload;
    verifyRefreshToken(token: string): string | jwt.JwtPayload;
}
//# sourceMappingURL=jwt.service.d.ts.map
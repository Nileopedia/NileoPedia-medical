"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class ValidationService {
    async getPending() {
        const responses = await prisma_1.default.aIResponse.findMany({
            where: { validationStatus: 'PENDING' },
            include: { question: true },
        });
        return responses;
    }
    async approve(responseId, validatorId, score, feedback) {
        await prisma_1.default.$transaction(async (tx) => {
            await tx.aIResponse.update({
                where: { id: responseId },
                data: { validationStatus: 'APPROVED' },
            });
            await tx.validationReview.create({
                data: {
                    aiResponseId: responseId,
                    validatorId,
                    status: 'APPROVED',
                    score,
                    feedback,
                },
            });
        });
    }
    async reject(responseId, validatorId, feedback) {
        await prisma_1.default.$transaction(async (tx) => {
            await tx.aIResponse.update({
                where: { id: responseId },
                data: { validationStatus: 'REJECTED' },
            });
            await tx.validationReview.create({
                data: {
                    aiResponseId: responseId,
                    validatorId,
                    status: 'REJECTED',
                    feedback,
                },
            });
        });
    }
    async getHistory(validatorId) {
        const reviews = await prisma_1.default.validationReview.findMany({
            where: { validatorId },
            include: { aiResponse: { include: { question: true } } },
            orderBy: { reviewedAt: 'desc' },
        });
        return reviews;
    }
    async getReview(responseId) {
        const review = await prisma_1.default.validationReview.findFirst({
            where: { aiResponseId: responseId },
        });
        return review;
    }
}
exports.ValidationService = ValidationService;
//# sourceMappingURL=validation.service.js.map
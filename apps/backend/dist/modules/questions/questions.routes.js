"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questions_controller_1 = require("./controllers/questions.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const questionsController = new questions_controller_1.QuestionsController();
const router = (0, express_1.Router)();
router.post('/ask', auth_middleware_1.authenticate, questionsController.askQuestion.bind(questionsController));
router.get('/history', auth_middleware_1.authenticate, questionsController.getHistory.bind(questionsController));
router.get('/:questionId', auth_middleware_1.authenticate, questionsController.getQuestion.bind(questionsController));
router.post('/:questionId/save', auth_middleware_1.authenticate, questionsController.saveResponse.bind(questionsController));
router.delete('/:questionId/save', auth_middleware_1.authenticate, questionsController.unsaveResponse.bind(questionsController));
exports.default = router;
//# sourceMappingURL=questions.routes.js.map
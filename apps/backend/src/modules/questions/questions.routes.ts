import { Router } from 'express';
import { QuestionsController } from './controllers/questions.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const questionsController = new QuestionsController();

const router: Router = Router();

router.post('/ask', authenticate, questionsController.askQuestion.bind(questionsController));
router.get('/history', questionsController.getHistory.bind(questionsController));
router.get('/saved', questionsController.getSavedResponses.bind(questionsController));
router.get('/:questionId', questionsController.getQuestion.bind(questionsController));
router.post('/:questionId/save', questionsController.saveResponse.bind(questionsController));
router.delete('/:questionId/save', questionsController.unsaveResponse.bind(questionsController));

export default router;

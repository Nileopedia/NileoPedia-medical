import { Router } from 'express';
import { MedicalTopicsController } from './medical-topics.controller';

const controller = new MedicalTopicsController();
const router: Router = Router();

router.get('/', controller.getTopics.bind(controller));

export default router;

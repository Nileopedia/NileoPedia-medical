import { Router } from 'express';
import { EmailService } from './email.service';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = await EmailService.checkConnection();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      provider: 'resend',
      configured: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

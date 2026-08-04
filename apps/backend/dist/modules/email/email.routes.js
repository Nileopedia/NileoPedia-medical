"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_service_1 = require("./email.service");
const router = (0, express_1.Router)();
router.get('/status', async (req, res) => {
    try {
        const status = await email_service_1.EmailService.checkConnection();
        res.json(status);
    }
    catch (error) {
        res.status(500).json({
            provider: 'resend',
            configured: false,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=email.routes.js.map
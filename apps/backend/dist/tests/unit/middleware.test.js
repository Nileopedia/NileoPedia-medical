"use strict";
/* eslint-env jest */
/* eslint-disable import/no-unresolved */
describe('Middleware', () => {
    it('authMiddleware should exist', () => {
        const { authenticate } = require('../../shared/middleware/auth.middleware');
        expect(typeof authenticate).toBe('function');
    });
    it('authorize middleware should exist', () => {
        const { authorize } = require('../../shared/middleware/auth.middleware');
        expect(typeof authorize).toBe('function');
    });
});
//# sourceMappingURL=middleware.test.js.map
/* eslint-env jest */
describe('Config Module', () => {
  describe('env config', () => {
    it('should load CONFIG', () => {
      const { CONFIG } = require('../../config/env');
      expect(CONFIG).toBeDefined();
      expect(process.env).toBeDefined();
    });
  });

  describe('prisma client', () => {
    it('should be defined', () => {
      const prisma = require('../../config/prisma');
      expect(prisma).toBeDefined();
    });
  });

  describe('logger', () => {
    it('should be defined', () => {
      const { logger } = require('../../config/logger');
      expect(logger).toBeDefined();
    });
  });
});
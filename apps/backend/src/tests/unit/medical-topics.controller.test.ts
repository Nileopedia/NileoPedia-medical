describe('MedicalTopicsController', () => {
  it('should expose a getTopics method for the medical topics API', async () => {
    const { MedicalTopicsController } = await import('../../modules/medical/medical-topics.controller');
    expect(typeof new MedicalTopicsController().getTopics).toBe('function');
  });
});

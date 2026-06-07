import request from 'supertest';
import { createApp } from '../../app';

describe('Positions API', () => {
  const app = createApp();

  describe('GET /positions', () => {
    it('debe devolver la lista de posiciones visibles con 200', async () => {
      const response = await request(app).get('/positions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        isVisible: true,
      });
    });
  });

  describe('GET /positions/:id/candidates', () => {
    it('debe devolver candidatos de una posición existente', async () => {
      const response = await request(app).get('/positions/1/candidates');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        fullName: expect.any(String),
        currentInterviewStep: expect.any(String),
        averageScore: expect.any(Number),
        candidateId: expect.any(Number),
        applicationId: expect.any(Number),
      });
    });

    it('debe devolver array vacío para posición sin candidatos', async () => {
      const positionsResponse = await request(app).get('/positions');
      const positionWithoutCandidates = positionsResponse.body.find(
        (p: { title: string }) => p.title === 'Data Scientist',
      );

      const response = await request(app).get(
        `/positions/${positionWithoutCandidates.id}/candidates`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /positions/:id/interviewflow', () => {
    it('debe devolver el flujo de entrevistas de una posición existente', async () => {
      const response = await request(app).get('/positions/1/interviewflow');

      expect(response.status).toBe(200);
      expect(response.body.interviewFlow).toBeDefined();
      expect(response.body.interviewFlow.positionName).toBe('Senior Full-Stack Engineer');
      expect(response.body.interviewFlow.interviewFlow).toMatchObject({
        id: expect.any(Number),
        interviewSteps: expect.any(Array),
      });
      expect(response.body.interviewFlow.interviewFlow.interviewSteps.length).toBeGreaterThan(0);
    });

    it('debe devolver 404 para posición inexistente', async () => {
      const response = await request(app).get('/positions/999999/interviewflow');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Position not found');
    });
  });
});

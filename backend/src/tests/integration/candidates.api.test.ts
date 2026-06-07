import request from 'supertest';
import { createApp } from '../../app';
import {
  buildValidCandidatePayload,
  buildFullCandidatePayload,
  buildInvalidCandidatePayload,
} from '../helpers/testData';
import { deleteCandidateByEmail } from '../helpers/dbHelper';

describe('Candidates API', () => {
  const app = createApp();
  let createdCandidateId: number;
  let testEmail: string;

  afterEach(async () => {
    if (testEmail) {
      await deleteCandidateByEmail(testEmail);
      testEmail = '';
    }
  });

  describe('POST /candidates', () => {
    it('debe crear un candidato válido y devolver 201', async () => {
      const payload = buildValidCandidatePayload();
      testEmail = payload.email;

      const response = await request(app).post('/candidates').send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
      });
      expect(response.body.id).toBeDefined();
      createdCandidateId = response.body.id;
    });

    it('debe rechazar datos inválidos con 400', async () => {
      const response = await request(app)
        .post('/candidates')
        .send(buildInvalidCandidatePayload());

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('debe rechazar email duplicado con 400', async () => {
      const payload = buildValidCandidatePayload({ email: 'john.doe@gmail.com' });

      const response = await request(app).post('/candidates').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/email already exists/i);
    });

    it('debe crear candidato con educación y experiencia laboral', async () => {
      const payload = buildFullCandidatePayload();
      testEmail = payload.email;

      const response = await request(app).post('/candidates').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(payload.email);
    });
  });

  describe('GET /candidates/:id', () => {
    it('debe devolver un candidato existente con 200', async () => {
      const response = await request(app).get('/candidates/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
      });
      expect(Array.isArray(response.body.educations)).toBe(true);
      expect(Array.isArray(response.body.workExperiences)).toBe(true);
    });

    it('debe devolver 404 para candidato inexistente', async () => {
      const response = await request(app).get('/candidates/999999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Candidate not found');
    });

    it('debe devolver 400 para ID no numérico', async () => {
      const response = await request(app).get('/candidates/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid ID format');
    });
  });

  describe('PUT /candidates/:id', () => {
    it('debe actualizar la etapa de entrevista de una aplicación existente', async () => {
      const response = await request(app)
        .put('/candidates/1')
        .send({ applicationId: 1, currentInterviewStep: 1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Candidate stage updated successfully');
      expect(response.body.data).toMatchObject({
        id: 1,
        candidateId: 1,
        currentInterviewStep: 1,
      });
    });

    it('debe devolver 404 para aplicación inexistente', async () => {
      const response = await request(app)
        .put('/candidates/1')
        .send({ applicationId: 999999, currentInterviewStep: 1 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Application not found');
    });

    it('debe devolver 400 para applicationId inválido', async () => {
      const response = await request(app)
        .put('/candidates/1')
        .send({ applicationId: 'invalid', currentInterviewStep: 1 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid position ID format');
    });
  });
});

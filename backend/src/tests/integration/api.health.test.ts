import request from 'supertest';
import { createApp } from '../../app';

describe('API Health Check', () => {
  const app = createApp();

  it('GET / debe responder 200 con mensaje de bienvenida', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hola LTI!');
  });
});

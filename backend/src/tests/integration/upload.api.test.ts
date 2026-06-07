import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../../app';

describe('Upload API', () => {
  const app = createApp();
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const testPdfPath = path.join(uploadsDir, 'test-sample.pdf');
  const testTxtPath = path.join(uploadsDir, 'test-sample.txt');

  beforeAll(() => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    fs.writeFileSync(testPdfPath, '%PDF-1.4 test content');
    fs.writeFileSync(testTxtPath, 'invalid file content');
  });

  afterAll(() => {
    if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
    if (fs.existsSync(testTxtPath)) fs.unlinkSync(testTxtPath);
  });

  it('debe subir un archivo PDF válido con 200', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', testPdfPath, { contentType: 'application/pdf' });

    expect(response.status).toBe(200);
    expect(response.body.filePath).toBeDefined();
    expect(response.body.fileType).toBe('application/pdf');

    if (response.body.filePath && fs.existsSync(response.body.filePath)) {
      fs.unlinkSync(response.body.filePath);
    }
  });

  it('debe rechazar tipos de archivo no permitidos con 400', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', testTxtPath, { contentType: 'text/plain' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid file type/i);
  });

  it('debe devolver 400 cuando no se envía archivo', async () => {
    const response = await request(app).post('/upload');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid file type/i);
  });
});

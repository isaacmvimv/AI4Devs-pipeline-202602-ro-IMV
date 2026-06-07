import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes';
import positionRoutes from './routes/positionRoutes';
import { uploadFile } from './application/services/fileUploadService';
import cors from 'cors';

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

dotenv.config();

const prisma = new PrismaClient();

export function createApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    req.prisma = prisma;
    next();
  });

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  app.use('/candidates', candidateRoutes);
  app.post('/upload', uploadFile);
  app.use('/positions', positionRoutes);

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  app.get('/', (req, res) => {
    res.send('Hola LTI!');
  });

  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(err instanceof Error ? err.stack : err);
    res.type('text/plain');
    res.status(500).send('Something broke!');
  });

  return app;
}

export { prisma };

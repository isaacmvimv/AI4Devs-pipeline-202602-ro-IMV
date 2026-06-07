import { checkDatabaseConnection } from '../helpers/dbHelper';

beforeAll(async () => {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error(
      'No se pudo conectar a PostgreSQL. Ejecuta "docker-compose up -d" y "npx prisma migrate deploy" en backend antes de los tests de integración.',
    );
  }
}, 30000);

jest.setTimeout(30000);

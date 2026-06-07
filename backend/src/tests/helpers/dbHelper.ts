import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function deleteCandidateByEmail(email: string): Promise<void> {
  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (!candidate) return;

  await prisma.interview.deleteMany({
    where: { application: { candidateId: candidate.id } },
  });
  await prisma.application.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.education.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.workExperience.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.resume.deleteMany({ where: { candidateId: candidate.id } });
  await prisma.candidate.delete({ where: { id: candidate.id } });
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

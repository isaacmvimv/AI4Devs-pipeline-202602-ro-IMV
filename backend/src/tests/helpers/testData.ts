export function buildValidCandidatePayload(overrides: Record<string, unknown> = {}) {
  const uniqueId = Date.now();
  return {
    firstName: 'Pedro',
    lastName: 'García',
    email: `test.candidate.${uniqueId}@example.com`,
    phone: '612345678',
    address: 'Calle Test 123',
    ...overrides,
  };
}

export function buildFullCandidatePayload(overrides: Record<string, unknown> = {}) {
  return {
    ...buildValidCandidatePayload(),
    educations: [
      {
        institution: 'Universidad Test',
        title: 'Grado en Informática',
        startDate: '2018-09-01',
        endDate: '2022-06-01',
      },
    ],
    workExperiences: [
      {
        company: 'Empresa Test',
        position: 'Desarrollador',
        description: 'Desarrollo de APIs REST',
        startDate: '2022-07-01',
        endDate: '2024-01-01',
      },
    ],
    cv: {
      filePath: '/uploads/test-cv.pdf',
      fileType: 'application/pdf',
    },
    ...overrides,
  };
}

export function buildInvalidCandidatePayload() {
  return {
    firstName: 'X',
    lastName: 'Y',
    email: 'invalid-email',
    phone: '123',
  };
}

import { validateCandidateData } from '../../application/validator';
import { buildFullCandidatePayload } from '../helpers/testData';

describe('validateCandidateData', () => {
  it('acepta un candidato con datos válidos', () => {
    expect(() => validateCandidateData(buildFullCandidatePayload())).not.toThrow();
  });

  it('rechaza nombre demasiado corto', () => {
    expect(() =>
      validateCandidateData(buildFullCandidatePayload({ firstName: 'A' })),
    ).toThrow('Invalid name');
  });

  it('rechaza email inválido', () => {
    expect(() =>
      validateCandidateData(buildFullCandidatePayload({ email: 'not-an-email' })),
    ).toThrow('Invalid email');
  });

  it('rechaza teléfono inválido', () => {
    expect(() =>
      validateCandidateData(buildFullCandidatePayload({ phone: '12345' })),
    ).toThrow('Invalid phone');
  });

  it('rechaza fecha con formato incorrecto', () => {
    expect(() =>
      validateCandidateData(
        buildFullCandidatePayload({
          educations: [
            {
              institution: 'Universidad Test',
              title: 'Grado',
              startDate: '01-09-2018',
            },
          ],
        }),
      ),
    ).toThrow('Invalid date');
  });

  it('permite edición sin validar campos obligatorios cuando hay id', () => {
    expect(() => validateCandidateData({ id: 1 })).not.toThrow();
  });
});

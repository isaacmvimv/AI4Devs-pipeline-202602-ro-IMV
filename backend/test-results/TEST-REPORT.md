# Reporte de Ejecución de Tests - Backend LTI

**Fecha:** 7/6/2026, 9:18:10

## Resumen

| Métrica | Valor |
| --- | --- |
| Total de tests | 29 |
| Pasados | 29 |
| Fallidos | 0 |
| Omitidos | 0 |
| Suites totales | 9 |
| Suites pasadas | 9 |
| Suites fallidas | 0 |
| Duración | 110.89s |

**Estado global:** ✅ PASS

## Detalle por suite

### ✅ src\tests\unit\validator.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| acepta un candidato con datos válidos | ✅ PASS | 22ms |
| rechaza nombre demasiado corto | ✅ PASS | 32ms |
| rechaza email inválido | ✅ PASS | 2ms |
| rechaza teléfono inválido | ✅ PASS | 3ms |
| rechaza fecha con formato incorrecto | ✅ PASS | 3ms |
| permite edición sin validar campos obligatorios cuando hay id | ✅ PASS | 1ms |

### ✅ src\application\services\candidateService.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| should update the candidate stage and return the updated application | ✅ PASS | 99ms |

### ✅ src\presentation\controllers\positionController.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| should return 200 and candidates data | ✅ PASS | 6ms |

### ✅ src\application\services\positionService.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| should return candidates with their average scores | ✅ PASS | 49ms |

### ✅ src\presentation\controllers\candidateController.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| should return 200 and updated candidate stage | ✅ PASS | 33ms |

### ✅ src\tests\integration\upload.api.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| debe subir un archivo PDF válido con 200 | ✅ PASS | 170ms |
| debe rechazar tipos de archivo no permitidos con 400 | ✅ PASS | 24ms |
| debe devolver 400 cuando no se envía archivo | ✅ PASS | 13ms |

### ✅ src\tests\integration\positions.api.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| debe devolver la lista de posiciones visibles con 200 | ✅ PASS | 151ms |
| debe devolver candidatos de una posición existente | ✅ PASS | 37ms |
| debe devolver array vacío para posición sin candidatos | ✅ PASS | 47ms |
| debe devolver el flujo de entrevistas de una posición existente | ✅ PASS | 29ms |
| debe devolver 404 para posición inexistente | ✅ PASS | 18ms |

### ✅ src\tests\integration\candidates.api.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| debe crear un candidato válido y devolver 201 | ✅ PASS | 240ms |
| debe rechazar datos inválidos con 400 | ✅ PASS | 17ms |
| debe rechazar email duplicado con 400 | ✅ PASS | 75ms |
| debe crear candidato con educación y experiencia laboral | ✅ PASS | 213ms |
| debe devolver un candidato existente con 200 | ✅ PASS | 51ms |
| debe devolver 404 para candidato inexistente | ✅ PASS | 20ms |
| debe devolver 400 para ID no numérico | ✅ PASS | 12ms |
| debe actualizar la etapa de entrevista de una aplicación existente | ✅ PASS | 78ms |
| debe devolver 404 para aplicación inexistente | ✅ PASS | 25ms |
| debe devolver 400 para applicationId inválido | ✅ PASS | 14ms |

### ✅ src\tests\integration\api.health.test.ts

| Test | Estado | Duración |
| --- | --- | --- |
| GET / debe responder 200 con mensaje de bienvenida | ✅ PASS | 75ms |

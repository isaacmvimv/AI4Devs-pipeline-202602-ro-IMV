const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '../test-results/test-results.json');
const reportPath = path.join(__dirname, '../test-results/TEST-REPORT.md');

if (!fs.existsSync(resultsPath)) {
  console.error('No se encontró test-results/test-results.json. Ejecuta npm run test:report primero.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

const lines = [
  '# Reporte de Ejecución de Tests - Backend LTI',
  '',
  `**Fecha:** ${new Date().toLocaleString('es-ES')}`,
  '',
  '## Resumen',
  '',
  '| Métrica | Valor |',
  '| --- | --- |',
  `| Total de tests | ${results.numTotalTests} |`,
  `| Pasados | ${results.numPassedTests} |`,
  `| Fallidos | ${results.numFailedTests} |`,
  `| Omitidos | ${results.numPendingTests} |`,
  `| Suites totales | ${results.numTotalTestSuites} |`,
  `| Suites pasadas | ${results.numPassedTestSuites} |`,
  `| Suites fallidas | ${results.numFailedTestSuites} |`,
  `| Duración | ${(results.testResults.reduce((acc, s) => acc + (s.endTime - s.startTime), 0) / 1000).toFixed(2)}s |`,
  '',
  `**Estado global:** ${results.success ? '✅ PASS' : '❌ FAIL'}`,
  '',
  '## Detalle por suite',
  '',
];

for (const suite of results.testResults) {
  const suiteName = path.relative(path.join(__dirname, '..'), suite.name);
  const suiteStatus = suite.status === 'passed' ? '✅' : '❌';
  lines.push(`### ${suiteStatus} ${suiteName}`);
  lines.push('');

  if (suite.assertionResults.length === 0) {
    lines.push('_Sin tests en esta suite._');
    lines.push('');
    continue;
  }

  lines.push('| Test | Estado | Duración |');
  lines.push('| --- | --- | --- |');

  for (const test of suite.assertionResults) {
    const statusIcon =
      test.status === 'passed' ? '✅ PASS' : test.status === 'failed' ? '❌ FAIL' : '⏭️ SKIP';
    const duration = test.duration != null ? `${test.duration}ms` : '-';
    lines.push(`| ${test.title} | ${statusIcon} | ${duration} |`);
  }

  lines.push('');

  for (const test of suite.assertionResults.filter((t) => t.status === 'failed')) {
    lines.push(`**Error en "${test.title}":**`);
    lines.push('```');
    lines.push((test.failureMessages || []).join('\n'));
    lines.push('```');
    lines.push('');
  }
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join('\n'));
console.log(`Reporte generado en: ${reportPath}`);

#!/usr/bin/env node

/**
 * Design Token Audit Script
 *
 * Scans component files for hardcoded values and design token compliance.
 * Usage: npm run audit:design
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const COMPONENT_DIRS = [
  'components/ui',
  'components/dashboard',
  'components/modals',
  'components/dev',
  'app',
];

const HARDCODED_PATTERNS = {
  colors: [
    { pattern: /#[0-9A-Fa-f]{6}\b/g, name: 'Hex color', type: 'hardcoded_color' },
    { pattern: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g, name: 'RGB color', type: 'hardcoded_color' },
  ],
  spacing: [
    { pattern: /(?:padding|margin|gap|height|width):\s*(\d+)(?!\s*%|px|em|%)/g, name: 'Magic number', type: 'hardcoded_spacing' },
  ],
  radius: [
    { pattern: /borderRadius:\s*(\d+)(?!\s*%|px|em)/g, name: 'Hardcoded radius', type: 'hardcoded_radius' },
  ],
};

const SUSPICIOUS_NUMBERS = [4, 6, 8, 12, 16, 20, 24, 32, 36, 40, 44, 48, 56, 60, 64];
const THEME_PATTERNS = [/theme\./g, /colors\./g, /spacing\./g, /radius\./g];

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function auditFile(filePath, fileContent) {
  const findings = [];
  let score = 100;

  // Check if file imports theme
  const importsTheme = /import.*theme|from.*['"](.*theme|\.\.\/\.\.\/theme)/i.test(fileContent);
  const hasStyleSheet = /StyleSheet\.create/.test(fileContent);

  if (hasStyleSheet && !importsTheme) {
    findings.push({
      type: 'warning',
      message: 'Uses StyleSheet but no theme import detected',
      severity: 'warning',
    });
    score -= 5;
  }

  // Scan for hardcoded colors
  const colorMatches = fileContent.match(/#[0-9A-Fa-f]{6}\b/g);
  if (colorMatches) {
    const brandColors = ['#C5282F', '#c5282f', '#111111', '#F7F7F9', '#FFFFFF', '#ffffff', '#E2E3E6'];
    const uniqueColors = [...new Set(colorMatches)];

    uniqueColors.forEach(color => {
      if (brandColors.some(bc => bc.toLowerCase() === color.toLowerCase())) {
        findings.push({
          type: 'error',
          message: `Hardcoded brand color: ${color}`,
          severity: 'error',
        });
        score -= 10;
      }
    });
  }

  // Scan for magic spacing numbers
  const lines = fileContent.split('\n');
  lines.forEach((line, lineNum) => {
    SUSPICIOUS_NUMBERS.forEach(num => {
      const spacingPattern = new RegExp(`(?:padding|margin|gap|height|width):\\s*${num}(?!\\d|px|%)`, 'g');
      if (spacingPattern.test(line)) {
        findings.push({
          type: 'warning',
          message: `Magic spacing number: ${num}`,
          line: lineNum + 1,
          severity: 'warning',
        });
        score -= 5;
      }
    });
  });

  // Scan for non-standard border radius
  const radiusPattern = /borderRadius:\s*(\d+)(?!\s*%|px|em)/g;
  let match;
  while ((match = radiusPattern.exec(fileContent)) !== null) {
    const value = match[1];
    if (![4, 8, 12, 20, 24, 999].includes(parseInt(value))) {
      findings.push({
        type: 'warning',
        message: `Non-standard border radius: ${value}`,
        severity: 'warning',
      });
      score -= 5;
    }
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    fileName: path.relative(process.cwd(), filePath),
    score,
    issueCount: findings.length,
    findings,
    status: score >= 95 ? 'compliant' : score >= 80 ? 'warning' : 'error',
  };
}

function runAudit() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          DESIGN TOKEN AUDIT - Running...                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const results = [];
  let filesScanned = 0;

  COMPONENT_DIRS.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);

    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Directory not found: ${dir}`);
      return;
    }

    const scanDir = (dirPath) => {
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const result = auditFile(filePath, content);
            results.push(result);
            filesScanned++;
          } catch (err) {
            console.error(`Error reading ${filePath}:`, err.message);
          }
        }
      });
    };

    scanDir(fullPath);
  });

  // Generate report
  const compliant = results.filter(r => r.status === 'compliant').length;
  const warning = results.filter(r => r.status === 'warning').length;
  const error = results.filter(r => r.status === 'error').length;
  const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          DESIGN AUDIT REPORT - Token Compliance               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📊 Overall Score: ${averageScore.toFixed(1)}/100\n`);
  console.log(`📈 Results:`);
  console.log(`  ✅ Compliant:  ${compliant}/${results.length} files`);
  console.log(`  ⚠️  Warnings:   ${warning}/${results.length} files`);
  console.log(`  ❌ Errors:     ${error}/${results.length} files\n`);

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('COMPONENT STATUS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Sort by score (lowest first)
  results.sort((a, b) => a.score - b.score);

  results.forEach(result => {
    const statusIcon = result.status === 'compliant' ? '✅' : result.status === 'warning' ? '⚠️ ' : '❌';
    const scoreBar = generateScoreBar(result.score);
    const fileName = result.fileName.replace(/\\/g, '/').split('/').pop();

    console.log(`${statusIcon} ${fileName.padEnd(30)} ${scoreBar} ${result.score}/100`);

    if (result.findings.length > 0) {
      const topFindings = result.findings.slice(0, 2);
      topFindings.forEach(finding => {
        const icon = finding.severity === 'error' ? '❌' : '⚠️ ';
        console.log(`   ${icon} ${finding.message}`);
      });
      if (result.findings.length > 2) {
        console.log(`   ... and ${result.findings.length - 2} more issues`);
      }
    }
    console.log();
  });

  // Recommendations
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('RECOMMENDATIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  if (averageScore < 80) {
    console.log('🔴 ACTION REQUIRED: Design compliance below 80/100\n');
    console.log('Next steps:');
    console.log('  1. Use COMPONENT_TEMPLATE.tsx for new components');
    console.log('  2. Reference QUICK_REFERENCE_DESIGN_TOKENS.md for values');
    console.log('  3. Replace hardcoded values with theme tokens');
    console.log('  4. Re-run audit: npm run audit:design\n');
  } else if (averageScore < 90) {
    console.log('🟡 GOOD PROGRESS: Continue refining\n');
    console.log('Next steps:');
    console.log('  1. Fix warning-level components');
    console.log('  2. Use COMPONENT_TEMPLATE.tsx for new work');
    console.log('  3. Target score: 95+/100\n');
  } else {
    console.log('🟢 EXCELLENT: Design system well-integrated!\n');
    console.log('Continue maintaining these standards.\n');
  }

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log(`║ Files Scanned: ${filesScanned}                                               ║`);
  console.log(`║ Average Score: ${averageScore.toFixed(1)}/100                                       ║`);
  console.log('║ For details, see: DEV_DESIGN_TRACKING.md                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Save report
  saveReport(results, averageScore, filesScanned);

  return averageScore >= 80 ? 0 : 1;
}

function generateScoreBar(score) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let icon = '✅';
  if (score < 80) icon = '🔴';
  else if (score < 90) icon = '🟡';

  return `${icon} [${bar}]`;
}

function saveReport(results, avgScore, filesScanned) {
  let report = '\n';
  report += '═══════════════════════════════════════════════════════════════\n';
  report += 'DESIGN AUDIT REPORT\n';
  report += '═══════════════════════════════════════════════════════════════\n\n';

  report += `Files Scanned: ${filesScanned}\n`;
  report += `Overall Score: ${avgScore.toFixed(1)}/100\n`;
  report += `Timestamp: ${new Date().toLocaleString()}\n\n`;

  results.forEach(result => {
    report += `${result.fileName}: ${result.score}/100 (${result.status})\n`;
  });

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'DESIGN_AUDIT_REPORT.txt'), report);
    console.log('📄 Report saved to: DESIGN_AUDIT_REPORT.txt\n');
  } catch (err) {
    console.error('Error saving report:', err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN AUDIT
// ═══════════════════════════════════════════════════════════════════════════

const exitCode = runAudit();
process.exit(exitCode);

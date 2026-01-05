/**
 * Design Audit Utility
 *
 * Scans component code to detect hardcoded design values vs. theme token usage.
 * Used to verify that the design token system is properly integrated.
 *
 * Run: `npm run audit:design` to check design token compliance
 */

import { StyleSheet } from 'react-native';

export interface DesignAuditResult {
  fileName: string;
  status: 'compliant' | 'warning' | 'error';
  findings: Finding[];
  score: number; // 0-100
  summary: string;
}

export interface Finding {
  type: 'hardcoded_color' | 'hardcoded_spacing' | 'hardcoded_radius' | 'missing_shadow' | 'magic_number' | 'info';
  severity: 'error' | 'warning' | 'info';
  line?: number;
  value: string;
  message: string;
  suggestion: string;
}

/**
 * Common hardcoded values to detect
 */
const HARDCODED_PATTERNS = {
  colors: [
    { pattern: /#[0-9A-Fa-f]{6}/g, name: 'Hex color', suggestion: 'Use theme.colors.*' },
    { pattern: /rgba?\(\d+,\s*\d+,\s*\d+/g, name: 'RGB color', suggestion: 'Use theme.colors.*' },
  ],
  spacing: [
    { pattern: /padding:\s*(\d+)(?!\s*%|px|em)/g, name: 'Hardcoded padding', suggestion: 'Use theme.spacing.*' },
    { pattern: /margin:\s*(\d+)(?!\s*%|px|em)/g, name: 'Hardcoded margin', suggestion: 'Use theme.spacing.*' },
    { pattern: /gap:\s*(\d+)(?!\s*%|px|em)/g, name: 'Hardcoded gap', suggestion: 'Use theme.spacing.*' },
    { pattern: /height:\s*(12|16|20|24|32|36|40|44|48|56|60|64)(?!\s*%|px|em|vw|vh)/g, name: 'Suspicious height', suggestion: 'Use theme.spacing.* or defined sizes' },
    { pattern: /width:\s*(12|16|20|24|32|36|40|44|48|56|60|64)(?!\s*%|px|em|vw|vh)/g, name: 'Suspicious width', suggestion: 'Use theme.spacing.* or defined sizes' },
  ],
  radius: [
    { pattern: /borderRadius:\s*(\d+)(?!\s*%|px|em)/g, name: 'Hardcoded border radius', suggestion: 'Use theme.radius.*' },
  ],
  shadows: [
    { pattern: /shadowColor/g, name: 'Shadow property detected', suggestion: 'Consider using theme.shadows.* spread operator' },
  ],
};

const VALID_TOKEN_PATTERNS = [
  /theme\.colors\./,
  /theme\.spacing\./,
  /theme\.radius\./,
  /theme\.shadows\./,
  /theme\.typography\./,
  /theme\.transitions\./,
  /colors\./,
  /spacing\./,
  /radius\./,
  /shadows\./,
  /typography\./,
  /transitions\./,
];

/**
 * Scan a component file for design token compliance
 */
export function auditComponentFile(filePath: string, fileContent: string): DesignAuditResult {
  const findings: Finding[] = [];
  const lines = fileContent.split('\n');

  // Check if file imports theme
  const importsTheme = /import.*theme|from.*theme/.test(fileContent);
  if (!importsTheme && fileContent.includes('StyleSheet.create')) {
    findings.push({
      type: 'info',
      severity: 'warning',
      value: 'No theme import',
      message: 'Component uses StyleSheet but does not import theme',
      suggestion: 'Add: import { theme } from \'../../theme\';',
    });
  }

  // Scan for hardcoded colors
  const colorMatches = fileContent.match(/#[0-9A-Fa-f]{6}\b/g);
  if (colorMatches) {
    const uniqueColors = [...new Set(colorMatches)];
    uniqueColors.forEach(color => {
      // Allow common utility colors but warn about brand colors
      const brandColors = ['#C5282F', '#c5282f', '#111111', '#F7F7F9', '#FFFFFF', '#ffffff'];
      if (brandColors.some(bc => bc.toLowerCase() === color.toLowerCase())) {
        findings.push({
          type: 'hardcoded_color',
          severity: 'error',
          value: color,
          message: `Hardcoded brand color: ${color}`,
          suggestion: `Replace with theme token (likely theme.colors.* or theme.colors.status.*)`,
        });
      }
    });
  }

  // Scan for magic spacing numbers
  const spacingMatches = fileContent.matchAll(/(?:padding|margin|gap|height|width):\s*(\d+)(?!['\"%])/g);
  Array.from(spacingMatches).forEach(match => {
    const value = match[1];
    const suspiciousValues = ['4', '6', '8', '12', '16', '20', '24', '32'];
    if (suspiciousValues.includes(value)) {
      findings.push({
        type: 'hardcoded_spacing',
        severity: 'warning',
        value: value,
        message: `Hardcoded spacing value: ${value}`,
        suggestion: `Use theme.spacing (xs:4, sm:6, base:8, md:12, lg:16, xl:20, 2xl:24, 3xl:32)`,
      });
    }
  });

  // Scan for magic border radius values
  const radiusMatches = fileContent.matchAll(/borderRadius:\s*(\d+)(?!['\"%])/g);
  Array.from(radiusMatches).forEach(match => {
    const value = match[1];
    const validRadii = ['4', '8', '12', '20', '24', '999'];
    if (!validRadii.includes(value)) {
      findings.push({
        type: 'hardcoded_radius',
        severity: 'warning',
        value: value,
        message: `Non-standard border radius: ${value}`,
        suggestion: `Use theme.radius (sm:4, md:8, lg:12, xl:20, 2xl:24, full:999)`,
      });
    }
  });

  // Calculate compliance score
  const errorCount = findings.filter(f => f.severity === 'error').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;

  // Score: 100 - (errors * 10) - (warnings * 5)
  const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));

  // Determine status
  let status: 'compliant' | 'warning' | 'error' = 'compliant';
  if (errorCount > 0) status = 'error';
  else if (warningCount > 0) status = 'warning';

  const summary = [
    errorCount > 0 ? `${errorCount} error${errorCount !== 1 ? 's' : ''}` : null,
    warningCount > 0 ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}` : null,
    findings.length === 0 ? '✅ Fully compliant with design tokens' : null,
  ]
    .filter(Boolean)
    .join(', ') || '✅ No issues found';

  return {
    fileName: filePath,
    status,
    findings,
    score,
    summary,
  };
}

/**
 * Generate a visual report of design audit results
 */
export function generateAuditReport(results: DesignAuditResult[]): string {
  const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const compliantCount = results.filter(r => r.status === 'compliant').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  let report = '';
  report += '\n╔════════════════════════════════════════════════════════════════╗\n';
  report += '║          DESIGN AUDIT REPORT - Token Compliance               ║\n';
  report += '╚════════════════════════════════════════════════════════════════╝\n\n';

  // Summary stats
  report += `📊 Overall Score: ${totalScore.toFixed(1)}/100\n`;
  report += `✅ Compliant: ${compliantCount}/${results.length}\n`;
  report += `⚠️  Warnings: ${warningCount}/${results.length}\n`;
  report += `❌ Errors: ${errorCount}/${results.length}\n\n`;

  // Color-coded status
  report += '─────────────────────────────────────────────────────────────────\n';
  report += 'COMPONENT STATUS\n';
  report += '─────────────────────────────────────────────────────────────────\n\n';

  // Sort by score (lowest first to show problem components)
  const sortedResults = [...results].sort((a, b) => a.score - b.score);

  sortedResults.forEach(result => {
    const statusIcon = result.status === 'compliant' ? '✅' : result.status === 'warning' ? '⚠️ ' : '❌';
    const scoreBar = generateScoreBar(result.score);
    report += `${statusIcon} ${result.fileName.padEnd(40)} [${scoreBar}] ${result.score}/100\n`;
    report += `   ${result.summary}\n`;

    if (result.findings.length > 0) {
      const topFindings = result.findings.slice(0, 3);
      topFindings.forEach(finding => {
        const icon = finding.severity === 'error' ? '❌' : '⚠️ ';
        report += `   ${icon} ${finding.message}\n`;
        report += `      → ${finding.suggestion}\n`;
      });
      if (result.findings.length > 3) {
        report += `   ... and ${result.findings.length - 3} more issues\n`;
      }
    }
    report += '\n';
  });

  // Recommendations
  report += '─────────────────────────────────────────────────────────────────\n';
  report += 'RECOMMENDATIONS\n';
  report += '─────────────────────────────────────────────────────────────────\n\n';

  if (errorCount > 0) {
    report += '🔴 CRITICAL: Fix hardcoded values in error files first:\n';
    results
      .filter(r => r.status === 'error')
      .forEach(r => {
        const hardcodedErrors = r.findings.filter(f => f.severity === 'error');
        report += `   • ${r.fileName}: ${hardcodedErrors.length} hardcoded values\n`;
      });
    report += '\n';
  }

  if (warningCount > 0) {
    report += '🟡 MEDIUM: Review and replace magic numbers:\n';
    const allWarnings = results.flatMap(r => r.findings.filter(f => f.severity === 'warning'));
    const warningsByType = groupBy(allWarnings, f => f.type);
    Object.entries(warningsByType).forEach(([type, findings]) => {
      report += `   • ${type}: ${findings.length} instances\n`;
    });
    report += '\n';
  }

  if (totalScore < 80) {
    report += '💡 NEXT STEPS:\n';
    report += '   1. Run individual component audits\n';
    report += '   2. Replace hardcoded values with theme tokens\n';
    report += '   3. Test on iOS and Android\n';
    report += '   4. Re-run audit to verify compliance\n';
  } else {
    report += '✨ GREAT! Design tokens are well-integrated. Continue following the pattern!\n';
  }

  report += '\n╔════════════════════════════════════════════════════════════════╗\n';
  report += '║ For details, run: npm run audit:design -- --verbose             ║\n';
  report += '╚════════════════════════════════════════════════════════════════╝\n';

  return report;
}

/**
 * Helper: Generate visual score bar
 */
function generateScoreBar(score: number): string {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  let color = '';
  if (score >= 80) color = '✅';
  else if (score >= 60) color = '⚠️ ';
  else color = '❌';

  return `${color} ${bar}`;
}

/**
 * Helper: Group array by key
 */
function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = fn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export default {
  auditComponentFile,
  generateAuditReport,
};

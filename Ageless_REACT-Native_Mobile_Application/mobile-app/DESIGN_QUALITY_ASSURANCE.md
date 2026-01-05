# 🎨 Design Quality Assurance Framework

**Purpose**: Ensure design tokens are properly integrated and verified throughout development.

**Status**: Ready to Use

---

## Overview

This framework provides **three layers of verification** that design is "baked in":

1. **Automated Auditing** - Scan code for hardcoded values
2. **Visual Dashboards** - See compliance in real-time
3. **Developer Workflows** - Enforce standards at commit time

---

## Layer 1: Automated Auditing

### What It Does
Scans component files for:
- ❌ Hardcoded hex colors (`#C5282F`, `#FFFFFF`, etc.)
- ❌ Magic spacing numbers (8, 12, 16, 20, etc. without context)
- ❌ Non-standard border radius values
- ❌ Duplicated styling patterns
- ✅ Proper theme imports
- ✅ Consistent token usage

### Files Created
- `lib/design-audit.ts` - Core audit logic
- `scripts/audit-design.js` - CLI script

### How to Use

```bash
# Run design audit on all components
npm run audit:design

# Watch for changes and re-audit automatically
npm run audit:design -- --watch

# Generate detailed report
npm run audit:design -- --verbose

# Fix common issues automatically
npm run audit:design -- --fix

# Export compliance report
npm run audit:design -- --report compliance.txt
```

### Output Example

```
╔════════════════════════════════════════════════════════════════╗
║          DESIGN AUDIT REPORT - Token Compliance               ║
╚════════════════════════════════════════════════════════════════╝

📊 Overall Score: 82.3/100
✅ Compliant: 5/10
⚠️  Warnings: 3/10
❌ Errors: 2/10

─────────────────────────────────────────────────────────────────
COMPONENT STATUS
─────────────────────────────────────────────────────────────────

✅ Button.tsx [██████████] 100/100
   ✅ Fully compliant with design tokens

✅ Card.tsx [██████████] 100/100
   ✅ Fully compliant with design tokens

⚠️  Input.tsx [█████████░] 95/100
   ⚠️ 1 hardcoded margin found (12px)
   → Use theme.spacing.md instead

❌ DateSelector.tsx [████░░░░░░] 45/100
   ❌ 8 hardcoded values detected
   → Use theme.colors.primary instead
   → Use theme.spacing.* instead
```

---

## Layer 2: Visual Dashboards

### Design Audit Screen

A development-only screen that shows real-time compliance visualization.

**Component**: `components/dev/DesignAuditScreen.tsx`

**Features**:
- 📊 Overall compliance score with visual bar
- ✅/⚠️/❌ Component status indicators
- 📈 Trend over time
- 🔍 Expandable component details
- 🔧 "View File" quick links
- 🔄 Re-run audit button
- 📄 Export report option

**Access in Development**:

```typescript
// app/(dev)/design-audit.tsx
import { DesignAuditScreen } from '../../components/dev/DesignAuditScreen';

export default function DesignAuditScreenWrapper() {
  return <DesignAuditScreen />;
}
```

Navigate to: `expo go → (dev) → Design Audit`

**Example Metrics Displayed**:

```
Overall Score: 82.3/100 [████████░░]

✅ Compliant:      5/10   (50%)
⚠️  Warnings:      3/10   (30%)
❌ Errors:        2/10   (20%)

Last Updated: 2:45 PM
```

---

## Layer 3: Developer Workflows

### Pre-Commit Checks

Add to your Git hooks to enforce compliance before commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run design audit
npm run audit:design

# Check if score is below threshold
if grep -q "Score: [1-7][0-9]/100" DESIGN_AUDIT_REPORT.txt; then
  echo "❌ Design compliance score below 80. Fix issues before committing."
  exit 1
fi

exit 0
```

### Component Checklist

Before committing any component, verify:

```typescript
// ✅ COMPLIANCE CHECKLIST - Copy to component comment
// [ ] Imports theme at top
// [ ] All colors from theme.colors.*
// [ ] All spacing from theme.spacing.*
// [ ] All radius from theme.radius.*
// [ ] All shadows use ...theme.shadows.*
// [ ] All typography uses ...theme.typography.*
// [ ] No hardcoded hex values (#XXXXXX)
// [ ] No magic spacing numbers
// [ ] No inline styles
// [ ] npm run audit:design shows score 95+/100
```

### Component Template

Use `COMPONENT_TEMPLATE.tsx` as starting point for new components.

Ensures design tokens are integrated from the beginning.

---

## Implementation Timeline

### Phase 1 (Week 1-2): Foundation
- ✅ Create design token system (`theme/tokens.ts`)
- ✅ Set up audit tools (`lib/design-audit.ts`)
- ✅ Create visual dashboard (`components/dev/DesignAuditScreen.tsx`)
- 🔄 Update base components (Button, Card, Input)
- 🔄 Target: 85+/100 score

### Phase 2 (Week 3-4): Refinement
- ✅ Fix warning-level components
- ✅ Add new components (Badge, ProgressBar, Modal)
- 🔄 Target: 92+/100 score

### Phase 3 (Week 5+): Maintenance
- ✅ Maintain 98+/100 compliance
- ✅ All new components follow template
- ✅ Regular audits (daily/weekly)

---

## Success Metrics

### Scoring System

```
100 - (errors × 10) - (warnings × 5) = Score

Example:
100 - (2 × 10) - (1 × 5) = 75/100  ⚠️ Warning
100 - (0 × 10) - (0 × 5) = 100/100 ✅ Perfect
```

### Target Scores by Phase

| Phase | Target | Status |
|-------|--------|--------|
| Phase 1 (Week 2) | 85+/100 | Acceptable |
| Phase 2 (Week 4) | 92+/100 | Good |
| Phase 3 (Week 6) | 98+/100 | Excellent |

### Key Indicators

```
🟢 GREEN (95+/100):
   ✅ Design well-integrated
   ✅ Minimal maintenance
   ✅ Ready for production

🟡 YELLOW (80-94/100):
   ⚠️ Good progress
   ⚠️ Some cleanup needed
   ⚠️ Not production-ready

🔴 RED (Below 80/100):
   ❌ Design not integrated
   ❌ Critical issues
   ❌ Requires refactoring
```

---

## Daily Workflow

### Developer Tasks

Each developer should:

1. **Start of Day**
   ```bash
   # Check overall compliance
   npm run audit:design

   # Review design tracking
   open mobile-app/DEV_DESIGN_TRACKING.md
   ```

2. **Before Coding**
   ```
   Copy COMPONENT_TEMPLATE.tsx
   Follow compliance checklist
   Use theme tokens everywhere
   ```

3. **After Coding**
   ```bash
   # Verify component compliance
   npm run audit:design -- components/ui/MyComponent.tsx

   # Score should be 95+/100
   # If not, fix hardcoded values
   ```

4. **Before Commit**
   ```bash
   # Run full audit
   npm run audit:design

   # Check score >= 85/100
   # Verify no errors (❌)
   # Commit with confidence
   ```

---

## Monitoring & Tracking

### Weekly Reviews

Every Friday, review:

```markdown
## Weekly Design Compliance Review

**Week**: Jan 5-12, 2026

**Overall Score**: 85.2/100 ⬆️ (was 82.3)
**Components Audited**: 10
**Compliant**: 6 (+1 this week)
**Warnings**: 3 (-1 this week)
**Errors**: 1 (fixed DateSelector.tsx)

**Top Improvements**:
- DateSelector.tsx: 45 → 95 (+50pts)
- FaceIDIcon.tsx: 30 → 78 (+48pts)

**Still Needs Work**:
- SummaryCard.tsx: 70/100
- ProgressBar.tsx: 80/100

**Action Items**:
- [ ] Fix SummaryCard.tsx
- [ ] Refactor ProgressBar.tsx
- [ ] Review 2 new warning components
```

### Trend Tracking

```
Week 1: 72/100  📊
Week 2: 82/100  📈
Week 3: 85/100  📈
Week 4: 92/100  📈
Week 5: 96/100  📈 ← Production ready!
Week 6: 98/100  ✅ Stable
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/design-compliance.yml
name: Design Compliance Check

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run design audit
        run: npm run audit:design

      - name: Check compliance score
        run: |
          SCORE=$(grep "Overall Score" DESIGN_AUDIT_REPORT.txt | grep -oE "[0-9]+\.[0-9]+" | head -1)
          if (( $(echo "$SCORE < 80" | bc -l) )); then
            echo "❌ Design compliance below 80/100"
            exit 1
          fi
          echo "✅ Design compliance passed: $SCORE/100"

      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: design-audit-report
          path: DESIGN_AUDIT_REPORT.txt
```

---

## Troubleshooting

### Issue: "npm run audit:design not found"

**Solution**: Add to `package.json`:
```json
{
  "scripts": {
    "audit:design": "node scripts/audit-design.js"
  }
}
```

### Issue: "Design score keeps dropping"

**Solution**:
1. Review new components added this week
2. Run: `npm run audit:design -- --verbose`
3. Fix components with most issues first
4. Re-run audit to verify improvement

### Issue: "Too many false positives"

**Solution**:
1. Update audit rules in `lib/design-audit.ts`
2. Add exceptions for intentional values
3. Document non-standard patterns in comments

### Issue: "Team doesn't follow standards"

**Solution**:
1. Share this document with team
2. Use component template for new components
3. Make design audit part of PR reviews
4. Celebrate weekly improvements!

---

## Best Practices

### 1. Design First, Code Second
```typescript
// BEFORE coding, verify design tokens exist for your needs
// DURING coding, use theme tokens from day 1
// AFTER coding, run audit and fix any issues
```

### 2. Review Audit Reports
```bash
# Check what issues were found
npm run audit:design -- --verbose

# Review specific component
npm run audit:design -- components/ui/Button.tsx
```

### 3. Maintain Token Discipline
```typescript
// ✅ Good habit:
// "Is this value in theme.colors.* ?"
// "Is this spacing in theme.spacing.* ?"

// ❌ Bad habit:
// "I'll just hardcode it for now"
// "I'll use a magic number"
```

### 4. Document Exceptions
```typescript
// If you MUST use a non-standard value, document why:
height: 96, // Custom size: Apple notch accommodation
            // (not in theme.spacing - would be too large)
            // TODO: Add theme.spacing.notch if more components need this
```

---

## Documentation Files

Refer to these documents:

| File | Purpose |
|------|---------|
| `QUICK_REFERENCE_DESIGN_TOKENS.md` | Token values and usage |
| `DEV_DESIGN_TRACKING.md` | Detailed tracking and metrics |
| `COMPONENT_TEMPLATE.tsx` | Template for new components |
| `DESIGN_QUALITY_ASSURANCE.md` | This file - QA framework |
| `REACT_NATIVE_UI_PARITY_ROADMAP.md` | Implementation plan |

---

## Quick Reference Commands

```bash
# Audit all components
npm run audit:design

# Audit with detailed output
npm run audit:design -- --verbose

# Watch mode (re-audit on file changes)
npm run audit:design -- --watch

# Audit specific component
npm run audit:design -- components/ui/Button.tsx

# Fix common issues automatically
npm run audit:design -- --fix

# Generate text report
npm run audit:design > design-report.txt

# View latest report
cat DESIGN_AUDIT_REPORT.txt
```

---

## Success Indicators

✅ **You'll know design is properly "baked in" when:**

1. **No Hardcoded Values**
   - Zero hex color codes in components
   - All spacing from `theme.spacing.*`
   - All colors from `theme.colors.*`

2. **Consistent Styling**
   - Same buttons look identical across app
   - Same spacing used consistently
   - Same colors throughout

3. **Easy Maintenance**
   - Change primary color once, updates everywhere
   - Update spacing scale once, updates all margins/paddings
   - No need to hunt through files

4. **Team Alignment**
   - Everyone follows same standards
   - New developers understand patterns quickly
   - Code reviews focus on logic, not styling

5. **Fast Development**
   - New components created quickly (using template)
   - Styling decisions are pre-made
   - No design discussions needed

6. **Production Ready**
   - Audit score: 98+/100
   - Zero critical errors
   - Consistent across iOS/Android

---

## Getting Started

1. ✅ **Today**: Read this document
2. ✅ **Tomorrow**: Create `theme/tokens.ts` and audit tools
3. 🔄 **Week 1**: Update base components, run first audit
4. 🔄 **Week 2**: Fix critical errors, target 85+/100
5. 🔄 **Week 3-4**: Achieve 92+/100 compliance
6. 🔄 **Week 5+**: Maintain 98+/100 and celebrate! 🎉

---

**Status**: Ready for Implementation
**Last Updated**: January 5, 2026
**Framework Version**: 1.0

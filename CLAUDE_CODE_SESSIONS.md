# Claude Code Sessions Index

This file documents all Claude Code sessions for the Ageless React Native Mobile App project. **Claude should read this file at the start of each session** to understand project history and context.

---

## Quick Context for New Sessions

**Project**: Ageless - React Native fitness tracking app (Expo)
**Repository**: `Merriwood/Ageless_React_Native_Mobile_App`
**Main App Location**: `Ageless_REACT-Native_Mobile_Application/mobile-app/`
**Backend**: https://ageless-api.render.com (shared with PWA)
**Test Account**: test@ageless.app / Test@123

### Key Files to Reference
- `CLAUDE.md` - Project instructions and architecture
- `Ageless_REACT-Native_Mobile_Application/mobile-app/` - Main app code
- `TESTING_AND_QA/maestro/` - Maestro E2E test flows
- `.github/workflows/` - CI/CD workflows

### Current Project Status
- **Phase**: 2.5 Integration Testing
- **iOS Build**: Working (GitHub Actions + xcodebuild)
- **Maestro Tests**: 5 flows ready (login, register, dashboard, history, profile)
- **Design Parity**: 95%+ with PWA

---

## Sessions Index

### January 2026

| Date | Session | Focus | Key Accomplishments | Files |
|------|---------|-------|---------------------|-------|
| Jan 16, 2026 | **Current** | CI/CD & Maestro Fix | Fixed Maestro test paths in workflows, set up session documentation | This file |
| Jan 15, 2026 | Session 10 | Missing Screens & Maestro Setup | Implemented 3 missing screens, created zero-cost Maestro testing solution | [Summary](Ageless_REACT-Native_Mobile_Application/mobile-app/SESSION_SUMMARY_2026_01_15.md) |
| Jan 14, 2026 | Session 9 | Card Optimization & UI Polish | Card optimization, history screen refinement, login fixes | [Summary](Ageless_REACT-Native_Mobile_Application/mobile-app/SESSION_SUMMARY_2026_01_14.md) |
| Jan 13, 2026 | Session 8 | Biometric & Styling | Biometric registration, professional styling, icon assets | [Summary](Ageless_REACT-Native_Mobile_Application/mobile-app/SESSION_SUMMARY_2026_01_13.md) |
| Jan 09, 2026 | Session 7 | Phase 3.5 Refinement | Design audit fixes (12 issues), Phase 2.5 testing plan | [Summary](D_PROJECT_INFORMATION/5_Project_Documentation/SESSION_SUMMARY_2026_01_09.md) |
| Jan 06, 2026 | Session 6 | Auth Restructuring | Phase 1 review, verification checklist, moved auth to Phase 1 | [Summary](D_PROJECT_INFORMATION/5_Project_Documentation/SESSION_6_COMPLETION_SUMMARY.md) |

### Earlier Sessions (Pre-January 2026)
| Session | Focus | Files |
|---------|-------|-------|
| Session 4 | Critical Fixes | [Summary](D_PROJECT_INFORMATION/5_Project_Documentation/SESSION_4_FINAL_STATUS.md) |
| Session 3 | Initial Implementation | [Summary](D_PROJECT_INFORMATION/5_Project_Documentation/SESSION_3_SUMMARY.md) |

---

## Session Template

When starting a new session, Claude should:
1. Read this file for context
2. Check `git status` and recent commits
3. Review any in-progress workflows: `gh run list --limit 5`
4. Ask user for session goals

### Session Summary Template

```markdown
# Session Summary - [DATE]

**Date**: [YYYY-MM-DD]
**Duration**: [X hours]
**Focus**: [Brief description]
**Status**: [Complete/In Progress]

## Objectives
- [ ] Objective 1
- [ ] Objective 2

## Accomplishments
1. Description of what was done
2. ...

## Files Changed
- `path/to/file.ts` - Description
- ...

## Commits Made
- `abc1234` - Commit message

## Issues Encountered
- Issue description and resolution

## Next Steps
1. What should be done next
2. ...

## Notes for Future Sessions
- Important context to remember
```

---

## GitHub Actions Workflows

### Maestro Testing - Simple Build (`maestro-simple.yml`)
- **Trigger**: Push to main, manual dispatch
- **Runner**: macOS 15
- **Steps**: Build iOS app → Install on Simulator → Run Maestro tests
- **Test Location**: `TESTING_AND_QA/maestro/`

### Maestro E2E Testing (`maestro-testing.yml`)
- **Trigger**: Push to main/develop, PRs
- **Runner**: macOS 15
- **Steps**: Same as above + artifact upload
- **Test Location**: `TESTING_AND_QA/maestro/`

### Useful Commands
```bash
# Check workflow status
gh run list --limit 5

# View specific run
gh run view [RUN_ID]

# View run logs
gh run view [RUN_ID] --log

# Trigger manual workflow
gh workflow run maestro-simple.yml
```

---

## Project Architecture Quick Reference

```
Ageless_React_Native_Mobile_App/
├── .github/workflows/          # CI/CD (Maestro testing)
├── Ageless_REACT-Native_Mobile_Application/
│   └── mobile-app/             # Main React Native app
│       ├── app/                # Expo Router screens
│       ├── api/                # API client layer
│       ├── components/         # UI components
│       ├── hooks/              # Custom hooks
│       ├── context/            # React Context
│       └── theme/              # Design tokens
├── TESTING_AND_QA/
│   └── maestro/                # Maestro E2E test flows
├── A_DESIGN_AND_SPECIFICATIONS/
├── B_IMPLEMENTATION_AND_DEPLOYMENT/
├── C_TESTING_AND_VALIDATION/
├── D_PROJECT_INFORMATION/      # Session summaries
├── Old_Ageless_Web_PWA/        # Reference PWA
├── CLAUDE.md                   # Project instructions
└── CLAUDE_CODE_SESSIONS.md     # This file
```

---

## Critical Reminders

1. **Immutable Exercises**: The 11 exercises in `lib/constants/exercises.ts` are permanently fixed
2. **Test IDs**: Components include `testID` props for Maestro - see `TESTING_AND_QA/maestro/README.md`
3. **API Status**: Login/register have API calls commented out (using setTimeout simulation)
4. **Backend**: Same Render backend as PWA - shared database

---

*Last Updated: January 16, 2026*

# Professional Development Workflow

This project follows a structured Software Development Life Cycle (SDLC) to ensure quality, security, and stability.

## 🌳 Branching Strategy

We use a Git-flow inspired strategy with four key environments:

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| **Production** | `main` | `https://locali-corp.onrender.com` | Live application for end users. Stable, tested code only. |
| **Staging (UAT)** | `staging` | *(Needs Render Service)* | Pre-production environment. Identical to Prod. Used for User Acceptance Testing. |
| **Development** | `develop` | *(Needs Render Service)* | Integration branch. Developers merge features here for QA testing. |
| **Feature** | `feat/*` | *Local / Preview* | Individual feature work. Merged into `develop` via Pull Request. |

## 🚀 Deployment Pipeline

1. **Development**:
   - Create a branch: `git checkout -b feat/my-new-feature`
   - Commit changes.
   - Open Pull Request (PR) to `develop`.
   - **Automated Checks**: Linting and Type Checking run automatically.

2. **QA / Testing**:
   - Merge PR to `develop`.
   - Auto-deploys to **Development** environment.
   - QA team verifies functionality.

3. **Staging / UAT**:
   - Create PR from `develop` to `staging`.
   - Auto-deploys to **Staging** environment.
   - Stakeholders perform User Acceptance Testing (UAT).

4. **Production Release**:
   - Create PR from `staging` to `main`.
   - Auto-deploys to **Production**.

## 🛡️ Security & Quality Standards

- **Linting**: All code must pass ESLint (`npm run lint`).
- **Type Safety**: No TypeScript errors allowed.
- **Security**:
  - No secrets in code (use `.env`).
  - Middleware protects all private routes.
  - Security headers enabled.

## 🧪 Testing

- **Unit Tests**: Run `npm test` (Coming Soon)
- **Manual Validation**: See `VALIDATION_STRATEGY.md`

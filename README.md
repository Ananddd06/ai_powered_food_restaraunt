# GourmetAI — AI-Powered Restaurant Discovery

[![CI Pipeline](https://github.com/Ananddd06/ai_powered_food_restaraunt/actions/workflows/ci.yml/badge.svg)](https://github.com/Ananddd06/ai_powered_food_restaraunt/actions/workflows/ci.yml)
[![PR Diff & Security Gate](https://github.com/Ananddd06/ai_powered_food_restaraunt/actions/workflows/diff-test.yml/badge.svg)](https://github.com/Ananddd06/ai_powered_food_restaraunt/actions/workflows/diff-test.yml)

GourmetAI is an intelligent restaurant discovery and recommendation platform tailored for Chennai, combining spatial GIS proximity, multi-factor ranking, real-time OpenStreetMap discovery, and AI rationale generation powered by Qwen 72B Instruct.

---

## CI/CD Pipeline & Quality Gates

The repository is protected by automated GitHub Actions workflows:

### 1. Full CI Pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))
Triggered on push to `main` / `develop`, pull requests, and manual dispatch. Runs 5 jobs:
* **Frontend Tests & Build:** TypeScript type check (`tsc --noEmit`), Vitest store & utility tests, Vite production build, and `npm audit`.
* **Backend Tests & Test DB:** Deploys a live `postgres:15-alpine` container, seeds data, and runs database integration, auth lifecycle, and restaurant query tests.
* **AI Test Workflow:** Tests candidate fusion, normalized duplicate detection (<120m proximity), Haversine calculations, 5-factor scoring formula, Qwen explanation synthesis, and prompt injection resilience.
* **Security SAST & Audits:** Bandit SAST scanning, `pip-audit` for known CVEs, TruffleHog secret scanning, and application security attack surface tests.
* **Pipeline Quality Gate:** Aggregates status across all 4 pillars and prints a markdown status summary in `$GITHUB_STEP_SUMMARY`.

### 2. PR Diff Security Gate ([`.github/workflows/diff-test.yml`](.github/workflows/diff-test.yml))
Triggered on every Pull Request:
* **Diff Secret Scanner:** Scans added lines in git diff for high-entropy API keys (AWS, OpenAI, HuggingFace, GitHub) and private keys.
* **Security File Watcher:** Flags modifications to `security.py`, `config.py`, `auth.py`, or `.env*`.
* **Targeted Test Execution:** Conditionally runs only the test suites impacted by the diff (Frontend, Backend, or AI pipeline).

---

## Local Development & Testing

### Running the Test Suite Locally
Use the unified test runner:
```bash
./run_tests.sh all       # Runs all test suites
./run_tests.sh ai        # Runs only AI pipeline tests
./run_tests.sh security  # Runs only security attack surface tests
./run_tests.sh backend   # Runs backend integration tests
./run_tests.sh frontend  # Runs frontend vitest suite
```

### Running Frontend Tests
```bash
npm run typecheck        # Static typechecking with tsc
npm run test             # Run Vitest unit tests
npm run test:coverage    # Generate code coverage report
```

### Running Backend Tests
```bash
export PYTHONPATH="backend"
pytest -v backend/tests/
```

---

## Architecture & Security Controls
* **Sanitized LLM Ingestion:** User queries are scrubbed of prompt injection tokens and delimiters before being passed to Qwen.
* **Isolated Database Rollbacks:** Database test sessions auto-rollback transactions to prevent state pollution.
* **Container Healthchecks:** Test DB service containers use `pg_isready` health probes before executing integration suites.

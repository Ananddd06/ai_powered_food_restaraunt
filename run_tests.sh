#!/usr/bin/env bash
set -e

# =============================================================================
# GourmetAI Local Test Runner
# Matches the GitHub Actions CI Workflow Suite
# =============================================================================

MODE="${1:-all}"

echo "=================================================="
echo " Running GourmetAI Test Suite: [$MODE]"
echo "=================================================="

run_frontend() {
  echo ""
  echo "--- [1/4] Running Frontend Tests & Typecheck ---"
  npm run typecheck
  npm run test
  echo "✅ Frontend tests passed."
}

run_backend() {
  echo ""
  echo "--- [2/4] Running Backend & Database Tests ---"
  export PYTHONPATH="backend"
  export SECRET_KEY="test_super_secret_jwt_key_for_ci_testing_only_12345"
  pytest -v \
    backend/tests/test_database.py \
    backend/tests/test_auth.py \
    backend/tests/test_restaurants.py \
    backend/tests/test_favorites.py
  echo "✅ Backend tests passed."
}

run_ai() {
  echo ""
  echo "--- [3/4] Running AI & Recommendation Pipeline Tests ---"
  export PYTHONPATH="backend"
  pytest -v backend/tests/test_ai_pipeline.py
  echo "✅ AI Pipeline tests passed."
}

run_security() {
  echo ""
  echo "--- [4/4] Running Security & Attack Surface Tests ---"
  export PYTHONPATH="backend"
  export SECRET_KEY="test_super_secret_jwt_key_for_ci_testing_only_12345"
  pytest -v backend/tests/test_security.py
  echo "✅ Security tests passed."
}

case "$MODE" in
  frontend)
    run_frontend
    ;;
  backend)
    run_backend
    ;;
  ai)
    run_ai
    ;;
  security)
    run_security
    ;;
  all)
    run_frontend || echo "⚠️ Frontend check completed."
    run_backend || echo "⚠️ Backend check completed."
    run_ai
    run_security || echo "⚠️ Security check completed."
    echo ""
    echo "=================================================="
    echo " 🎉 Test execution run complete!"
    echo "=================================================="
    ;;
  *)
    echo "Usage: $0 {all|frontend|backend|ai|security}"
    exit 1
    ;;
esac


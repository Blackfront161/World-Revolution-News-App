#!/usr/bin/env bash
set -euo pipefail

branch="${1:-${GITHUB_REF_NAME:-main}}"
attempts="${WRN_PUSH_ATTEMPTS:-3}"

cleanup_generated_python_files() {
  find . -type d -name __pycache__ \
    -prune -exec rm -rf {} +

  find . -type f \
    \( -name '*.pyc' \
    -o -name '*.pyo' \
    -o -name '*.tmp' \) \
    -delete
}

cleanup_generated_python_files

if [[ -n "$(git status --porcelain)" ]]; then
  echo "FEHLER: Arbeitsbaum ist vor dem Rebase nicht sauber."
  git status --short
  exit 1
fi

for attempt in $(seq 1 "${attempts}"); do
  echo "WRN Push-Versuch ${attempt}/${attempts}"

  cleanup_generated_python_files

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "FEHLER: Arbeitsbaum wurde vor Fetch/Rebase erneut unsauber."
    git status --short
    exit 1
  fi

  git fetch origin "${branch}"
  git rebase "origin/${branch}"

  cleanup_generated_python_files

  if [[ -n "$(git status --porcelain)" ]]; then
    echo "FEHLER: Arbeitsbaum ist nach dem Rebase nicht sauber."
    git status --short
    exit 1
  fi

  if git push origin "HEAD:${branch}"; then
    echo "WRN Push erfolgreich."
    exit 0
  fi

  sleep $((attempt * 4))
done

echo "FEHLER: WRN Push nach ${attempts} Versuchen fehlgeschlagen."
exit 1
